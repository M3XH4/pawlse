<?php

namespace App\Http\Controllers;

use App\Models\AiPredictionLog;
use App\Models\SystemSetting;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PetController extends Controller
{
    public function index(AiService $aiService)
    {
        return Inertia::render('rescue', [
            'aiStatus' => $aiService->getAiFeatureStatus(),
        ]);
    }

    public function predict(Request $request)
    {
        @set_time_limit(120);

        $settings = SystemSetting::getValue('ai_settings', [
            'ai_enabled' => true,
            'ai_reporting_enabled' => true,
            'ai_identifying_enabled' => true,
            'ai_confidence_threshold' => 0.70,
            'ai_auto_validation' => false,
        ]);

        if (! ($settings['ai_enabled'] ?? true)) {
            return response()->json([
                'message' => 'AI services are currently disabled by the system administrator. Please use Manual Entry to fill in the pet details.',
            ], 403);
        }

        if (! ($settings['ai_identifying_enabled'] ?? true)) {
            return response()->json([
                'message' => 'AI pet identification is currently disabled. Please enter the animal details manually.',
            ], 403);
        }

        $request->validate([
            'image' => ['required', 'image', 'max:10240'],
        ]);

        try {
            $aiUrl = rtrim((string) config('services.ai.url', 'http://127.0.0.1:8000'), '/');
            $imageFile = $request->file('image');

            $response = Http::timeout(120)
                ->withHeaders([
                    'X-Internal-Token' => (string) config('services.ai.secret'),
                ])
                ->attach(
                    'file',
                    fopen($imageFile->getRealPath(), 'r'),
                    $imageFile->getClientOriginalName()
                )
                ->post($aiUrl.'/predict');

            if ($response->failed()) {
                $errorData = $response->json();
                $errorMessage = is_array($errorData) && isset($errorData['message'])
                    ? $errorData['message']
                    : (is_array($errorData) && isset($errorData['detail']) ? $errorData['detail'] : 'AI service encountered an error processing the image.');

                Log::warning('AI predict returned failure response: '.$response->status(), [
                    'body' => $errorData,
                ]);

                return response()->json([
                    'accepted' => false,
                    'message' => $errorMessage,
                    'error' => $errorData,
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
        } catch (\Throwable $e) {
            Log::error('AI predict failed: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'accepted' => false,
                'message' => 'AI service is currently unavailable or unreachable. Please use Manual Entry to submit your pet report.',
            ], 503);
        }
    }

    public function generateNames(Request $request)
    {
        @set_time_limit(60);

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

        try {
            $aiUrl = rtrim((string) config('services.ai.url', 'http://127.0.0.1:8000'), '/');
            $response = Http::timeout(60)
                ->withHeaders([
                    'X-Internal-Token' => (string) config('services.ai.secret'),
                ])
                ->post($aiUrl.'/generate-names', [
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
        } catch (\Throwable $e) {
            return response()->json([
                'species' => $request->species,
                'gender' => $request->gender,
                'names' => ['Buddy', 'Luna', 'Milo', 'Coco', 'Shadow'],
            ]);
        }
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
