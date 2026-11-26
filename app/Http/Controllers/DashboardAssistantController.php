<?php

namespace App\Http\Controllers;

use App\Models\AssistantFeedback;
use App\Models\SystemSetting;
use App\Services\DashboardAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardAssistantController extends Controller
{
    public function __construct(
        private readonly DashboardAssistantService $assistantService,
    ) {}

    /**
     * Return the initial permission-scoped summary and recommended actions.
     */
    public function summary(Request $request): JsonResponse
    {
        if (! $this->isAssistantEnabled()) {
            return response()->json([
                'message' => 'The Dashboard Assistant Chatbot is currently disabled by the Super Administrator.',
            ], 403);
        }

        $validated = $request->validate([
            'dashboard_role' => ['nullable', 'string', 'in:user,volunteer,admin,super-admin'],
            'page_path' => ['nullable', 'string', 'max:255'],
        ]);

        return response()->json(
            $this->assistantService->summarize(
                $request->user(),
                $validated['dashboard_role'] ?? null,
                $validated['page_path'] ?? null
            )
        );
    }

    /**
     * Process a user message and respond using permission-scoped database context.
     */
    public function chat(Request $request): JsonResponse
    {
        if (! $this->isAssistantEnabled()) {
            return response()->json([
                'message' => 'The Dashboard Assistant Chatbot is currently disabled by the Super Administrator.',
            ], 403);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:500'],
            'dashboard_role' => ['nullable', 'string', 'in:user,volunteer,admin,super-admin'],
            'page_path' => ['nullable', 'string', 'max:255'],
        ]);

        return response()->json(
            $this->assistantService->respond(
                $request->user(),
                $validated['message'],
                $validated['dashboard_role'] ?? null,
                $validated['page_path'] ?? null
            )
        );
    }

    /**
     * Execute a permission-gated one-click quick action.
     */
    public function quickAction(Request $request): JsonResponse
    {
        if (! $this->isAssistantEnabled()) {
            return response()->json([
                'message' => 'The Dashboard Assistant Chatbot is currently disabled by the Super Administrator.',
            ], 403);
        }

        $validated = $request->validate([
            'action_id' => ['required', 'string', 'in:mark_notifications_read,create_help_desk_ticket,run_database_backup'],
            'payload' => ['nullable', 'array'],
        ]);

        $result = $this->assistantService->executeQuickAction(
            $request->user(),
            $validated['action_id'],
            $validated['payload'] ?? []
        );

        return response()->json([
            'ok' => $result['ok'],
            'message' => $result['message'],
        ], $result['status']);
    }

    /**
     * Record 👍 / 👎 helpfulness feedback on an assistant reply.
     */
    public function feedback(Request $request): JsonResponse
    {
        if (! $this->isAssistantEnabled()) {
            return response()->json([
                'message' => 'The Dashboard Assistant Chatbot is currently disabled by the Super Administrator.',
            ], 403);
        }

        $validated = $request->validate([
            'feedback_id' => ['required', 'integer', 'exists:assistant_feedback,id'],
            'rating' => ['required', 'string', 'in:up,down'],
        ]);

        $record = AssistantFeedback::where('id', $validated['feedback_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $record->update([
            'rating' => $validated['rating'],
        ]);

        return response()->json([
            'ok' => true,
            'rating' => $record->rating,
        ]);
    }

    private function isAssistantEnabled(): bool
    {
        $settings = SystemSetting::getValue('system_settings', []);

        return (bool) ($settings['assistant_chatbot_enabled'] ?? true);
    }
}
