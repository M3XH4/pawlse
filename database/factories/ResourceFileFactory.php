<?php

namespace Database\Factories;

use App\Models\ResourceFile;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ResourceFile>
 */
class ResourceFileFactory extends Factory
{
    protected $model = ResourceFile::class;

    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::random(5),
            'category' => fake()->randomElement(['boarding', 'insurance', 'training', 'memorial', 'care_guide']),
            'badge' => 'COMMUNITY RESOURCE',
            'description' => fake()->sentence(),
            'content' => fake()->paragraph(),
            'file_name' => 'guide.pdf',
            'file_size' => '1.5 MB',
            'file_type' => 'pdf',
            'external_url' => null,
            'image_url' => '/images/resources/cat-boarding.jpg',
            'download_count' => fake()->numberBetween(0, 100),
            'is_featured' => fake()->boolean(20),
            'is_active' => true,
            'display_order' => 0,
        ];
    }
}
