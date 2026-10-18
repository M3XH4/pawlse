<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ContactMessage;
use App\Notifications\ContactMessageReceivedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class ContactController extends Controller
{
    /**
     * Store and email a newly submitted contact inquiry.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'category' => ['required', 'string', 'in:general,adoption,volunteer,donation,shelter_visit,partnership,other'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
        ]);

        $contactMessage = ContactMessage::create([
            ...$validated,
            'user_id' => $request->user()?->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'unread',
        ]);

        AuditLog::log(
            'contact_message_submitted',
            "Contact inquiry received from {$contactMessage->name} ({$contactMessage->email}) regarding {$contactMessage->subject}",
            [
                'contact_message_id' => $contactMessage->id,
                'category' => $contactMessage->category,
            ]
        );

        $recipientEmail = config('mail.from.address') ?: 'hello@pawlse.org';

        try {
            Notification::route('mail', $recipientEmail)
                ->notify(new ContactMessageReceivedNotification($contactMessage));
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch contact message email notification: '.$e->getMessage(), [
                'contact_message_id' => $contactMessage->id,
            ]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Thank you for reaching out! Your message has been sent to the PAWLSE team. We will get back to you shortly.',
        ]);

        return back();
    }
}
