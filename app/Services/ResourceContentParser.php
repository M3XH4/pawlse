<?php

namespace App\Services;

use App\Models\ResourceFile;

class ResourceContentParser
{
    /**
     * Parse structured markdown-like guide text into clean sections for PDFs and Blade previews.
     *
     * Supported syntax:
     * - "## Section Heading"
     * - "- Bullet point" or "• Bullet point"
     * - "Label: Value" (inside bullets or standalone short metadata lines)
     * - Regular paragraphs
     *
     * @return array<int, array{
     *     heading: string,
     *     paragraphs: array<int, string>,
     *     bullets: array<int, string>,
     *     kv: array<int, array{label: string, value: string}>
     * }>
     */
    public function parse(?string $content): array
    {
        $raw = trim((string) $content);

        if ($raw === '') {
            return [];
        }

        $lines = preg_split('/\r\n|\r|\n/', $raw) ?: [];
        $sections = [];
        $current = [
            'heading' => 'Resource Details & Guidelines',
            'paragraphs' => [],
            'bullets' => [],
            'kv' => [],
        ];
        $hasExplicitHeading = false;

        foreach ($lines as $rawLine) {
            $line = trim($rawLine);

            if ($line === '') {
                continue;
            }

            if (preg_match('/^#{1,3}\s+(.+)$/', $line, $matches) === 1) {
                if ($hasExplicitHeading || $this->sectionHasContent($current)) {
                    $sections[] = $current;
                }

                $current = [
                    'heading' => trim($matches[1]),
                    'paragraphs' => [],
                    'bullets' => [],
                    'kv' => [],
                ];
                $hasExplicitHeading = true;

                continue;
            }

            if (preg_match('/^(?:[-*•]|\d+\.)\s+(.+)$/u', $line, $matches) === 1) {
                $current['bullets'][] = trim($matches[1]);

                continue;
            }

            if (
                ! str_contains($line, 'http://')
                && ! str_contains($line, 'https://')
                && preg_match('/^([A-Za-z0-9 &\/\-\(\)]{2,36}):\s+(.+)$/', $line, $matches) === 1
                && mb_strlen($line) <= 180
            ) {
                $current['kv'][] = [
                    'label' => trim($matches[1]),
                    'value' => trim($matches[2]),
                ];

                continue;
            }

            $current['paragraphs'][] = $line;
        }

        if ($this->sectionHasContent($current)) {
            $sections[] = $current;
        }

        return $sections;
    }

    /**
     * Resolve visual theme accents, subtitles, and source labels matching the frontend resource cards.
     *
     * @return array{
     *     key: string,
     *     subtitle: string,
     *     source_label: string,
     *     category_label: string,
     *     accent_hex: string,
     *     accent_dark_hex: string,
     *     soft_bg_hex: string,
     *     border_hex: string,
     *     hero_gradient: string,
     *     accent_rgb: array{0: int, 1: int, 2: int},
     *     soft_rgb: array{0: int, 1: int, 2: int},
     *     border_rgb: array{0: int, 1: int, 2: int}
     * }
     */
    public function resolveTheme(ResourceFile $resource): array
    {
        $slug = strtolower((string) $resource->slug);
        $title = strtolower((string) $resource->title);
        $category = strtolower((string) $resource->category);

        if ($category === 'boarding' && (str_contains($slug, 'cat') || str_contains($title, 'cat'))) {
            return [
                'key' => 'boarding-cats',
                'subtitle' => 'Cat Boarding Resource',
                'source_label' => 'Iligan Stray Feeders Community Network',
                'category_label' => 'Feline Boarding Directory',
                'accent_hex' => '#D97706',
                'accent_dark_hex' => '#92400E',
                'soft_bg_hex' => '#FFFBEB',
                'border_hex' => '#FDE68A',
                'hero_gradient' => 'linear-gradient(135deg, #78350F 0%, #D97706 58%, #F59E0B 100%)',
                'accent_rgb' => [217, 119, 6],
                'soft_rgb' => [255, 251, 235],
                'border_rgb' => [253, 230, 138],
            ];
        }

        if ($category === 'boarding') {
            return [
                'key' => 'boarding-dogs',
                'subtitle' => 'Dog Boarding Resource',
                'source_label' => 'Iligan Stray Feeders Community Network',
                'category_label' => 'Canine Boarding Directory',
                'accent_hex' => '#0284C7',
                'accent_dark_hex' => '#075985',
                'soft_bg_hex' => '#F0F9FF',
                'border_hex' => '#BAE6FD',
                'hero_gradient' => 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 58%, #38BDF8 100%)',
                'accent_rgb' => [2, 132, 199],
                'soft_rgb' => [240, 249, 255],
                'border_rgb' => [186, 230, 253],
            ];
        }

        return match ($category) {
            'insurance' => [
                'key' => 'insurance',
                'subtitle' => 'Philippine Pet Coverage Guide',
                'source_label' => 'Iligan Stray Feeders Adopter Advisory',
                'category_label' => 'Pet Insurance Guide',
                'accent_hex' => '#4338CA',
                'accent_dark_hex' => '#312E81',
                'soft_bg_hex' => '#EEF2FF',
                'border_hex' => '#C7D2FE',
                'hero_gradient' => 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 58%, #6366F1 100%)',
                'accent_rgb' => [67, 56, 202],
                'soft_rgb' => [238, 242, 255],
                'border_rgb' => [199, 210, 254],
            ],
            'training' => [
                'key' => 'training',
                'subtitle' => 'Adopter Behavior & Obedience Guide',
                'source_label' => 'Iligan Stray Feeders Care Program',
                'category_label' => 'Pet Training Handbook',
                'accent_hex' => '#059669',
                'accent_dark_hex' => '#065F46',
                'soft_bg_hex' => '#ECFDF5',
                'border_hex' => '#A7F3D0',
                'hero_gradient' => 'linear-gradient(135deg, #064E3B 0%, #059669 58%, #10B981 100%)',
                'accent_rgb' => [5, 150, 105],
                'soft_rgb' => [236, 253, 245],
                'border_rgb' => [167, 243, 208],
            ],
            'memorial' => [
                'key' => 'memorial',
                'subtitle' => 'Pet Remembrance & Grief Support',
                'source_label' => 'Iligan Stray Feeders Community Care',
                'category_label' => 'Memorial & Remembrance',
                'accent_hex' => '#7C3AED',
                'accent_dark_hex' => '#5B21B6',
                'soft_bg_hex' => '#F5F3FF',
                'border_hex' => '#DDD6FE',
                'hero_gradient' => 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 58%, #A78BFA 100%)',
                'accent_rgb' => [124, 58, 237],
                'soft_rgb' => [245, 243, 255],
                'border_rgb' => [221, 214, 254],
            ],
            'portrait' => [
                'key' => 'portrait',
                'subtitle' => 'Community Pet Art & Commissions',
                'source_label' => 'Iligan Local Artists • 20% to ISF',
                'category_label' => 'Community Pet Portraits',
                'accent_hex' => '#E11D48',
                'accent_dark_hex' => '#9F1239',
                'soft_bg_hex' => '#FFF1F2',
                'border_hex' => '#FECDD3',
                'hero_gradient' => 'linear-gradient(135deg, #881337 0%, #E11D48 58%, #FB7185 100%)',
                'accent_rgb' => [225, 29, 72],
                'soft_rgb' => [255, 241, 242],
                'border_rgb' => [254, 205, 211],
            ],
            'emergency_protocol' => [
                'key' => 'emergency_protocol',
                'subtitle' => 'Field First Aid & Stabilization Protocol',
                'source_label' => 'Iligan Stray Feeders (ISF Official)',
                'category_label' => 'Emergency Field Protocol',
                'accent_hex' => '#DC2626',
                'accent_dark_hex' => '#991B1B',
                'soft_bg_hex' => '#FEF2F2',
                'border_hex' => '#FECACA',
                'hero_gradient' => 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 58%, #EF4444 100%)',
                'accent_rgb' => [220, 38, 38],
                'soft_rgb' => [254, 242, 242],
                'border_rgb' => [254, 202, 202],
            ],
            default => [
                'key' => 'care_guide',
                'subtitle' => 'Pet Care & Welfare Resource',
                'source_label' => 'Iligan Stray Feeders (ISF)',
                'category_label' => ucwords(str_replace('_', ' ', $category ?: 'care_guide')),
                'accent_hex' => '#0D9488',
                'accent_dark_hex' => '#115E59',
                'soft_bg_hex' => '#F0FDFA',
                'border_hex' => '#99F6E4',
                'hero_gradient' => 'linear-gradient(135deg, #0B2340 0%, #0F766E 58%, #14B8A6 100%)',
                'accent_rgb' => [13, 148, 136],
                'soft_rgb' => [240, 253, 250],
                'border_rgb' => [153, 246, 228],
            ],
        };
    }

    /**
     * Check whether a parsed section contains any renderable body content.
     *
     * @param  array{heading: string, paragraphs: array<int, string>, bullets: array<int, string>, kv: array<int, array{label: string, value: string}>}  $section
     */
    protected function sectionHasContent(array $section): bool
    {
        return count($section['paragraphs']) > 0
            || count($section['bullets']) > 0
            || count($section['kv']) > 0;
    }
}
