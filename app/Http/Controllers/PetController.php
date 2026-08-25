<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PetController extends Controller
{
    public function index()
    {
        return Inertia::render('rescue');
    }

    public function predict(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'max:10240'],
        ]);

        $response = Http::timeout(120)
            ->attach(
                'file',
                file_get_contents($request->file('image')),
                $request->file('image')->getClientOriginalName()
            )
            ->post(config('services.ai.url').'/predict');

        if ($response->failed()) {
            return response()->json([
                'message' => 'AI service failed',
                'error' => $response->json(),
            ], 500);
        }

        return response()->json($response->json());
    }

    public function generateNames(Request $request)
    {
        $request->validate([
            'species' => ['required', 'in:cat,dog'],
            'gender' => ['required', 'in:male,female,neutral,unknown'],
        ]);

        $response = Http::timeout(60)->post(config('services.ai.url').'/generate-names', [
            'species' => $request->species,
            'gender' => $request->gender,
        ]);

        return response()->json($response->json());
    }

    // public function predict(Request $request) {
    //     $response = Http::attach(
    //         'file',
    //         file_get_contents($request->file('image')),
    //         'image.jpg'
    //     )->post('http://127.0.0.1:8000/predict');

    //     return Inertia::render('rescue', [
    //         'data' => $response->json()
    //     ]);
    // }

    // public function generateNames(Request $request) {
    //     $response = Http::post('http://127.0.0.1:8000/generate-names', [
    //         'species' => $request->species,
    //         'gender' => $request->gender
    //     ]);

    //     return response()->json($response->json());
    // }

}
