<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FrequentProblem;
use App\Models\HelpDeskTicket;
use App\Models\User;
use App\Notifications\HelpDeskTicketRepliedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HelpDeskController extends Controller
{
    /**
     * Display Super Admin Help Desk dashboard.
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

        // Filter by tab / scope
        $tab = $request->input('tab', 'all');
        if ($tab === 'escalated') {
            $ticketQuery->where(function ($q) {
                $q->where('is_escalated', true)->orWhere('target_role', 'super-admin');
            });
        } elseif ($tab === 'admin_inquiries') {
            $ticketQuery->where('target_role', 'super-admin');
        } elseif ($tab === 'resolved') {
            $ticketQuery->where('status', 'resolved');
        }

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

        // Submitter Role Filter
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
            'escalated_to_super' => HelpDeskTicket::where(fn ($q) => $q->where('is_escalated', true)->orWhere('target_role', 'super-admin'))->count(),
            'admin_inquiries' => HelpDeskTicket::where('target_role', 'super-admin')->count(),
            'resolved' => HelpDeskTicket::where('status', 'resolved')->count(),
            'frequent_problems_count' => FrequentProblem::count(),
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

        return Inertia::render('super-admin/help-desk', [
            'tickets' => $tickets,
            'frequentProblems' => $frequentProblems,
            'categories' => $categories,
            'stats' => $stats,
            'staffUsers' => $staffUsers,
            'filters' => $request->only(['tab', 'status', 'priority', 'category', 'submitter_role', 'search', 'faq_search', 'faq_category', 'active_tab']),
        ]);
    }

    /**
     * Super Admin reply to answer Admin question or resolve ticket.
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

        // Status update
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
            if ($ticket->status === 'open') {
                $ticket->update(['status' => 'in_progress']);
            }
        }

        // Notify ticket submitter (Admin, Volunteer, or User)
        if (! $isInternal && $ticket->user_id !== $request->user()->id) {
            $ticket->user?->notify(new HelpDeskTicketRepliedNotification($ticket, $reply));
        }

        AuditLog::log('help_desk_super_reply', "Super Admin replied to ticket #{$ticket->ticket_number}");

        return back()->with('success', 'Super Admin response posted.');
    }

    /**
     * Update ticket status, priority or staff assignment.
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

        AuditLog::log('help_desk_status_change', "Super Admin changed status of ticket #{$ticket->ticket_number} to {$validated['status']}");

        return back()->with('success', "Ticket #{$ticket->ticket_number} status updated to {$validated['status']}.");
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

        AuditLog::log('frequent_problem_create', "Super Admin added frequent problem: {$problem->title} ({$problem->category})");

        return back()->with('success', 'Frequent problem & solution published.');
    }

    /**
     * Update an existing frequent problem.
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

        AuditLog::log('frequent_problem_update', "Super Admin updated frequent problem: {$frequentProblem->title}");

        return back()->with('success', 'Frequent problem updated successfully.');
    }

    /**
     * Delete a frequent problem.
     */
    public function destroyFrequentProblem(FrequentProblem $frequentProblem): RedirectResponse
    {
        $title = $frequentProblem->title;
        $frequentProblem->delete();

        AuditLog::log('frequent_problem_delete', "Super Admin deleted frequent problem: {$title}");

        return back()->with('success', 'Frequent problem deleted successfully.');
    }
}
