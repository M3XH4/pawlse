<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Backup extends Model
{
    protected $fillable = [
        'filename',
        'disk',
        'size',
        'status',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    /**
     * Create a new backup.
     */
    public static function createBackup(): self
    {
        $dir = storage_path('app/backups');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $connection = config('database.default');
        $timestamp = now()->format('Y-m-d_H-i-s');
        $filename = "backup-{$connection}-{$timestamp}";

        if ($connection === 'sqlite') {
            $dbPath = config('database.connections.sqlite.database');
            $backupFile = "{$filename}.sqlite";
            $dest = "{$dir}/{$backupFile}";
            if ($dbPath === ':memory:') {
                file_put_contents($dest, 'sqlite memory database backup placeholder');
            } else {
                copy($dbPath, $dest);
            }
            $size = filesize($dest);
        } else {
            // MySQL
            $backupFile = "{$filename}.sql";
            $dest = "{$dir}/{$backupFile}";

            self::writeMysqlDump($dest);
            $size = filesize($dest);
        }

        return self::create([
            'filename' => $backupFile,
            'disk' => 'local',
            'size' => $size,
            'status' => 'completed',
        ]);
    }

    /**
     * Restore this backup.
     */
    public function restoreBackup(): bool
    {
        $dir = storage_path('app/backups');
        $filePath = "{$dir}/{$this->filename}";

        if (! file_exists($filePath)) {
            return false;
        }

        $connection = config('database.default');

        if ($connection === 'sqlite') {
            $dbPath = config('database.connections.sqlite.database');
            if ($dbPath !== ':memory:') {
                copy($filePath, $dbPath);
            }
        } else {
            // MySQL - stream execution line-by-line to avoid loading giant SQL dumps into memory
            $handle = fopen($filePath, 'r');
            if ($handle === false) {
                return false;
            }

            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            try {
                $statement = '';
                while (($line = fgets($handle)) !== false) {
                    $trimmed = trim($line);
                    if ($trimmed === '' || str_starts_with($trimmed, '--') || str_starts_with($trimmed, '/*')) {
                        continue;
                    }
                    $statement .= $line;
                    if (str_ends_with($trimmed, ';')) {
                        DB::unprepared($statement);
                        $statement = '';
                    }
                }
                if (trim($statement) !== '') {
                    DB::unprepared($statement);
                }
            } finally {
                fclose($handle);
                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            }
        }

        return true;
    }

    /**
     * Stream MySQL database dump directly to file in chunks to prevent memory exhaustion.
     */
    public static function writeMysqlDump(string $dest): void
    {
        $handle = fopen($dest, 'w');
        if ($handle === false) {
            throw new \RuntimeException("Unable to open backup file for writing: {$dest}");
        }

        $tables = [];
        $dbName = config('database.connections.mysql.database');

        $result = DB::select('SHOW TABLES');
        $keyName = 'Tables_in_'.$dbName;

        foreach ($result as $row) {
            $tables[] = $row->{$keyName} ?? current((array) $row);
        }

        fwrite($handle, "-- PAWLSE Database Dump\n");
        fwrite($handle, '-- Generated at: '.now()->toDateTimeString()."\n");
        fwrite($handle, "SET FOREIGN_KEY_CHECKS=0;\n\n");

        foreach ($tables as $table) {
            fwrite($handle, "DROP TABLE IF EXISTS `{$table}`;\n");

            $create = DB::select("SHOW CREATE TABLE `{$table}`");
            if (! empty($create)) {
                $createSql = (array) $create[0];
                fwrite($handle, ($createSql['Create Table'] ?? '').";\n\n");
            }

            DB::table($table)->orderBy(DB::raw('1'))->chunk(250, function ($rows) use ($handle, $table) {
                if ($rows->count() > 0) {
                    fwrite($handle, "INSERT INTO `{$table}` VALUES \n");
                    $insertRows = [];
                    foreach ($rows as $row) {
                        $values = [];
                        foreach ((array) $row as $val) {
                            if ($val === null) {
                                $values[] = 'NULL';
                            } else {
                                $values[] = "'".addslashes((string) $val)."'";
                            }
                        }
                        $insertRows[] = '('.implode(', ', $values).')';
                    }
                    fwrite($handle, implode(",\n", $insertRows).";\n\n");
                }
            });
        }

        fwrite($handle, "SET FOREIGN_KEY_CHECKS=1;\n");
        fclose($handle);
    }

    /**
     * Generate MySQL database dump as string (kept for backwards compatibility).
     */
    public static function generateMysqlDump(): string
    {
        $tempPath = tempnam(sys_get_temp_dir(), 'dump_');
        self::writeMysqlDump($tempPath);
        $content = file_get_contents($tempPath) ?: '';
        @unlink($tempPath);

        return $content;
    }
}
