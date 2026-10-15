<?php

namespace App\Http\Controllers;

use App\Models\ResourceFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ResourceDownloadController extends Controller
{
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

        // If no physical file on disk yet, generate a formatted informational text/PDF placeholder response
        $content = "PAWLSE & Iligan Stray Feeders Resource Guide\n\n";
        $content .= "Title: {$resourceFile->title}\n";
        $content .= "Category: {$resourceFile->category}\n";
        $content .= "Classification: {$resourceFile->badge}\n\n";
        $content .= "Description:\n{$resourceFile->description}\n\n";
        $content .= "Details & Guidelines:\n{$resourceFile->content}\n\n";
        $content .= "For assistance, contact Iligan Stray Feeders at help@iliganstrayfeeders.org or call 0912 345 6789.\n";

        $filename = $resourceFile->file_name ?? ($resourceFile->slug.'.txt');

        return response($content, 200, [
            'Content-Type' => 'text/plain',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
