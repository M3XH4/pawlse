<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ResourceFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ResourceManagementController extends Controller
{
    /**
     * Display Resource Management list with categories, files and stats.
     */
    public function index(Request $request): Response
    {
        $query = ResourceFile::withTrashed();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('badge', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('file_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('status')) {
            if ($request->input('status') === 'active') {
                $query->whereNull('deleted_at')->where('is_active', true);
            } elseif ($request->input('status') === 'inactive') {
                $query->whereNull('deleted_at')->where('is_active', false);
            } elseif ($request->input('status') === 'archived') {
                $query->onlyTrashed();
            }
        }

        $resources = $query->orderBy('display_order')
            ->orderBy('id', 'desc')
            ->paginate(12)
            ->withQueryString();

        $stats = [
            'total' => ResourceFile::count(),
            'downloads' => ResourceFile::sum('download_count'),
            'boarding' => ResourceFile::where('category', 'boarding')->count(),
            'guides' => ResourceFile::whereIn('category', ['training', 'care_guide', 'emergency_protocol'])->count(),
            'archived' => ResourceFile::onlyTrashed()->count(),
        ];

        return Inertia::render('super-admin/resource-management', [
            'resources' => $resources,
            'stats' => $stats,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    /**
     * Store a newly created Resource File in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:care_guide,boarding,insurance,training,memorial,portrait,emergency_protocol,general,audit_report,financial_audit'],
            'badge' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'file' => ['nullable', 'file', 'max:10240'], // 10MB
            'file_name' => ['nullable', 'string', 'max:255'],
            'file_type' => ['nullable', 'string', 'max:50'],
            'external_url' => ['nullable', 'url', 'max:255'],
            'image' => ['nullable', 'image', 'max:4096'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'display_order' => ['integer', 'min:0'],
        ]);

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            $path = $uploadedFile->store('resources', 'public');
            $validated['file_path'] = $path;
            $validated['file_name'] = $validated['file_name'] ?: $uploadedFile->getClientOriginalName();
            $validated['file_type'] = $uploadedFile->getClientOriginalExtension() ?: 'file';
            $sizeInBytes = $uploadedFile->getSize();
            $validated['file_size'] = $sizeInBytes > 1048576
                ? round($sizeInBytes / 1048576, 1).' MB'
                : round($sizeInBytes / 1024, 0).' KB';
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('resources/covers', 'public');
            $validated['image_url'] = '/storage/'.$path;
        }

        $validated['slug'] = Str::slug($validated['title']).'-'.Str::random(5);

        $resource = ResourceFile::create($validated);

        AuditLog::log('resource_create', "Created resource file {$resource->title} ({$resource->category})");

        return redirect()->back()->with('success', 'Resource file added successfully.');
    }

    /**
     * Update the specified Resource File.
     */
    public function update(Request $request, ResourceFile $resourceFile): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:care_guide,boarding,insurance,training,memorial,portrait,emergency_protocol,general,audit_report,financial_audit'],
            'badge' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'file' => ['nullable', 'file', 'max:10240'],
            'file_name' => ['nullable', 'string', 'max:255'],
            'file_type' => ['nullable', 'string', 'max:50'],
            'external_url' => ['nullable', 'url', 'max:255'],
            'image' => ['nullable', 'image', 'max:4096'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'display_order' => ['integer', 'min:0'],
        ]);

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            $path = $uploadedFile->store('resources', 'public');
            $validated['file_path'] = $path;
            $validated['file_name'] = $validated['file_name'] ?: $uploadedFile->getClientOriginalName();
            $validated['file_type'] = $uploadedFile->getClientOriginalExtension() ?: 'file';
            $sizeInBytes = $uploadedFile->getSize();
            $validated['file_size'] = $sizeInBytes > 1048576
                ? round($sizeInBytes / 1048576, 1).' MB'
                : round($sizeInBytes / 1024, 0).' KB';
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('resources/covers', 'public');
            $validated['image_url'] = '/storage/'.$path;
        }

        $resourceFile->update($validated);

        AuditLog::log('resource_update', "Updated resource file {$resourceFile->title}");

        return redirect()->back()->with('success', 'Resource file updated successfully.');
    }

    /**
     * Soft delete resource file.
     */
    public function destroy(ResourceFile $resourceFile): RedirectResponse
    {
        $title = $resourceFile->title;
        $resourceFile->delete();

        AuditLog::log('resource_delete', "Archived resource {$title}");

        return redirect()->back()->with('success', "Resource {$title} archived successfully.");
    }

    /**
     * Restore soft-deleted resource file.
     */
    public function restore(int $id): RedirectResponse
    {
        $resource = ResourceFile::withTrashed()->findOrFail($id);
        $resource->restore();

        AuditLog::log('resource_restore', "Restored resource {$resource->title}");

        return redirect()->back()->with('success', "Resource {$resource->title} restored successfully.");
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(ResourceFile $resourceFile): RedirectResponse
    {
        $resourceFile->update(['is_active' => ! $resourceFile->is_active]);

        AuditLog::log('resource_status_toggle', "Toggled status for {$resourceFile->title} to ".($resourceFile->is_active ? 'active' : 'inactive'));

        return redirect()->back()->with('success', 'Resource file status updated.');
    }
}
