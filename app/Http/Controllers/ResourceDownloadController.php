<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Models\ResourceFile;
use App\Services\AnalyticsReportService;
use App\Services\IsfResourcePdfGenerator;
use App\Services\ResourceContentParser;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ResourceDownloadController extends Controller
{
    public function __construct(
        public IsfResourcePdfGenerator $pdfGenerator,
        public ResourceContentParser $contentParser,
        public AnalyticsReportService $reportService,
    ) {}

    /**
     * Download or access a resource file and increment download counter.
     */
    public function download(Request $request, ResourceFile $resourceFile): Response|RedirectResponse
    {
        $resourceFile->incrementDownloads();

        if ($resourceFile->external_url) {
            return redirect()->away($resourceFile->external_url);
        }

        if ($resourceFile->file_path && Storage::disk('public')->exists($resourceFile->file_path)) {
            return response()->download(
                Storage::disk('public')->path($resourceFile->file_path),
                $resourceFile->file_name ?? basename($resourceFile->file_path)
            );
        }

        $pdfBinary = $this->pdfGenerator->generate($resourceFile);
        $filename = $resourceFile->file_name ?: ($resourceFile->slug.'.pdf');

        if (! str_ends_with(strtolower($filename), '.pdf')) {
            $filename .= '.pdf';
        }

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Content-Length' => (string) strlen($pdfBinary),
            'Cache-Control' => 'private, max-age=0, must-revalidate',
        ]);
    }

    /**
     * Render an A4 print-ready ISF-templated preview of the pet care resource guide.
     */
    public function preview(Request $request, ResourceFile $resourceFile): View
    {
        $theme = $this->contentParser->resolveTheme($resourceFile);
        $sections = $this->contentParser->parse($resourceFile->content);
        $brand = $this->reportService->resolveBrandAssets();

        $veterinaryPartners = Partner::active()
            ->veterinary()
            ->orderBy('display_order')
            ->take(3)
            ->get()
            ->map(fn (Partner $partner) => [
                'name' => (string) $partner->name,
                'location' => (string) ($partner->city ?: $partner->address ?: 'Iligan City'),
                'phone' => (string) ($partner->phone ?: 'Contact via ISF'),
                'hours' => (string) ($partner->operating_hours ?: 'Call for clinic hours'),
                'is_emergency' => (bool) $partner->is_emergency,
            ])
            ->values()
            ->all();

        if (count($veterinaryPartners) === 0) {
            $veterinaryPartners = [
                [
                    'name' => 'Dr. E Veterinary Clinic',
                    'location' => 'Tambo, Iligan City',
                    'phone' => '+63 956 381 9018',
                    'hours' => 'Mon - Sat: 8:00 AM – 7:00 PM | Sun: 9:00 AM – 3:00 PM',
                    'is_emergency' => true,
                ],
                [
                    'name' => 'Petmate Veterinary Clinic',
                    'location' => 'Camague / Tominobo, Iligan City',
                    'phone' => '+63 935 380 1820',
                    'hours' => 'Mon - Sat: 8:00 AM – 6:00 PM | Sun: 8:00 AM – 3:00 PM',
                    'is_emergency' => true,
                ],
                [
                    'name' => "Furpet'sake Veterinary Clinic",
                    'location' => 'Bagong Silang, Iligan City',
                    'phone' => '+63 917 105 0446',
                    'hours' => 'Mon - Sat: 9:00 AM – 6:00 PM',
                    'is_emergency' => true,
                ],
            ];
        }

        return view('resources.pdf-guide', [
            'resource' => $resourceFile,
            'theme' => $theme,
            'sections' => $sections,
            'brand' => $brand,
            'clinics' => $veterinaryPartners,
            'documentRef' => 'ISF-RES-'.str_pad((string) $resourceFile->id, 4, '0', STR_PAD_LEFT),
            'generatedAt' => now()->format('F d, Y • g:i A'),
            'downloadUrl' => route('resources.download', $resourceFile),
            'autoprint' => $request->boolean('autoprint'),
        ]);
    }
}
