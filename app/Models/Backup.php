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

            $sql = self::generateMysqlDump();
            file_put_contents($dest, $sql);
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
            // MySQL
            $sql = file_get_contents($filePath);
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            DB::unprepared($sql);
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        return true;
    }

    /**
     * Generate MySQL database dump.
     */
    private static function generateMysqlDump(): string
    {
        $tables = [];
        $dbName = config('database.connections.mysql.database');

        $result = DB::select('SHOW TABLES');
        $keyName = 'Tables_in_'.$dbName;

        foreach ($result as $row) {
            $tables[] = $row->{$keyName} ?? current((array) $row);
        }

        $out = "-- PAWLSE Database Dump\n";
        $out .= '-- Generated at: '.now()->toDateTimeString()."\n";
        $out .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $table) {
            $out .= "DROP TABLE IF EXISTS `{$table}`;\n";

            $create = DB::select("SHOW CREATE TABLE `{$table}`");
            $createSql = (array) $create[0];
            $out .= $createSql['Create Table'].";\n\n";

            $rows = DB::table($table)->get();
            if ($rows->count() > 0) {
                $out .= "INSERT INTO `{$table}` VALUES \n";
                $insertRows = [];
                foreach ($rows as $row) {
                    $values = [];
                    foreach ((array) $row as $val) {
                        if ($val === null) {
                            $values[] = 'NULL';
                        } else {
                            $values[] = "'".addslashes($val)."'";
                        }
                    }
                    $insertRows[] = '('.implode(', ', $values).')';
                }
                $out .= implode(",\n", $insertRows).";\n\n";
            }
        }

        $out .= "SET FOREIGN_KEY_CHECKS=1;\n";

        return $out;
    }
}
