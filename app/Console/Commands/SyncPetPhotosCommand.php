<?php

namespace App\Console\Commands;

use App\Models\ShelterAnimal;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SyncPetPhotosCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pets:sync-photos';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync pet photos and galleries from storage/app/my_pets into public storage and update database records.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $baseDir = storage_path('app/my_pets');

        if (! File::isDirectory($baseDir)) {
            $this->error("Directory does not exist: {$baseDir}");

            return self::FAILURE;
        }

        $directories = File::directories($baseDir);
        $syncedCount = 0;

        $animals = ShelterAnimal::all();

        foreach ($directories as $dir) {
            $folderName = basename($dir);

            if ($folderName === '_example_pet' || Str::startsWith($folderName, '.')) {
                continue;
            }

            // Find matching animal: check exact match first, then prefix/alias match
            $target = strtolower(trim($folderName));
            $animal = $animals->first(function (ShelterAnimal $item) use ($target) {
                return strtolower(trim($item->name)) === $target;
            });

            if (! $animal) {
                $animal = $animals->first(function (ShelterAnimal $item) use ($target) {
                    $dbName = strtolower(trim($item->name));

                    // Handle aliases like "Genesis (KingKing)", "Spartan (TanTan)", "Puti Dako (TomTom)"
                    return Str::startsWith($dbName, $target) || Str::startsWith($target, $dbName);
                });
            }

            if (! $animal) {
                $this->warn("No database animal found matching folder: '{$folderName}'");

                continue;
            }

            $slug = Str::slug($folderName);
            $destinationDir = "pet_photos/{$slug}";

            // Ensure destination directories exist in public disk
            Storage::disk('public')->makeDirectory($destinationDir);
            Storage::disk('public')->makeDirectory("{$destinationDir}/gallery");

            // 1. Process Main Photo
            $mainPhotoUrl = null;
            $rootFiles = File::files($dir);
            $mainFile = null;

            foreach ($rootFiles as $file) {
                $filename = strtolower($file->getFilename());
                if (in_array($filename, ['photo.png', 'photo.jpg', 'photo.jpeg', 'main.png', 'main.jpg', 'avatar.png', 'avatar.jpg'], true)) {
                    $mainFile = $file;
                    break;
                }
            }

            // If not found by exact naming, pick the first image in the root directory
            if (! $mainFile) {
                foreach ($rootFiles as $file) {
                    $ext = strtolower($file->getExtension());
                    if (in_array($ext, ['png', 'jpg', 'jpeg', 'webp', 'gif'], true)) {
                        $mainFile = $file;
                        break;
                    }
                }
            }

            if ($mainFile) {
                $ext = $mainFile->getExtension();
                $targetRelativePath = "{$destinationDir}/photo.{$ext}";
                Storage::disk('public')->put(
                    $targetRelativePath,
                    File::get($mainFile->getRealPath())
                );
                $mainPhotoUrl = Storage::url($targetRelativePath);
            }

            // 2. Process Gallery Photos
            $galleryPhotos = [];
            $galleryDir = "{$dir}/gallery";

            if (File::isDirectory($galleryDir)) {
                $galleryFiles = File::files($galleryDir);
                foreach ($galleryFiles as $gFile) {
                    $ext = strtolower($gFile->getExtension());
                    if (in_array($ext, ['png', 'jpg', 'jpeg', 'webp'], true)) {
                        $safeFilename = Str::slug(pathinfo($gFile->getFilename(), PATHINFO_FILENAME)).'.'.$ext;
                        $gRelativePath = "{$destinationDir}/gallery/{$safeFilename}";

                        Storage::disk('public')->put(
                            $gRelativePath,
                            File::get($gFile->getRealPath())
                        );

                        $galleryPhotos[] = Storage::url($gRelativePath);
                    }
                }
            }

            // 3. Update Animal Model
            $animal->photo_url = $mainPhotoUrl ?: $animal->photo_url;
            $animal->gallery_photos = array_values(array_unique($galleryPhotos));
            $animal->before_photo_url = null;
            $animal->after_photo_url = null;
            $animal->save();

            $syncedCount++;
            $this->info("✓ Synced '{$animal->name}' with main photo and ".count($galleryPhotos).' gallery photo(s).');
        }

        $this->newLine();
        $this->info("Successfully synced {$syncedCount} pet(s) from storage/app/my_pets.");

        return self::SUCCESS;
    }
}
