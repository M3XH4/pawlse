<?php

use App\Models\FrequentProblem;
use App\Models\HelpDeskTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('user can view help desk page with frequent problems and tickets', function () {
    $user = User::factory()->create();
    $faq = FrequentProblem::factory()->forUser()->create([
        'title' => 'How to update adoption application',
        'is_published' => true,
    ]);
    $ticket = HelpDeskTicket::factory()->create([
        'user_id' => $user->id,
        'subject' => 'Adoption question',
    ]);

    $this->actingAs($user)
        ->get(route('account.user.help-desk'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/help-desk')
            ->has('tickets.data', 1)
            ->has('frequentProblems', 1)
            ->where('frequentProblems.0.id', $faq->id)
            ->has('stats')
        );
});

test('user can submit a support ticket', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('account.user.help-desk.tickets.store'), [
        'subject' => 'Issue with donation upload',
        'category' => 'Donation & Receipts',
        'priority' => 'high',
        'description' => 'I cannot upload the receipt image for my recent donation reference #12345.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('help_desk_tickets', [
        'user_id' => $user->id,
        'subject' => 'Issue with donation upload',
        'category' => 'Donation & Receipts',
        'priority' => 'high',
        'status' => 'open',
        'target_role' => 'admin',
    ]);
});

test('volunteer can view help desk page and submit ticket', function () {
    $volunteer = User::factory()->volunteer()->create();

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.help-desk'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('volunteer/help-desk'));

    $this->actingAs($volunteer)->post(route('account.volunteer.help-desk.tickets.store'), [
        'subject' => 'Urgent food supply refill for foster cat',
        'category' => 'Foster Care',
        'priority' => 'urgent',
        'description' => 'We need specialized hypoallergenic cat kibble refill for foster cat Luna.',
    ])->assertRedirect();

    $this->assertDatabaseHas('help_desk_tickets', [
        'user_id' => $volunteer->id,
        'subject' => 'Urgent food supply refill for foster cat',
        'priority' => 'urgent',
    ]);
});

test('user and volunteer can reply to their own ticket', function () {
    $user = User::factory()->create();
    $ticket = HelpDeskTicket::factory()->create([
        'user_id' => $user->id,
        'status' => 'waiting_on_user',
    ]);

    $this->actingAs($user)->post(route('account.user.help-desk.tickets.reply', $ticket), [
        'message' => 'Here is the additional photo requested by the shelter team.',
    ])->assertRedirect();

    $this->assertDatabaseHas('help_desk_replies', [
        'ticket_id' => $ticket->id,
        'user_id' => $user->id,
        'message' => 'Here is the additional photo requested by the shelter team.',
        'is_internal_note' => false,
    ]);

    expect($ticket->fresh()->status)->toBe('in_progress');
});

test('user cannot reply to another user ticket', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $ticket = HelpDeskTicket::factory()->create(['user_id' => $userA->id]);

    $this->actingAs($userB)
        ->post(route('account.user.help-desk.tickets.reply', $ticket), [
            'message' => 'Unauthorized reply attempt',
        ])
        ->assertForbidden();
});

test('user can mark a frequent problem as helpful', function () {
    $user = User::factory()->create();
    $faq = FrequentProblem::factory()->create(['helpful_count' => 5]);

    $this->actingAs($user)
        ->post(route('account.user.help-desk.faq.helpful', $faq))
        ->assertRedirect();

    expect($faq->fresh()->helpful_count)->toBe(6);
});

test('admin can view all tickets and answer user questions', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();
    $ticket = HelpDeskTicket::factory()->create([
        'user_id' => $user->id,
        'subject' => 'Question about visiting hours',
        'status' => 'open',
    ]);

    $this->actingAs($admin)
        ->get(route('account.admin.help-desk'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/help-desk')
            ->has('tickets.data', 1)
            ->has('stats')
        );

    // Admin replies and marks resolved
    $this->actingAs($admin)
        ->post(route('account.admin.help-desk.tickets.reply', $ticket), [
            'message' => 'Our shelter visiting hours are from 9:00 AM to 5:00 PM Tuesday through Sunday.',
            'new_status' => 'resolved',
            'is_internal_note' => false,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('help_desk_replies', [
        'ticket_id' => $ticket->id,
        'user_id' => $admin->id,
        'is_internal_note' => false,
    ]);

    $freshTicket = $ticket->fresh();
    expect($freshTicket->status)->toBe('resolved')
        ->and($freshTicket->resolved_by_user_id)->toBe($admin->id)
        ->and($freshTicket->resolved_at)->not->toBeNull();
});

test('admin can post internal notes only visible to staff', function () {
    $admin = User::factory()->admin()->create();
    $ticket = HelpDeskTicket::factory()->create();

    $this->actingAs($admin)
        ->post(route('account.admin.help-desk.tickets.reply', $ticket), [
            'message' => 'Internal note: Adopter has completed previous background check successfully.',
            'is_internal_note' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('help_desk_replies', [
        'ticket_id' => $ticket->id,
        'is_internal_note' => true,
    ]);
});

test('admin can ask super admin for answers by creating inquiry', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('account.admin.help-desk.inquiry'), [
            'subject' => 'Need approval for corporate partnership sponsorship tier',
            'category' => 'Admin & System Operations',
            'priority' => 'high',
            'description' => 'A sponsor wants a custom tier for 100 sacks of dog food. Requesting Super Admin approval.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('help_desk_tickets', [
        'user_id' => $admin->id,
        'subject' => 'Need approval for corporate partnership sponsorship tier',
        'target_role' => 'super-admin',
        'is_escalated' => true,
    ]);
});

test('admin can escalate an existing ticket to super admin with reason', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();
    $ticket = HelpDeskTicket::factory()->create(['user_id' => $user->id, 'is_escalated' => false]);

    $this->actingAs($admin)
        ->post(route('account.admin.help-desk.tickets.escalate', $ticket), [
            'escalation_reason' => 'Requires Super Admin policy decision on international adoption requirements.',
        ])
        ->assertRedirect();

    $freshTicket = $ticket->fresh();
    expect($freshTicket->is_escalated)->toBeTrue()
        ->and($freshTicket->target_role)->toBe('super-admin')
        ->and($freshTicket->escalation_reason)->toBe('Requires Super Admin policy decision on international adoption requirements.')
        ->and($freshTicket->escalated_to_super_admin_at)->not->toBeNull();
});

test('super admin can view admin inquiries and answer them', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $admin = User::factory()->admin()->create();
    $ticket = HelpDeskTicket::factory()->escalated()->create([
        'user_id' => $admin->id,
        'subject' => 'Guidance on tax documentation for donation',
    ]);

    $this->actingAs($superAdmin)
        ->get(route('account.super-admin.help-desk'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/help-desk')
            ->has('tickets.data', 1)
        );

    // Super Admin replies to answer the admin
    $this->actingAs($superAdmin)
        ->post(route('account.super-admin.help-desk.tickets.reply', $ticket), [
            'message' => 'Use the official MOU form and stamp with the board resolution seal.',
            'new_status' => 'resolved',
            'is_internal_note' => false,
        ])
        ->assertRedirect();

    expect($ticket->fresh()->status)->toBe('resolved');
});

test('admin and super admin can manage frequent problems and solutions', function () {
    $admin = User::factory()->admin()->create();

    // Store frequent problem
    $this->actingAs($admin)
        ->post(route('account.admin.help-desk.frequent-problems.store'), [
            'title' => 'How to report an injured stray after shelter hours',
            'category' => 'Rescue & SOS',
            'problem_description' => 'Users encountering stray emergencies during nighttime.',
            'solution' => '1. Contact our on-call veterinary partner.\n2. Submit an SOS emergency report in Pawlse.',
            'target_audience' => 'all',
            'is_published' => true,
            'display_order' => 1,
        ])
        ->assertRedirect();

    $problem = FrequentProblem::where('title', 'How to report an injured stray after shelter hours')->first();
    expect($problem)->not->toBeNull();

    // Update frequent problem
    $this->actingAs($admin)
        ->put(route('account.admin.help-desk.frequent-problems.update', $problem), [
            'title' => 'How to report an injured stray after shelter hours (Updated)',
            'category' => 'Rescue & SOS',
            'problem_description' => 'Users encountering stray emergencies during nighttime.',
            'solution' => '1. Contact emergency dispatch.\n2. Submit an SOS emergency report.',
            'target_audience' => 'all',
            'is_published' => true,
            'display_order' => 2,
        ])
        ->assertRedirect();

    expect($problem->fresh()->title)->toBe('How to report an injured stray after shelter hours (Updated)');

    // Delete frequent problem
    $this->actingAs($admin)
        ->delete(route('account.admin.help-desk.frequent-problems.destroy', $problem))
        ->assertRedirect();

    expect(FrequentProblem::find($problem->id))->toBeNull();
});
