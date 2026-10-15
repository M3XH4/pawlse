<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Models\ResourceFile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VetController extends Controller
{
    /**
     * Display the Veterinary Care & Resources public directory.
     */
    public function index(Request $request): Response
    {
        $featuredClinic = Partner::active()
            ->veterinary()
            ->where('is_featured', true)
            ->first() ?? Partner::active()->veterinary()->first();

        $veterinaryClinics = Partner::active()
            ->veterinary()
            ->when($featuredClinic, fn ($q) => $q->where('id', '!=', $featuredClinic->id))
            ->orderBy('display_order')
            ->get();

        $emergencyClinics = Partner::active()
            ->emergency()
            ->orderBy('display_order')
            ->take(3)
            ->get();

        $petResources = ResourceFile::active()
            ->orderBy('display_order')
            ->get();

        $stats = [
            'trusted_clinics' => Partner::active()->veterinary()->count(),
            'vet_on_record' => 1,
            'emergency_contacts' => Partner::active()->emergency()->count(),
            'care_resources' => ResourceFile::active()->count(),
        ];

        $vetOnRecord = [
            'name' => 'Dr. Mykelle Elmer Rarao',
            'title' => 'Licensed Veterinarian (Veterinarian on Record)',
            'description' => 'Supervises medical care protocols and treatment coordination for animals rescued by Iligan Stray Feeders.',
            'clinic_hours' => 'Information to be updated',
            'contact' => 'Coordinated through ISF Emergency Desk',
            'address' => 'Iligan City, Lanao del Norte',
            'image' => '/images/partners/vet-record.jpg',
        ];

        return Inertia::render('vet', [
            'featuredClinic' => $featuredClinic,
            'veterinaryClinics' => $veterinaryClinics,
            'emergencyClinics' => $emergencyClinics,
            'petResources' => $petResources,
            'vetOnRecord' => $vetOnRecord,
            'stats' => $stats,
        ]);
    }
}
