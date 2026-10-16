<?php

namespace Database\Factories;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BlogPost>
 */
class BlogPostFactory extends Factory
{
    protected $model = BlogPost::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(5);
        $categories = array_keys(BlogPost::CATEGORIES);

        return [
            'author_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(100, 9999),
            'category' => fake()->randomElement($categories),
            'summary' => fake()->paragraph(2),
            'content' => fake()->paragraphs(4, true),
            'featured_image' => 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80',
            'tags' => ['Animal Welfare', 'Rescue', 'Iligan City'],
            'reading_time_minutes' => 3,
            'status' => 'published',
            'is_featured' => false,
            'views_count' => fake()->numberBetween(10, 500),
            'shares_count' => fake()->numberBetween(0, 50),
            'published_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    public function rescueStory(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'rescue_story',
        ]);
    }

    public function adoptionSuccess(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'adoption_success',
        ]);
    }

    public function announcement(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'announcement',
        ]);
    }

    public function communityAwareness(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'community_awareness',
        ]);
    }

    public function advocacyCampaign(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'advocacy_campaign',
        ]);
    }
}
