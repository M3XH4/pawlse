<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\FrequentProblem;
use App\Models\HelpDeskTicket;
use App\Models\User;
use App\Notifications\HelpDeskTicketCreatedNotification;
use App\Notifications\HelpDeskTicketRepliedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HelpDeskController extends Controller
{
    /**
     * User Help Desk dashboard page.
     */
    public function userIndex(Request $request): Response
    {
        $user = $request->user();

        $tickets = HelpDeskTicket::where('user_id', $user->id)
            ->with(['replies' => fn ($q) => $q->where('is_internal_note', false)->with('user:id,name,role,avatar_path'), 'resolvedBy:id,name'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $faqQuery = FrequentProblem::published()->forAudience('user');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $faqQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('problem_description', 'like', "%{$search}%")
                    ->orWhere('solution', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('faq_category') && $request->input('faq_category') !== 'all') {
            $faqQuery->where('category', $request->input('faq_category'));
        }

        $frequentProblems = $faqQuery->orderBy('display_order')
            ->orderByDesc('helpful_count')
            ->get();

        $categories = FrequentProblem::published()
            ->forAudience('user')
            ->distinct()
            ->pluck('category');

        $stats = [
            'total_tickets' => HelpDeskTicket::where('user_id', $user->id)->count(),
            'open_tickets' => HelpDeskTicket::where('user_id', $user->id)->open()->count(),
            'resolved_tickets' => HelpDeskTicket::where('user_id', $user->id)->where('status', 'resolved')->count(),
            'faqs_count' => FrequentProblem::published()->forAudience('user')->count(),
        ];

        return Inertia::render('user/help-desk', [
            'tickets' => $tickets,
            'frequentProblems' => $frequentProblems,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search', 'faq_category']),
        ]);
    }

    /**
     * Volunteer Help Desk dashboard page.
     */
    public function volunteerIndex(Request $request): Response
    {
        $user = $request->user();

        $tickets = HelpDeskTicket::where('user_id', $user->id)
            ->with(['replies' => fn ($q) => $q->where('is_internal_note', false)->with('user:id,name,role,avatar_path'), 'resolvedBy:id,name'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $faqQuery = FrequentProblem::published()->forAudience('volunteer');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $faqQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('problem_description', 'like', "%{$search}%")
                    ->orWhere('solution', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('faq_category') && $request->input('faq_category') !== 'all') {
            $faqQuery->where('category', $request->input('faq_category'));
        }

        $frequentProblems = $faqQuery->orderBy('display_order')
            ->orderByDesc('helpful_count')
            ->get();

        $categories = FrequentProblem::published()
            ->forAudience('volunteer')
            ->distinct()
            ->pluck('category');

        $stats = [
            'total_tickets' => HelpDeskTicket::where('user_id', $user->id)->count(),
            'open_tickets' => HelpDeskTicket::where('user_id', $user->id)->open()->count(),
            'resolved_tickets' => HelpDeskTicket::where('user_id', $user->id)->where('status', 'resolved')->count(),
            'faqs_count' => FrequentProblem::published()->forAudience('volunteer')->count(),
        ];

        return Inertia::render('volunteer/help-desk', [
            'tickets' => $tickets,
            'frequentProblems' => $frequentProblems,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search', 'faq_category']),
        ]);
    }

    /**
     * Store a newly created support ticket from user or volunteer.
     */
    public function storeTicket(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'priority' => ['required', 'string', 'in:low,medium,high,urgent'],
            'description' => ['required', 'string', 'min:10', 'max:5000'],
        ]);

        $ticket = HelpDeskTicket::create([
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'description' => $validated['description'],
            'status' => 'open',
            'target_role' => 'admin',
        ]);

        // Notify admins
        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        foreach ($admins as $admin) {
            $admin->notify(new HelpDeskTicketCreatedNotification($ticket));
        }

        return back()->with('success', "Ticket #{$ticket->ticket_number} created successfully. Our team will review and respond promptly.");
    }

    /**
     * Post a reply to an existing ticket.
     */
    public function replyTicket(Request $request, HelpDeskTicket $ticket): RedirectResponse
    {
        $user = $request->user();

        // Ensure user can only reply to their own ticket
        abort_unless($ticket->user_id === $user->id || in_array($user->role, [Role::Admin->value, Role::SuperAdmin->value], true), 403);

        $validated = $request->validate([
            'message' => ['required', 'string', 'min:2', 'max:5000'],
        ]);

        $reply = $ticket->replies()->create([
            'user_id' => $user->id,
            'message' => $validated['message'],
            'is_internal_note' => false,
        ]);

        // If ticket was waiting on user or resolved, change status back to open/in_progress
        if (in_array($ticket->status, ['waiting_on_user', 'resolved', 'closed'], true)) {
            $ticket->update(['status' => 'in_progress']);
        }

        // Notify admins or assigned user
        $notifyUsers = $ticket->assignedTo
            ? collect([$ticket->assignedTo])
            : User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();

        foreach ($notifyUsers as $notifyUser) {
            if ($notifyUser->id !== $user->id) {
                $notifyUser->notify(new HelpDeskTicketRepliedNotification($ticket, $reply));
            }
        }

        return back()->with('success', 'Your reply has been submitted.');
    }

    /**
     * Mark a frequent problem / FAQ as helpful.
     */
    public function markFaqHelpful(FrequentProblem $faq): RedirectResponse
    {
        $faq->increment('helpful_count');

        return back()->with('success', 'Thank you for your feedback!');
    }
}
