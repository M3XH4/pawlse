<?php

namespace App\Http\Controllers;

use App\Models\AiPredictionLog;
use App\Models\SystemSetting;
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
        $settings = SystemSetting::getValue('ai_settings', [
            'ai_enabled' => true,
            'ai_reporting_enabled' => true,
            'ai_identifying_enabled' => true,
            'ai_confidence_threshold' => 0.70,
            'ai_auto_validation' => false,
        ]);

        if (! ($settings['ai_enabled'] ?? true)) {
            return response()->json(['message' => 'AI services are currently disabled by the system administrator.'], 403);
        }

        if (! ($settings['ai_identifying_enabled'] ?? true)) {
            return response()->json(['message' => 'AI pet identification is currently disabled.'], 403);
        }

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

        $data = $response->json();
        $confidence = $data['confidence'] ?? $data['score'] ?? ($data['predictions'][0]['confidence'] ?? null);

        $log = AiPredictionLog::create([
            'feature' => 'pet_prediction',
            'input_data' => ['image_name' => $request->file('image')->getClientOriginalName()],
            'output_data' => $data,
            'confidence' => $confidence,
            'is_accurate' => null,
        ]);

        return response()->json(array_merge($data, ['prediction_log_id' => $log->id]));
    }

    public function generateNames(Request $request)
    {
        $settings = SystemSetting::getValue('ai_settings', [
            'ai_enabled' => true,
            'ai_reporting_enabled' => true,
            'ai_identifying_enabled' => true,
            'ai_confidence_threshold' => 0.70,
            'ai_auto_validation' => false,
        ]);

        if (! ($settings['ai_enabled'] ?? true)) {
            return response()->json(['message' => 'AI services are currently disabled by the system administrator.'], 403);
        }

        $request->validate([
            'species' => ['required', 'in:cat,dog'],
            'gender' => ['required', 'in:male,female,neutral,unknown'],
        ]);

        $response = Http::timeout(60)->post(config('services.ai.url').'/generate-names', [
            'species' => $request->species,
            'gender' => $request->gender,
        ]);

        $data = $response->json();

        AiPredictionLog::create([
            'feature' => 'name_generation',
            'input_data' => $request->only(['species', 'gender']),
            'output_data' => $data,
            'confidence' => null,
            'is_accurate' => null,
        ]);

        return response()->json($data);
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
