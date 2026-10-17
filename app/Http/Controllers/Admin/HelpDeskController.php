<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FrequentProblem;
use App\Models\HelpDeskTicket;
use App\Models\User;
use App\Notifications\HelpDeskTicketCreatedNotification;
use App\Notifications\HelpDeskTicketEscalatedNotification;
use App\Notifications\HelpDeskTicketRepliedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HelpDeskController extends Controller
{
    /**
     * Display Admin Help Desk dashboard.
     */
    public function index(Request $request): Response
    {
        $ticketQuery = HelpDeskTicket::query()
            ->with([
                'user:id,name,email,role,avatar_path',
                'assignedTo:id,name',
                'resolvedBy:id,name',
                'replies' => fn ($q) => $q->with('user:id,name,role,avatar_path')->orderBy('created_at', 'asc'),
            ]);

        // Status Filter
        if ($request->filled('status') && $request->input('status') !== 'all') {
            if ($request->input('status') === 'escalated') {
                $ticketQuery->where('is_escalated', true);
            } else {
                $ticketQuery->where('status', $request->input('status'));
            }
        }

        // Priority Filter
        if ($request->filled('priority') && $request->input('priority') !== 'all') {
            $ticketQuery->where('priority', $request->input('priority'));
        }

        // Category Filter
        if ($request->filled('category') && $request->input('category') !== 'all') {
            $ticketQuery->where('category', $request->input('category'));
        }

        // Audience / Submitter Role Filter
        if ($request->filled('submitter_role') && $request->input('submitter_role') !== 'all') {
            $ticketQuery->whereHas('user', function ($q) use ($request) {
                $q->where('role', $request->input('submitter_role'));
            });
        }

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $ticketQuery->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $tickets = $ticketQuery->latest()->paginate(15)->withQueryString();

        // Frequent Problems Query
        $faqQuery = FrequentProblem::query();
        if ($request->filled('faq_search')) {
            $faqSearch = $request->input('faq_search');
            $faqQuery->where(function ($q) use ($faqSearch) {
                $q->where('title', 'like', "%{$faqSearch}%")
                    ->orWhere('problem_description', 'like', "%{$faqSearch}%")
                    ->orWhere('solution', 'like', "%{$faqSearch}%")
                    ->orWhere('category', 'like', "%{$faqSearch}%");
            });
        }
        if ($request->filled('faq_category') && $request->input('faq_category') !== 'all') {
            $faqQuery->where('category', $request->input('faq_category'));
        }

        $frequentProblems = $faqQuery->orderBy('display_order')
            ->orderByDesc('helpful_count')
            ->get();

        $stats = [
            'total' => HelpDeskTicket::count(),
            'open' => HelpDeskTicket::open()->count(),
            'in_progress' => HelpDeskTicket::where('status', 'in_progress')->count(),
            'escalated' => HelpDeskTicket::escalated()->count(),
            'resolved' => HelpDeskTicket::where('status', 'resolved')->count(),
            'frequent_problems_count' => FrequentProblem::count(),
            'admin_inquiries_to_super' => HelpDeskTicket::where('target_role', 'super-admin')->count(),
        ];

        $staffUsers = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])
            ->select('id', 'name', 'role')
            ->orderBy('name')
            ->get();

        $categories = [
            'Adoption',
            'Rescue & SOS',
            'Foster Care',
            'Donations & Inventory',
            'Volunteer Tasks',
            'Account & Technical',
            'Admin & System Operations',
            'General Inquiry',
        ];

        return Inertia::render('admin/help-desk', [
            'tickets' => $tickets,
            'frequentProblems' => $frequentProblems,
            'categories' => $categories,
            'stats' => $stats,
            'staffUsers' => $staffUsers,
            'filters' => $request->only(['status', 'priority', 'category', 'submitter_role', 'search', 'faq_search', 'faq_category', 'active_tab']),
        ]);
    }

    /**
     * Ask Super Admin for answers (Create an administrative inquiry directed to Super Admin).
     */
    public function storeInquiryToSuperAdmin(Request $request): RedirectResponse
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
            'target_role' => 'super-admin',
            'is_escalated' => true,
            'escalated_to_super_admin_at' => now(),
            'escalation_reason' => 'Admin inquiry directed to Super Admin',
        ]);

        // Notify Super Admins
        $superAdmins = User::where('role', Role::SuperAdmin->value)->get();
        foreach ($superAdmins as $superAdmin) {
            $superAdmin->notify(new HelpDeskTicketCreatedNotification($ticket));
        }

        AuditLog::log('help_desk_admin_inquiry', "Admin {$request->user()->name} submitted inquiry #{$ticket->ticket_number} to Super Admin: {$ticket->subject}");

        return back()->with('success', "Inquiry #{$ticket->ticket_number} forwarded directly to Super Admin.");
    }

    /**
     * Reply to a ticket (can be public to user/volunteer or internal note).
     */
    public function replyTicket(Request $request, HelpDeskTicket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'min:2', 'max:5000'],
            'is_internal_note' => ['boolean'],
            'new_status' => ['nullable', 'string', 'in:open,in_progress,waiting_on_user,resolved,closed'],
        ]);

        $isInternal = (bool) ($validated['is_internal_note'] ?? false);

        $reply = $ticket->replies()->create([
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'is_internal_note' => $isInternal,
        ]);

        // Update status if selected
        if (! empty($validated['new_status'])) {
            $updateData = ['status' => $validated['new_status']];
            if ($validated['new_status'] === 'resolved') {
                $updateData['resolved_at'] = now();
                $updateData['resolved_by_user_id'] = $request->user()->id;
            } elseif ($validated['new_status'] === 'open' || $validated['new_status'] === 'in_progress') {
                $updateData['resolved_at'] = null;
                $updateData['resolved_by_user_id'] = null;
            }
            $ticket->update($updateData);
        } else {
            // Default to in_progress if currently open
            if ($ticket->status === 'open') {
                $ticket->update(['status' => 'in_progress']);
            }
        }

        // Notify the ticket owner if public message
        if (! $isInternal && $ticket->user_id !== $request->user()->id) {
            $ticket->user?->notify(new HelpDeskTicketRepliedNotification($ticket, $reply));
        }

        return back()->with('success', 'Reply posted successfully.');
    }

    /**
     * Update ticket status, priority or assigned staff.
     */
    public function updateStatus(Request $request, HelpDeskTicket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:open,in_progress,waiting_on_user,resolved,closed'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'assigned_to_user_id' => ['nullable', 'exists:users,id'],
        ]);

        $updateData = [
            'status' => $validated['status'],
        ];

        if (! empty($validated['priority'])) {
            $updateData['priority'] = $validated['priority'];
        }

        if (array_key_exists('assigned_to_user_id', $validated)) {
            $updateData['assigned_to_user_id'] = $validated['assigned_to_user_id'];
        }

        if ($validated['status'] === 'resolved' && ! $ticket->resolved_at) {
            $updateData['resolved_at'] = now();
            $updateData['resolved_by_user_id'] = $request->user()->id;
        } elseif (in_array($validated['status'], ['open', 'in_progress'], true)) {
            $updateData['resolved_at'] = null;
            $updateData['resolved_by_user_id'] = null;
        }

        $ticket->update($updateData);

        return back()->with('success', "Ticket #{$ticket->ticket_number} status updated to {$validated['status']}.");
    }

    /**
     * Escalate a ticket to Super Admin with a question or reason.
     */
    public function escalateToSuperAdmin(Request $request, HelpDeskTicket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'escalation_reason' => ['required', 'string', 'min:5', 'max:2000'],
        ]);

        $ticket->update([
            'is_escalated' => true,
            'escalated_to_super_admin_at' => now(),
            'escalation_reason' => $validated['escalation_reason'],
            'target_role' => 'super-admin',
        ]);

        // Add internal note about escalation
        $ticket->replies()->create([
            'user_id' => $request->user()->id,
            'message' => "⚡ ESCALATED TO SUPER ADMIN: {$validated['escalation_reason']}",
            'is_internal_note' => true,
        ]);

        // Notify Super Admins
        $superAdmins = User::where('role', Role::SuperAdmin->value)->get();
        foreach ($superAdmins as $superAdmin) {
            $superAdmin->notify(new HelpDeskTicketEscalatedNotification($ticket, $request->user(), $validated['escalation_reason']));
        }

        AuditLog::log('help_desk_escalate', "Admin {$request->user()->name} escalated ticket #{$ticket->ticket_number} to Super Admin: {$validated['escalation_reason']}");

        return back()->with('success', "Ticket #{$ticket->ticket_number} has been escalated to Super Admin for guidance.");
    }

    /**
     * Store a new frequent problem & solution.
     */
    public function storeFrequentProblem(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'problem_description' => ['nullable', 'string'],
            'solution' => ['required', 'string'],
            'target_audience' => ['required', 'string', 'in:all,user,volunteer,admin'],
            'is_published' => ['boolean'],
            'display_order' => ['integer', 'min:0'],
        ]);

        $validated['created_by_user_id'] = $request->user()->id;

        $problem = FrequentProblem::create($validated);

        AuditLog::log('frequent_problem_create', "Added frequent problem: {$problem->title} ({$problem->category})");

        return back()->with('success', 'Frequent problem & solution added successfully.');
    }

    /**
     * Update an existing frequent problem & solution.
     */
    public function updateFrequentProblem(Request $request, FrequentProblem $frequentProblem): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'problem_description' => ['nullable', 'string'],
            'solution' => ['required', 'string'],
            'target_audience' => ['required', 'string', 'in:all,user,volunteer,admin'],
            'is_published' => ['boolean'],
            'display_order' => ['integer', 'min:0'],
        ]);

        $frequentProblem->update($validated);

        AuditLog::log('frequent_problem_update', "Updated frequent problem: {$frequentProblem->title}");

        return back()->with('success', 'Frequent problem & solution updated successfully.');
    }

    /**
     * Delete a frequent problem.
     */
    public function destroyFrequentProblem(FrequentProblem $frequentProblem): RedirectResponse
    {
        $title = $frequentProblem->title;
        $frequentProblem->delete();

        AuditLog::log('frequent_problem_delete', "Deleted frequent problem: {$title}");

        return back()->with('success', 'Frequent problem removed successfully.');
    }
}
