<?php

namespace App\Services;

use App\Models\Partner;
use App\Models\ResourceFile;

/**
 * Zero-dependency native PHP PDF 1.4 generator styled with the official
 * Iligan Stray Feeders (ISF) & PAWLSE letterhead template.
 */
class IsfResourcePdfGenerator
{
    private const float PAGE_WIDTH = 595.28;

    private const float PAGE_HEIGHT = 841.89;

    private const float MARGIN_X = 42.0;

    private const float CONTENT_WIDTH = 511.28; // 595.28 - 84

    private const float FOOTER_RESERVE = 64.0;

    /**
     * @var array<int, string>
     */
    private array $pages = [];

    private int $currentPageIndex = -1;

    private float $cursorY = 0.0;

    private string $documentRef = '';

    private string $documentTitle = '';

    /**
     * @var array{0: int, 1: int, 2: int}
     */
    private array $accentRgb = [13, 148, 136];

    private ?string $logoJpegBytes = null;

    private int $logoWidth = 0;

    private int $logoHeight = 0;

    public function __construct(
        public ResourceContentParser $contentParser,
        public AnalyticsReportService $reportService,
    ) {}

    /**
     * Build and return a valid binary PDF 1.4 document for the given resource file.
     */
    public function generate(ResourceFile $resource): string
    {
        $this->pages = [];
        $this->currentPageIndex = -1;
        $this->cursorY = 0.0;

        $theme = $this->contentParser->resolveTheme($resource);
        $sections = $this->contentParser->parse($resource->content);
        $brand = $this->reportService->resolveBrandAssets();
        $clinics = $this->resolveVeterinaryContacts();

        $this->accentRgb = $theme['accent_rgb'];
        $this->documentRef = 'ISF-RES-'.str_pad((string) $resource->id, 4, '0', STR_PAD_LEFT);
        $this->documentTitle = (string) $resource->title;

        $this->prepareLogoAsset();
        $this->startFirstPage($resource, $theme, $brand);

        // Overview Callout Box
        if (! empty($resource->description)) {
            $this->drawOverviewBox((string) $resource->description, $theme);
        }

        // Structured Resource Sections
        if (count($sections) > 0) {
            foreach ($sections as $section) {
                $this->drawSection($section, $theme);
            }
        } else {
            $this->drawSection([
                'heading' => 'Resource Summary & Coordination',
                'paragraphs' => [
                    'This guide is maintained by Iligan Stray Feeders (ISF) through the PAWLSE platform to help adopters, foster parents, and Iligan City pet owners access trusted care information.',
                ],
                'bullets' => [
                    'Reach out to ISF directly for updated local referrals or shelter intake coordination.',
                    'Always verify clinic hours, vaccine requirements, and service rates before scheduling visits.',
                ],
                'kv' => [],
            ], $theme);
        }

        // Live Iligan City Veterinary Partners & ISF Emergency Support Directory
        $this->drawVeterinaryDirectoryBox($clinics, $brand);

        // Community Disclaimer Box
        $this->drawDisclaimerBox($resource, $brand);

        // Stamp consistent official ISF footer across all pages
        $this->stampFooters($brand);

        return $this->assemblePdfBinary($resource, $brand);
    }

    /**
     * Initialize Page 1 with the full ISF / PAWLSE official letterhead banner & metadata strip.
     *
     * @param  array<string, mixed>  $theme
     * @param  array<string, mixed>  $brand
     */
    protected function startFirstPage(ResourceFile $resource, array $theme, array $brand): void
    {
        $this->pages[] = '';
        $this->currentPageIndex = 0;

        // Top Official ISF Navy Header Banner (y: 0 -> 114)
        $this->drawRect(0, 0, self::PAGE_WIDTH, 114, [11, 35, 64]);
        // Warm Amber Bottom Accent Strip
        $this->drawRect(0, 114, self::PAGE_WIDTH, 4, [245, 158, 11]);
        // Subtle Category Color Highlight Strip on Top Edge
        $this->drawRect(0, 0, self::PAGE_WIDTH, 4, $theme['accent_rgb']);

        // Logo Placement
        $textStartX = self::MARGIN_X;
        if ($this->logoJpegBytes !== null) {
            $this->drawImage('ImLogo', self::MARGIN_X, 24, 64, 64);
            $textStartX = self::MARGIN_X + 76;
        }

        // Brand Lockup Text
        $this->drawText($textStartX, 42, strtoupper((string) ($brand['app_name'] ?? 'PAWLSE')).'  |  ILIGAN STRAY FEEDERS', 'F2', 14.5, [255, 255, 255]);
        $this->drawText($textStartX, 58, 'Feed Furr A Cause  -  Official Pet Care Resource Guide', 'F1', 9.5, [253, 230, 138]);
        $this->drawText($textStartX, 74, 'Purok 13, Kiwalan, Iligan City, Lanao del Norte, Philippines', 'F1', 8.2, [203, 213, 225]);
        $this->drawText($textStartX, 86, ($brand['contact_email'] ?? 'help@iliganstrayfeeders.org').'  |  '.($brand['contact_phone'] ?? '+63 912 345 6789'), 'F1', 8.2, [148, 163, 184]);

        // Document Reference Box (Top Right)
        $refBoxW = 132.0;
        $refBoxX = self::PAGE_WIDTH - self::MARGIN_X - $refBoxW;
        $this->drawRect($refBoxX, 26, $refBoxW, 56, [23, 52, 87], [51, 86, 128], 0.8);
        $this->drawText($refBoxX + 10, 42, 'OFFICIAL ISF TEMPLATE', 'F2', 7.2, [253, 230, 138]);
        $this->drawText($refBoxX + 10, 56, $this->documentRef, 'F2', 10.5, [255, 255, 255]);
        $this->drawText($refBoxX + 10, 70, 'Issued: '.now()->format('M d, Y'), 'F1', 7.8, [203, 213, 225]);

        $this->cursorY = 134.0;

        // Classification Badge Pill + Resource Title
        $badgeText = strtoupper((string) ($resource->badge ?: 'COMMUNITY RESOURCE'));
        $badgeWidth = min(220.0, max(96.0, $this->estimateTextWidth($badgeText, 'F2', 7.5) + 18));
        $this->drawRect(self::MARGIN_X, $this->cursorY, $badgeWidth, 16, $theme['soft_rgb'], $theme['border_rgb'], 0.7);
        $this->drawText(self::MARGIN_X + 9, $this->cursorY + 11, $badgeText, 'F2', 7.5, $theme['accent_rgb']);

        $this->cursorY += 28.0;

        // Main Title (wrapped if long)
        $titleLines = $this->wrapText((string) $resource->title, 'F2', 18.0, self::CONTENT_WIDTH);
        foreach ($titleLines as $line) {
            $this->drawText(self::MARGIN_X, $this->cursorY, $line, 'F2', 18.0, [11, 35, 64]);
            $this->cursorY += 22.0;
        }

        // Subtitle & Source line
        $this->drawText(self::MARGIN_X, $this->cursorY - 3, $theme['subtitle'].'  |  Source: '.$theme['source_label'], 'F1', 9.2, [71, 85, 105]);
        $this->cursorY += 12.0;

        // Metadata Strip (4 columns)
        $metaH = 38.0;
        $this->drawRect(self::MARGIN_X, $this->cursorY, self::CONTENT_WIDTH, $metaH, [248, 250, 252], [226, 232, 240], 0.8);
        $colW = self::CONTENT_WIDTH / 4.0;
        $metaItems = [
            ['CATEGORY', $theme['category_label']],
            ['CLASSIFICATION', ucwords(strtolower($badgeText))],
            ['PUBLISHER', 'Iligan Stray Feeders'],
            ['DOCUMENT FILE', (string) ($resource->file_name ?: ($resource->slug.'.pdf'))],
        ];

        foreach ($metaItems as $idx => [$label, $value]) {
            $x = self::MARGIN_X + ($idx * $colW) + 8;
            if ($idx > 0) {
                $this->drawLine(self::MARGIN_X + ($idx * $colW), $this->cursorY + 6, self::MARGIN_X + ($idx * $colW), $this->cursorY + $metaH - 6, [226, 232, 240], 0.6);
            }
            $this->drawText($x, $this->cursorY + 13, $label, 'F2', 6.8, [100, 116, 139]);
            $truncated = $this->truncateToWidth($value, 'F2', 8.2, $colW - 14);
            $this->drawText($x, $this->cursorY + 27, $truncated, 'F2', 8.2, [15, 23, 42]);
        }

        $this->cursorY += $metaH + 16.0;
    }

    /**
     * Add a continuation page (Page 2+) with a clean compact ISF running header.
     */
    protected function addContinuationPage(): void
    {
        $this->pages[] = '';
        $this->currentPageIndex = count($this->pages) - 1;

        // Compact Top Running Bar
        $this->drawRect(0, 0, self::PAGE_WIDTH, 42, [11, 35, 64]);
        $this->drawRect(0, 42, self::PAGE_WIDTH, 2.5, [245, 158, 11]);
        $this->drawText(self::MARGIN_X, 25, 'PAWLSE  |  ILIGAN STRAY FEEDERS  -  '.$this->truncateToWidth($this->documentTitle, 'F2', 9.5, 310), 'F2', 9.5, [255, 255, 255]);
        $refText = 'REF: '.$this->documentRef;
        $refW = $this->estimateTextWidth($refText, 'F1', 8.2);
        $this->drawText(self::PAGE_WIDTH - self::MARGIN_X - $refW, 25, $refText, 'F1', 8.2, [253, 230, 138]);

        $this->cursorY = 64.0;
    }

    /**
     * Ensure enough vertical space exists on the current page before drawing a block.
     */
    protected function ensureSpace(float $requiredHeight): void
    {
        if ($this->cursorY + $requiredHeight > (self::PAGE_HEIGHT - self::FOOTER_RESERVE)) {
            $this->addContinuationPage();
        }
    }

    /**
     * Draw the highlighted Overview callout box.
     *
     * @param  array<string, mixed>  $theme
     */
    protected function drawOverviewBox(string $description, array $theme): void
    {
        $lines = $this->wrapText($description, 'F1', 9.6, self::CONTENT_WIDTH - 28);
        $boxHeight = 28.0 + (count($lines) * 14.0);
        $this->ensureSpace($boxHeight + 12);

        $this->drawRect(self::MARGIN_X, $this->cursorY, self::CONTENT_WIDTH, $boxHeight, $theme['soft_rgb'], $theme['border_rgb'], 0.8);
        $this->drawRect(self::MARGIN_X, $this->cursorY, 4.0, $boxHeight, $theme['accent_rgb']);

        $this->drawText(self::MARGIN_X + 14, $this->cursorY + 15, 'OVERVIEW', 'F2', 8.0, $theme['accent_rgb']);

        $lineY = $this->cursorY + 29;
        foreach ($lines as $line) {
            $this->drawText(self::MARGIN_X + 14, $lineY, $line, 'F1', 9.6, [30, 41, 59]);
            $lineY += 14.0;
        }

        $this->cursorY += $boxHeight + 16.0;
    }

    /**
     * Render a parsed structured guide section with heading, paragraphs, key-value cards, and checklists.
     *
     * @param  array{heading: string, paragraphs: array<int, string>, bullets: array<int, string>, kv: array<int, array{label: string, value: string}>}  $section
     * @param  array<string, mixed>  $theme
     */
    protected function drawSection(array $section, array $theme): void
    {
        $this->ensureSpace(48.0);

        // Section Heading with Colored Accent Bar & Divider
        $this->drawRect(self::MARGIN_X, $this->cursorY - 9, 4.0, 13.0, $theme['accent_rgb']);
        $this->drawText(self::MARGIN_X + 10, $this->cursorY + 1, strtoupper($section['heading']), 'F2', 10.5, [11, 35, 64]);
        $this->drawLine(self::MARGIN_X, $this->cursorY + 7, self::MARGIN_X + self::CONTENT_WIDTH, $this->cursorY + 7, $theme['border_rgb'], 1.0);
        $this->cursorY += 20.0;

        // Key-Value Metadata Rows (rendered in clean 2-column grid pairs)
        if (count($section['kv']) > 0) {
            $pairs = array_chunk($section['kv'], 2);
            foreach ($pairs as $pair) {
                $colW = (self::CONTENT_WIDTH - 10) / 2.0;
                $rowHeight = 32.0;

                // Estimate taller row if values wrap to 2 lines
                foreach ($pair as $kv) {
                    $valLines = $this->wrapText($kv['value'], 'F2', 8.8, $colW - 16);
                    $rowHeight = max($rowHeight, 18.0 + (count($valLines) * 12.0));
                }

                $this->ensureSpace($rowHeight + 6);

                foreach ($pair as $colIdx => $kv) {
                    $boxX = self::MARGIN_X + ($colIdx * ($colW + 10));
                    $this->drawRect($boxX, $this->cursorY, $colW, $rowHeight, [248, 250, 252], [226, 232, 240], 0.6);
                    $this->drawText($boxX + 8, $this->cursorY + 11, strtoupper($kv['label']), 'F2', 6.8, [100, 116, 139]);
                    $valLines = $this->wrapText($kv['value'], 'F2', 8.8, $colW - 16);
                    $vy = $this->cursorY + 23;
                    foreach ($valLines as $vline) {
                        $this->drawText($boxX + 8, $vy, $vline, 'F2', 8.8, [15, 23, 42]);
                        $vy += 11.5;
                    }
                }

                $this->cursorY += $rowHeight + 7.0;
            }

            $this->cursorY += 3.0;
        }

        // Body Paragraphs
        foreach ($section['paragraphs'] as $paragraph) {
            $lines = $this->wrapText($paragraph, 'F1', 9.4, self::CONTENT_WIDTH - 4);
            $blockHeight = count($lines) * 13.8;
            $this->ensureSpace($blockHeight + 6);

            foreach ($lines as $line) {
                $this->drawText(self::MARGIN_X + 2, $this->cursorY, $line, 'F1', 9.4, [51, 65, 85]);
                $this->cursorY += 13.8;
            }

            $this->cursorY += 5.0;
        }

        // Bulleted Checklists / Guidelines
        foreach ($section['bullets'] as $bullet) {
            $lines = $this->wrapText($bullet, 'F1', 9.2, self::CONTENT_WIDTH - 22);
            $blockHeight = count($lines) * 13.4;
            $this->ensureSpace($blockHeight + 4);

            // Warm Amber Bullet Square Marker
            $this->drawRect(self::MARGIN_X + 6, $this->cursorY - 6.5, 4.5, 4.5, [245, 158, 11]);

            foreach ($lines as $idx => $line) {
                $this->drawText(self::MARGIN_X + 18, $this->cursorY, $line, 'F1', 9.2, [30, 41, 59]);
                $this->cursorY += 13.4;
            }

            $this->cursorY += 3.5;
        }

        $this->cursorY += 8.0;
    }

    /**
     * Render live Iligan City partner veterinary contacts & ISF emergency desk box.
     *
     * @param  array<int, array{name: string, location: string, phone: string, hours: string}>  $clinics
     * @param  array<string, mixed>  $brand
     */
    protected function drawVeterinaryDirectoryBox(array $clinics, array $brand): void
    {
        $rowHeight = 20.0;
        $boxHeight = 46.0 + (count($clinics) * $rowHeight) + 22.0;
        $this->ensureSpace($boxHeight + 10);

        // Header Bar for Directory Box
        $this->drawRect(self::MARGIN_X, $this->cursorY, self::CONTENT_WIDTH, 24, [11, 35, 64]);
        $this->drawText(self::MARGIN_X + 12, $this->cursorY + 15.5, 'ILIGAN CITY VETERINARY CONTACTS & ISF COORDINATION DESK', 'F2', 8.5, [255, 255, 255]);

        $bodyY = $this->cursorY + 24;
        $bodyH = $boxHeight - 24;
        $this->drawRect(self::MARGIN_X, $bodyY, self::CONTENT_WIDTH, $bodyH, [248, 250, 252], [203, 213, 225], 0.8);

        // Table Header Row
        $this->drawRect(self::MARGIN_X + 1, $bodyY + 1, self::CONTENT_WIDTH - 2, 18, [241, 245, 249]);
        $this->drawText(self::MARGIN_X + 10, $bodyY + 13, 'CLINIC / PARTNER', 'F2', 7.2, [71, 85, 105]);
        $this->drawText(self::MARGIN_X + 172, $bodyY + 13, 'LOCATION', 'F2', 7.2, [71, 85, 105]);
        $this->drawText(self::MARGIN_X + 322, $bodyY + 13, 'CONTACT NUMBER', 'F2', 7.2, [71, 85, 105]);
        $this->drawText(self::MARGIN_X + 425, $bodyY + 13, 'STATUS', 'F2', 7.2, [71, 85, 105]);

        $rowY = $bodyY + 32;
        foreach ($clinics as $idx => $clinic) {
            if ($idx > 0) {
                $this->drawLine(self::MARGIN_X + 8, $rowY - 12, self::MARGIN_X + self::CONTENT_WIDTH - 8, $rowY - 12, [226, 232, 240], 0.5);
            }
            $this->drawText(self::MARGIN_X + 10, $rowY, $this->truncateToWidth($clinic['name'], 'F2', 8.3, 155), 'F2', 8.3, [15, 23, 42]);
            $this->drawText(self::MARGIN_X + 172, $rowY, $this->truncateToWidth($clinic['location'], 'F1', 8.1, 142), 'F1', 8.1, [71, 85, 105]);
            $this->drawText(self::MARGIN_X + 322, $rowY, $this->truncateToWidth($clinic['phone'], 'F2', 8.3, 98), 'F2', 8.3, [13, 148, 136]);
            $this->drawText(self::MARGIN_X + 425, $rowY, 'ISF Contact', 'F1', 7.8, [100, 116, 139]);
            $rowY += $rowHeight;
        }

        // ISF Shelter Desk Sub-footer inside box
        $this->drawLine(self::MARGIN_X + 8, $rowY - 10, self::MARGIN_X + self::CONTENT_WIDTH - 8, $rowY - 10, [203, 213, 225], 0.6);
        $deskText = 'ISF Shelter Desk: Purok 13, Kiwalan, Iligan City  |  '.($brand['contact_email'] ?? 'help@iliganstrayfeeders.org').'  |  '.($brand['contact_phone'] ?? '+63 912 345 6789');
        $this->drawText(self::MARGIN_X + 10, $rowY + 3, $this->truncateToWidth($deskText, 'F1', 7.8, self::CONTENT_WIDTH - 20), 'F1', 7.8, [71, 85, 105]);

        $this->cursorY += $boxHeight + 12.0;
    }

    /**
     * Draw the official ISF community transparency & verification note.
     *
     * @param  array<string, mixed>  $brand
     */
    protected function drawDisclaimerBox(ResourceFile $resource, array $brand): void
    {
        $note = 'ISF Transparency Note: This resource guide is published by Iligan Stray Feeders (ISF) via '.($brand['app_name'] ?? 'PAWLSE').' for educational and community referral purposes. Listings marked Community Resource or Informational Resource are independent recommendations; please confirm current rates, schedules, and veterinary credentials directly with providers.';
        $lines = $this->wrapText($note, 'F1', 8.0, self::CONTENT_WIDTH - 20);
        $boxHeight = 14.0 + (count($lines) * 11.2);
        $this->ensureSpace($boxHeight + 6);

        $this->drawRect(self::MARGIN_X, $this->cursorY, self::CONTENT_WIDTH, $boxHeight, [255, 251, 235], [253, 230, 138], 0.7);
        $y = $this->cursorY + 13;
        foreach ($lines as $line) {
            $this->drawText(self::MARGIN_X + 10, $y, $line, 'F1', 8.0, [146, 64, 14]);
            $y += 11.2;
        }

        $this->cursorY += $boxHeight + 8.0;
    }

    /**
     * Stamp a uniform official footer with page numbering on every page.
     *
     * @param  array<string, mixed>  $brand
     */
    protected function stampFooters(array $brand): void
    {
        $totalPages = count($this->pages);
        $footerTop = self::PAGE_HEIGHT - 44.0;

        for ($i = 0; $i < $totalPages; $i++) {
            $this->currentPageIndex = $i;
            $this->drawLine(self::MARGIN_X, $footerTop, self::MARGIN_X + self::CONTENT_WIDTH, $footerTop, [203, 213, 225], 0.7);
            $leftText = '© '.now()->year.' Iligan Stray Feeders (Feed Furr A Cause)  |  '.($brand['app_name'] ?? 'PAWLSE').' Pet Care Resource  |  '.$this->documentRef;
            $this->drawText(self::MARGIN_X, $footerTop + 14, $leftText, 'F1', 7.6, [100, 116, 139]);

            $pageLabel = 'Page '.($i + 1).' of '.$totalPages;
            $pageW = $this->estimateTextWidth($pageLabel, 'F2', 8.0);
            $this->drawText(self::MARGIN_X + self::CONTENT_WIDTH - $pageW, $footerTop + 14, $pageLabel, 'F2', 8.0, [11, 35, 64]);
        }
    }

    /**
     * Load active veterinary clinics from database (falling back safely if unseeded).
     *
     * @return array<int, array{name: string, location: string, phone: string, hours: string}>
     */
    protected function resolveVeterinaryContacts(): array
    {
        $partners = Partner::active()
            ->veterinary()
            ->orderBy('display_order')
            ->take(3)
            ->get();

        if ($partners->isNotEmpty()) {
            return $partners->map(fn (Partner $partner) => [
                'name' => (string) $partner->name,
                'location' => (string) ($partner->city ?: $partner->address ?: 'Iligan City'),
                'phone' => (string) ($partner->phone ?: 'Contact via ISF'),
                'hours' => (string) ($partner->operating_hours ?: 'Call for hours'),
            ])->values()->all();
        }

        return [
            [
                'name' => 'Dr. E Veterinary Clinic',
                'location' => 'Tambo, Iligan City',
                'phone' => '+63 956 381 9018',
                'hours' => 'Mon-Sat: 8:00 AM - 7:00 PM',
            ],
            [
                'name' => 'Petmate Veterinary Clinic',
                'location' => 'Camague / Tominobo, Iligan City',
                'phone' => '+63 935 380 1820',
                'hours' => 'Mon-Sat: 8:00 AM - 6:00 PM',
            ],
            [
                'name' => "Furpet'sake Veterinary Clinic",
                'location' => 'Bagong Silang, Iligan City',
                'phone' => '+63 917 105 0446',
                'hours' => 'Mon-Sat: 9:00 AM - 6:00 PM',
            ],
        ];
    }

    /**
     * Prepare the ISF circular logo composited onto the navy header color as a crisp RGB JPEG.
     */
    protected function prepareLogoAsset(): void
    {
        $this->logoJpegBytes = null;
        $this->logoWidth = 0;
        $this->logoHeight = 0;

        if (! function_exists('imagecreatefrompng') || ! function_exists('imagejpeg')) {
            return;
        }

        $logoPath = public_path('images/logo.png');
        if (! file_exists($logoPath) || ! is_readable($logoPath)) {
            $logoPath = public_path('images/email-logo.png');
        }

        if (! file_exists($logoPath) || ! is_readable($logoPath)) {
            return;
        }

        $src = @imagecreatefrompng($logoPath);
        if (! $src) {
            return;
        }

        $size = 192;
        $canvas = imagecreatetruecolor($size, $size);
        if (! $canvas) {
            imagedestroy($src);

            return;
        }

        // Fill background with ISF header navy (#0B2340) so PNG transparency blends cleanly
        $navy = imagecolorallocate($canvas, 11, 35, 64);
        imagefill($canvas, 0, 0, $navy);

        // Draw subtle white circular ring behind logo
        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefilledellipse($canvas, (int) ($size / 2), (int) ($size / 2), $size - 4, $size - 4, $white);

        $srcW = imagesx($src);
        $srcH = imagesy($src);
        imagealphablending($canvas, true);
        imagecopyresampled($canvas, $src, 6, 6, 0, 0, $size - 12, $size - 12, $srcW, $srcH);

        ob_start();
        imagejpeg($canvas, null, 92);
        $jpeg = ob_get_clean();

        imagedestroy($src);
        imagedestroy($canvas);

        if (is_string($jpeg) && $jpeg !== '') {
            $this->logoJpegBytes = $jpeg;
            $this->logoWidth = $size;
            $this->logoHeight = $size;
        }
    }

    /**
     * Draw a filled and optionally stroked rectangle using top-down coordinates.
     *
     * @param  array{0: int, 1: int, 2: int}  $fillRgb
     * @param  array{0: int, 1: int, 2: int}|null  $strokeRgb
     */
    protected function drawRect(
        float $x,
        float $y,
        float $w,
        float $h,
        array $fillRgb,
        ?array $strokeRgb = null,
        float $lineWidth = 0.8,
    ): void {
        $pdfY = self::PAGE_HEIGHT - $y - $h;
        $cmd = "q\n";
        $cmd .= sprintf("%.3F %.3F %.3F rg\n", $fillRgb[0] / 255, $fillRgb[1] / 255, $fillRgb[2] / 255);

        if ($strokeRgb !== null) {
            $cmd .= sprintf("%.3F %.3F %.3F RG %.2F w\n", $strokeRgb[0] / 255, $strokeRgb[1] / 255, $strokeRgb[2] / 255, $lineWidth);
            $cmd .= sprintf("%.2F %.2F %.2F %.2F re B\n", $x, $pdfY, $w, $h);
        } else {
            $cmd .= sprintf("%.2F %.2F %.2F %.2F re f\n", $x, $pdfY, $w, $h);
        }

        $cmd .= "Q\n";
        $this->appendStream($cmd);
    }

    /**
     * Draw a horizontal/vertical line using top-down coordinates.
     *
     * @param  array{0: int, 1: int, 2: int}  $rgb
     */
    protected function drawLine(float $x1, float $y1, float $x2, float $y2, array $rgb, float $width = 0.8): void
    {
        $py1 = self::PAGE_HEIGHT - $y1;
        $py2 = self::PAGE_HEIGHT - $y2;

        $cmd = sprintf(
            "q %.3F %.3F %.3F RG %.2F w %.2F %.2F m %.2F %.2F l S Q\n",
            $rgb[0] / 255,
            $rgb[1] / 255,
            $rgb[2] / 255,
            $width,
            $x1,
            $py1,
            $x2,
            $py2,
        );

        $this->appendStream($cmd);
    }

    /**
     * Draw a single line of text at top-down coordinates.
     *
     * @param  array{0: int, 1: int, 2: int}  $rgb
     */
    protected function drawText(float $x, float $y, string $text, string $fontKey, float $fontSize, array $rgb): void
    {
        $pdfY = self::PAGE_HEIGHT - $y;
        $encoded = $this->escapePdfString($this->toWinAnsi($text));

        $cmd = sprintf(
            "BT /%s %.2F Tf %.3F %.3F %.3F rg 1 0 0 1 %.2F %.2F Tm (%s) Tj ET\n",
            $fontKey,
            $fontSize,
            $rgb[0] / 255,
            $rgb[1] / 255,
            $rgb[2] / 255,
            $x,
            $pdfY,
            $encoded,
        );

        $this->appendStream($cmd);
    }

    /**
     * Place an embedded XObject image at top-down coordinates.
     */
    protected function drawImage(string $imageName, float $x, float $y, float $w, float $h): void
    {
        $pdfY = self::PAGE_HEIGHT - $y - $h;
        $cmd = sprintf("q %.2F 0 0 %.2F %.2F %.2F cm /%s Do Q\n", $w, $h, $x, $pdfY, $imageName);
        $this->appendStream($cmd);
    }

    protected function appendStream(string $command): void
    {
        $this->pages[$this->currentPageIndex] .= $command;
    }

    /**
     * Word-wrap text neatly within a target point width.
     *
     * @return array<int, string>
     */
    protected function wrapText(string $text, string $fontKey, float $fontSize, float $maxWidth): array
    {
        $normalized = trim(preg_replace('/\s+/', ' ', $this->toWinAnsi($text)) ?? '');
        if ($normalized === '') {
            return [];
        }

        $words = explode(' ', $normalized);
        $lines = [];
        $current = '';

        foreach ($words as $word) {
            $candidate = $current === '' ? $word : $current.' '.$word;
            if ($this->estimateTextWidth($candidate, $fontKey, $fontSize) <= $maxWidth) {
                $current = $candidate;
            } else {
                if ($current !== '') {
                    $lines[] = $current;
                }
                $current = $word;
            }
        }

        if ($current !== '') {
            $lines[] = $current;
        }

        return $lines;
    }

    protected function truncateToWidth(string $text, string $fontKey, float $fontSize, float $maxWidth): string
    {
        $clean = trim($this->toWinAnsi($text));
        if ($this->estimateTextWidth($clean, $fontKey, $fontSize) <= $maxWidth) {
            return $clean;
        }

        while (strlen($clean) > 3 && $this->estimateTextWidth($clean.'...', $fontKey, $fontSize) > $maxWidth) {
            $clean = substr($clean, 0, -1);
        }

        return rtrim($clean).'...';
    }

    /**
     * Approximate Helvetica / Helvetica-Bold string width in PDF points.
     */
    protected function estimateTextWidth(string $text, string $fontKey, float $fontSize): float
    {
        $isBold = $fontKey === 'F2';
        $factor = $isBold ? 1.04 : 1.0;
        $units = 0.0;
        $length = strlen($text);

        for ($i = 0; $i < $length; $i++) {
            $ch = $text[$i];
            if ($ch === ' ') {
                $units += 0.28;
            } elseif (str_contains('ilIjtfr.,:;!|\'`', $ch)) {
                $units += 0.27;
            } elseif (str_contains('mwMW@%', $ch)) {
                $units += 0.84;
            } elseif ($ch >= 'A' && $ch <= 'Z') {
                $units += 0.67;
            } elseif ($ch >= '0' && $ch <= '9') {
                $units += 0.56;
            } else {
                $units += 0.52;
            }
        }

        return $units * $fontSize * $factor;
    }

    /**
     * Convert UTF-8 string safely to WinAnsi (Windows-1252) for built-in Helvetica PDF Type1 fonts.
     */
    protected function toWinAnsi(string $text): string
    {
        $replacements = [
            '₱' => 'PHP ',
            '—' => ' - ',
            '–' => '-',
            '•' => '-',
            '“' => '"',
            '”' => '"',
            '‘' => "'",
            '’' => "'",
            '…' => '...',
            '✓' => '[x]',
            '✔' => '[x]',
            '→' => '->',
            '←' => '<-',
            '©' => '(c)',
            "\xC2\xA0" => ' ',
        ];

        $text = str_replace(array_keys($replacements), array_values($replacements), $text);

        if (function_exists('mb_convert_encoding')) {
            $converted = @mb_convert_encoding($text, 'Windows-1252', 'UTF-8');
            if (is_string($converted)) {
                return $converted;
            }
        }

        return preg_replace('/[^\x20-\x7E]/', '', $text) ?? $text;
    }

    protected function escapePdfString(string $text): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
    }

    /**
     * Assemble all PDF objects, cross-reference table, and trailer into a valid PDF 1.4 binary.
     *
     * @param  array<string, mixed>  $brand
     */
    protected function assemblePdfBinary(ResourceFile $resource, array $brand): string
    {
        $objects = [];

        // Object 1: Catalog (placeholder, updated once Pages id is known)
        $objects[1] = '';
        // Object 2: Pages tree (placeholder)
        $objects[2] = '';
        // Object 3: Helvetica Regular
        $objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
        // Object 4: Helvetica Bold
        $objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

        $nextId = 5;
        $logoObjId = null;

        if ($this->logoJpegBytes !== null) {
            $logoObjId = $nextId++;
            $logoLen = strlen($this->logoJpegBytes);
            $objects[$logoObjId] = "<< /Type /XObject /Subtype /Image /Width {$this->logoWidth} /Height {$this->logoHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length {$logoLen} >>\nstream\n{$this->logoJpegBytes}\nendstream";
        }

        $xObjectPart = $logoObjId !== null ? " /XObject << /ImLogo {$logoObjId} 0 R >>" : '';
        $resourcesDict = "<< /Font << /F1 3 0 R /F2 4 0 R >>{$xObjectPart} >>";

        $pageObjectIds = [];
        foreach ($this->pages as $stream) {
            $contentObjId = $nextId++;
            $pageObjId = $nextId++;
            $streamLen = strlen($stream);

            $objects[$contentObjId] = "<< /Length {$streamLen} >>\nstream\n{$stream}\nendstream";
            $objects[$pageObjId] = sprintf(
                '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %.2F %.2F] /Resources %s /Contents %d 0 R >>',
                self::PAGE_WIDTH,
                self::PAGE_HEIGHT,
                $resourcesDict,
                $contentObjId,
            );
            $pageObjectIds[] = $pageObjId;
        }

        // Info dictionary
        $infoObjId = $nextId++;
        $pdfTitle = $this->escapePdfString($this->toWinAnsi($resource->title.' - Iligan Stray Feeders'));
        $pdfAuthor = $this->escapePdfString($this->toWinAnsi(($brand['organization_name'] ?? 'Iligan Stray Feeders & PAWLSE Network')));
        $pdfSubject = $this->escapePdfString($this->toWinAnsi('Official ISF Pet Care Resource Guide'));
        $objects[$infoObjId] = "<< /Title ({$pdfTitle}) /Author ({$pdfAuthor}) /Subject ({$pdfSubject}) /Creator (PAWLSE ISF Resource Template) >>";

        $kidsRefs = implode(' ', array_map(fn (int $id) => "{$id} 0 R", $pageObjectIds));
        $objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
        $objects[2] = '<< /Type /Pages /Kids ['.$kidsRefs.'] /Count '.count($pageObjectIds).' >>';

        ksort($objects);

        $pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
        $offsets = [0 => 0];

        foreach ($objects as $id => $body) {
            $offsets[$id] = strlen($pdf);
            $pdf .= "{$id} 0 obj\n{$body}\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $totalObjects = count($objects) + 1;
        $pdf .= "xref\n0 {$totalObjects}\n";
        $pdf .= "0000000000 65535 f \n";

        for ($id = 1; $id <= count($objects); $id++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$id]);
        }

        $pdf .= "trailer\n<< /Size {$totalObjects} /Root 1 0 R /Info {$infoObjId} 0 R >>\n";
        $pdf .= "startxref\n{$xrefOffset}\n%%EOF\n";

        return $pdf;
    }
}
