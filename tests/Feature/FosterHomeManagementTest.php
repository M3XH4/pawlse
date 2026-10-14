<?php

use App\Enums\ShelterAnimalStatus;
use App\Models\AuditLog;
use App\Models\FosterCareUpdate;
use App\Models\FosterParent;
use App\Models\FosterPlacement;
use App\Models\ShelterAnimal;
use App\Models\User;
use App\Notifications\FosterCareEmergencyNotification;
use App\Notifications\FosterCareUpdateAcknowledgedNotification;
use App\Notifications\FosterPlacementAssignedNotification;
use App\Notifications\FosterPlacementEndedNotification;
use App\Notifications\FosterPlacementTransferredNotification;
use Illuminate\Support\Facades\Notification;

test('admins can view foster management page', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('account.admin.foster-management'));

    $response->assertOk();
});

test('unauthorized users cannot view admin foster management page', function () {
    $user = User::factory()->user()->create();
    $volunteer = User::factory()->volunteer()->create();

    $this->actingAs($user)->get(route('account.admin.foster-management'))
        ->assertStatus(403);

    $this->actingAs($volunteer)->get(route('account.admin.foster-management'))
        ->assertStatus(403);
});

test('admin can authorize an eligible volunteer as a foster parent', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();

    $response = $this->actingAs($admin)->post(route('account.admin.foster-management.foster-parents.store'), [
        'user_id' => $volunteer->id,
        'capacity' => 3,
        'notes' => 'Experienced with convalescing puppies and fenced yard.',
        'status' => 'approved',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $fosterParent = FosterParent::where('user_id', $volunteer->id)->first();
    expect($fosterParent)->not->toBeNull()
        ->and($fosterParent->capacity)->toBe(3)
        ->and($fosterParent->status)->toBe('approved')
        ->and($fosterParent->approved_by)->toBe($admin->id);

    expect(AuditLog::where('action', 'foster_parent_authorize')->exists())->toBeTrue();
});

test('admin can update foster parent capacity and status', function () {
    $admin = User::factory()->admin()->create();
    $fosterParent = FosterParent::factory()->create(['capacity' => 2, 'status' => 'approved']);

    $response = $this->actingAs($admin)->put(route('account.admin.foster-management.foster-parents.update', $fosterParent), [
        'capacity' => 4,
        'status' => 'approved',
        'notes' => 'Expanded capacity after home assessment.',
    ]);

    $response->assertSessionHasNoErrors();
    $fosterParent->refresh();
    expect($fosterParent->capacity)->toBe(4);
});

test('cannot reduce capacity below active placements count', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();
    $fosterParent = FosterParent::factory()->create(['user_id' => $volunteer->id, 'capacity' => 2]);

    // Create 2 active placements
    FosterPlacement::factory()->create([
        'foster_parent_id' => $fosterParent->id,
        'foster_parent_user_id' => $volunteer->id,
        'status' => 'active',
    ]);
    FosterPlacement::factory()->create([
        'foster_parent_id' => $fosterParent->id,
        'foster_parent_user_id' => $volunteer->id,
        'status' => 'active',
    ]);

    // Try to reduce capacity to 1
    $response = $this->actingAs($admin)->put(route('account.admin.foster-management.foster-parents.update', $fosterParent), [
        'capacity' => 1,
        'status' => 'approved',
    ]);

    $response->assertSessionHasErrors(['capacity']);
    expect($fosterParent->fresh()->capacity)->toBe(2);
});

test('admin can assign available shelter pet to eligible foster parent', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();
    $fosterParent = FosterParent::factory()->create([
        'user_id' => $volunteer->id,
        'capacity' => 2,
        'status' => 'approved',
    ]);
    $pet = ShelterAnimal::factory()->create([
        'name' => 'Charlie',
        'status' => ShelterAnimalStatus::Available,
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.foster-management.assign'), [
        'shelter_animal_id' => $pet->id,
        'foster_parent_id' => $fosterParent->id,
        'start_date' => now()->toDateString(),
        'expected_review_date' => now()->addWeeks(2)->toDateString(),
        'care_instructions' => 'Feed twice daily with prescription wet food.',
        'medical_notes' => 'Post-op recovery, check incision daily.',
        'dietary_requirements' => 'Hypoallergenic kibble',
        'special_needs' => 'Keep indoors',
        'placement_notes' => 'Initial placement',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $placement = FosterPlacement::where('shelter_animal_id', $pet->id)->first();
    expect($placement)->not->toBeNull()
        ->and($placement->foster_parent_user_id)->toBe($volunteer->id)
        ->and($placement->status)->toBe('active')
        ->and($placement->assigned_by)->toBe($admin->id);

    $pet->refresh();
    expect($pet->status)->toBe(ShelterAnimalStatus::Foster);

    Notification::assertSentTo(
        $volunteer,
        FosterPlacementAssignedNotification::class,
        fn ($n) => $n->placement->id === $placement->id
    );

    expect(AuditLog::where('action', 'foster_assign')->exists())->toBeTrue();
});

test('pet cannot be assigned if not available or already fostered', function () {
    $admin = User::factory()->admin()->create();
    $fosterParent = FosterParent::factory()->create(['status' => 'approved', 'capacity' => 2]);
    $pet = ShelterAnimal::factory()->create([
        'status' => ShelterAnimalStatus::Adopted,
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.foster-management.assign'), [
        'shelter_animal_id' => $pet->id,
        'foster_parent_id' => $fosterParent->id,
        'start_date' => now()->toDateString(),
    ]);

    $response->assertSessionHasErrors(['shelter_animal_id']);
    expect(FosterPlacement::where('shelter_animal_id', $pet->id)->count())->toBe(0);
});

test('foster parent at capacity cannot receive additional assignments', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();
    $fosterParent = FosterParent::factory()->create([
        'user_id' => $volunteer->id,
        'status' => 'approved',
        'capacity' => 1,
    ]);

    FosterPlacement::factory()->create([
        'foster_parent_id' => $fosterParent->id,
        'foster_parent_user_id' => $volunteer->id,
        'status' => 'active',
    ]);

    $secondPet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    $response = $this->actingAs($admin)->post(route('account.admin.foster-management.assign'), [
        'shelter_animal_id' => $secondPet->id,
        'foster_parent_id' => $fosterParent->id,
        'start_date' => now()->toDateString(),
    ]);

    $response->assertSessionHasErrors(['foster_parent_id']);
    expect(FosterPlacement::where('shelter_animal_id', $secondPet->id)->count())->toBe(0);
});

test('volunteer cannot assign or transfer pets', function () {
    $volunteer = User::factory()->volunteer()->create();
    $fosterParent = FosterParent::factory()->create();
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    $this->actingAs($volunteer)->post(route('account.admin.foster-management.assign'), [
        'shelter_animal_id' => $pet->id,
        'foster_parent_id' => $fosterParent->id,
        'start_date' => now()->toDateString(),
    ])->assertStatus(403);
});

test('admin can transfer active placement to another eligible foster parent', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $user1 = User::factory()->volunteer()->create();
    $user2 = User::factory()->volunteer()->create();

    $parent1 = FosterParent::factory()->create(['user_id' => $user1->id, 'status' => 'approved', 'capacity' => 2]);
    $parent2 = FosterParent::factory()->create(['user_id' => $user2->id, 'status' => 'approved', 'capacity' => 2]);

    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Foster]);

    $placement1 = FosterPlacement::factory()->create([
        'shelter_animal_id' => $pet->id,
        'foster_parent_id' => $parent1->id,
        'foster_parent_user_id' => $user1->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.foster-management.transfer', $placement1), [
        'destination_foster_parent_id' => $parent2->id,
        'transfer_reason' => 'First caretaker traveling for two weeks; transferring care.',
        'expected_review_date' => now()->addWeeks(3)->toDateString(),
        'updated_care_instructions' => 'Continue antibiotic medication until Friday.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $placement1->refresh();
    expect($placement1->status)->toBe('transferred')
        ->and($placement1->end_date)->not->toBeNull()
        ->and($placement1->transfer_reason)->toBe('First caretaker traveling for two weeks; transferring care.')
        ->and($placement1->transferred_by)->toBe($admin->id);

    $placement2 = FosterPlacement::where('shelter_animal_id', $pet->id)
        ->where('status', 'active')
        ->first();

    expect($placement2)->not->toBeNull()
        ->and($placement2->foster_parent_id)->toBe($parent2->id)
        ->and($placement2->foster_parent_user_id)->toBe($user2->id)
        ->and($placement2->previous_placement_id)->toBe($placement1->id)
        ->and($placement2->care_instructions)->toBe('Continue antibiotic medication until Friday.');

    // Pet remains in Foster status
    expect($pet->fresh()->status)->toBe(ShelterAnimalStatus::Foster);

    // Notifications sent to both previous and incoming foster parents
    Notification::assertSentTo($user1, FosterPlacementTransferredNotification::class);
    Notification::assertSentTo($user2, FosterPlacementTransferredNotification::class);

    expect(AuditLog::where('action', 'foster_transfer')->exists())->toBeTrue();
});

test('transfer fails when destination foster parent is at capacity', function () {
    $admin = User::factory()->admin()->create();
    $user1 = User::factory()->volunteer()->create();
    $user2 = User::factory()->volunteer()->create();

    $parent1 = FosterParent::factory()->create(['user_id' => $user1->id, 'status' => 'approved', 'capacity' => 2]);
    $parent2 = FosterParent::factory()->create(['user_id' => $user2->id, 'status' => 'approved', 'capacity' => 1]);

    // Parent 2 is already at capacity (1/1)
    FosterPlacement::factory()->create([
        'foster_parent_id' => $parent2->id,
        'foster_parent_user_id' => $user2->id,
        'status' => 'active',
    ]);

    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Foster]);
    $placement = FosterPlacement::factory()->create([
        'shelter_animal_id' => $pet->id,
        'foster_parent_id' => $parent1->id,
        'foster_parent_user_id' => $user1->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.foster-management.transfer', $placement), [
        'destination_foster_parent_id' => $parent2->id,
        'transfer_reason' => 'Transfer attempt to full foster home',
    ]);

    $response->assertSessionHasErrors(['destination_foster_parent_id']);

    // Original placement is preserved and active
    expect($placement->fresh()->status)->toBe('active');
});

test('transfer fails when destination is the same foster parent', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->volunteer()->create();
    $parent = FosterParent::factory()->create(['user_id' => $user->id, 'status' => 'approved', 'capacity' => 2]);

    $placement = FosterPlacement::factory()->create([
        'foster_parent_id' => $parent->id,
        'foster_parent_user_id' => $user->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.foster-management.transfer', $placement), [
        'destination_foster_parent_id' => $parent->id,
        'transfer_reason' => 'Invalid self transfer',
    ]);

    $response->assertSessionHasErrors(['destination_foster_parent_id']);
    expect($placement->fresh()->status)->toBe('active');
});

test('admin can end placement and return pet to designated status', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $user = User::factory()->volunteer()->create();
    $parent = FosterParent::factory()->create(['user_id' => $user->id]);
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Foster]);

    $placement = FosterPlacement::factory()->create([
        'shelter_animal_id' => $pet->id,
        'foster_parent_id' => $parent->id,
        'foster_parent_user_id' => $user->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.foster-management.end', $placement), [
        'end_reason' => 'Pet fully rehabilitated and ready for public adoption viewing.',
        'target_status' => 'available',
    ]);

    $response->assertSessionHasNoErrors();
    $placement->refresh();
    expect($placement->status)->toBe('ended')
        ->and($placement->end_date)->not->toBeNull()
        ->and($placement->end_reason)->toContain('rehabilitated');

    expect($pet->fresh()->status)->toBe(ShelterAnimalStatus::Available);

    Notification::assertSentTo($user, FosterPlacementEndedNotification::class);
    expect(AuditLog::where('action', 'foster_end')->exists())->toBeTrue();
});

test('foster parent can view their assigned pets on foster care dashboard', function () {
    $volunteer = User::factory()->volunteer()->create();
    $parent = FosterParent::factory()->create(['user_id' => $volunteer->id, 'status' => 'approved']);
    $pet = ShelterAnimal::factory()->create();

    FosterPlacement::factory()->create([
        'shelter_animal_id' => $pet->id,
        'foster_parent_id' => $parent->id,
        'foster_parent_user_id' => $volunteer->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($volunteer)->get(route('account.volunteer.foster-care'));

    $response->assertOk();
});

test('foster parent can submit care update and emergency notifies admins', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();
    $parent = FosterParent::factory()->create(['user_id' => $volunteer->id, 'status' => 'approved']);
    $pet = ShelterAnimal::factory()->create();

    $placement = FosterPlacement::factory()->create([
        'shelter_animal_id' => $pet->id,
        'foster_parent_id' => $parent->id,
        'foster_parent_user_id' => $volunteer->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($volunteer)->post(route('account.volunteer.foster-care.updates.store', $placement), [
        'update_type' => 'emergency',
        'urgency' => 'critical',
        'title' => 'Sudden vomiting and fever',
        'notes' => 'Pet refuses food and exhibits elevated body temperature. Urgently requesting vet triage.',
        'weight' => '5.2 kg',
        'feeding_notes' => 'Refused afternoon meal',
    ]);

    $response->assertSessionHasNoErrors();
    $update = FosterCareUpdate::where('foster_placement_id', $placement->id)->first();
    expect($update)->not->toBeNull()
        ->and($update->urgency)->toBe('critical')
        ->and($update->update_type)->toBe('emergency');

    // Admins notified
    Notification::assertSentTo($admin, FosterCareEmergencyNotification::class);
    expect(AuditLog::where('action', 'foster_care_update')->exists())->toBeTrue();
});

test('foster parent cannot submit care update for a placement not assigned to them', function () {
    $user1 = User::factory()->volunteer()->create();
    $user2 = User::factory()->volunteer()->create();

    $parent1 = FosterParent::factory()->create(['user_id' => $user1->id]);
    $placement = FosterPlacement::factory()->create([
        'foster_parent_id' => $parent1->id,
        'foster_parent_user_id' => $user1->id,
        'status' => 'active',
    ]);

    // User 2 attempts to post update for placement 1
    $this->actingAs($user2)->post(route('account.volunteer.foster-care.updates.store', $placement), [
        'update_type' => 'routine',
        'urgency' => 'low',
        'title' => 'Unauthorized update',
        'notes' => 'Trying to update someone else pet',
    ])->assertStatus(403);
});

test('admin authorized as foster parent can manage placements and view personal foster pets', function () {
    $admin = User::factory()->admin()->create();
    $parent = FosterParent::factory()->create(['user_id' => $admin->id, 'status' => 'approved', 'capacity' => 2]);
    $pet = ShelterAnimal::factory()->create();

    FosterPlacement::factory()->create([
        'shelter_animal_id' => $pet->id,
        'foster_parent_id' => $parent->id,
        'foster_parent_user_id' => $admin->id,
        'status' => 'active',
    ]);

    // Admin can access admin foster management
    $this->actingAs($admin)->get(route('account.admin.foster-management'))->assertOk();

    // Admin can also access personal foster pets
    $response = $this->actingAs($admin)->get(route('account.admin.my-foster-pets'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('admin/my-foster-pets'));
});

test('admin not authorized as foster parent is redirected with info message when visiting my foster pets', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('account.admin.my-foster-pets'));

    $response->assertRedirect(route('account.admin.foster-management'));
    $response->assertSessionHas('toast');
});

test('volunteer not authorized as foster parent is redirected when visiting foster care', function () {
    $volunteer = User::factory()->volunteer()->create();

    $response = $this->actingAs($volunteer)->get(route('account.volunteer.foster-care'));

    $response->assertRedirect(route('account.volunteer.status'));
    $response->assertSessionHas('toast');
});

test('admin can acknowledge and respond to foster care update', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();
    $parent = FosterParent::factory()->create(['user_id' => $volunteer->id]);
    $placement = FosterPlacement::factory()->create([
        'foster_parent_id' => $parent->id,
        'foster_parent_user_id' => $volunteer->id,
    ]);

    $update = FosterCareUpdate::factory()->create([
        'foster_placement_id' => $placement->id,
        'shelter_animal_id' => $placement->shelter_animal_id,
        'user_id' => $volunteer->id,
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.foster-management.updates.acknowledge', $update), [
        'admin_notes' => 'Administered checkup at partner clinic. Prescription filled.',
    ]);

    $response->assertSessionHasNoErrors();
    $update->refresh();
    expect($update->admin_notes)->toBe('Administered checkup at partner clinic. Prescription filled.')
        ->and($update->acknowledged_by)->toBe($admin->id)
        ->and($update->acknowledged_at)->not->toBeNull();

    Notification::assertSentTo($volunteer, FosterCareUpdateAcknowledgedNotification::class);
    expect(AuditLog::where('action', 'foster_update_acknowledge')->exists())->toBeTrue();
});

test('admin can update care instructions on active placement', function () {
    $admin = User::factory()->admin()->create();
    $placement = FosterPlacement::factory()->create(['status' => 'active']);

    $response = $this->actingAs($admin)->post(route('account.admin.foster-management.instructions', $placement), [
        'care_instructions' => 'Updated instruction: no strenuous exercise for 10 days.',
        'medical_notes' => 'Bandage changed daily.',
        'dietary_requirements' => 'Soft canned food',
        'expected_review_date' => now()->addDays(10)->toDateString(),
    ]);

    $response->assertSessionHasNoErrors();
    $placement->refresh();
    expect($placement->care_instructions)->toBe('Updated instruction: no strenuous exercise for 10 days.')
        ->and($placement->medical_notes)->toBe('Bandage changed daily.');
});

test('cannot assign pet to suspended or pending foster parent', function () {
    $admin = User::factory()->admin()->create();
    $suspendedParent = FosterParent::factory()->suspended()->create();
    $pet = ShelterAnimal::factory()->create(['status' => ShelterAnimalStatus::Available]);

    $response = $this->actingAs($admin)->post(route('account.admin.foster-management.assign'), [
        'shelter_animal_id' => $pet->id,
        'foster_parent_id' => $suspendedParent->id,
        'start_date' => now()->toDateString(),
    ]);

    $response->assertSessionHasErrors(['foster_parent_id']);
    expect(FosterPlacement::where('shelter_animal_id', $pet->id)->count())->toBe(0);
});

test('cannot transfer non-active placement', function () {
    $admin = User::factory()->admin()->create();
    $destination = FosterParent::factory()->create(['status' => 'approved', 'capacity' => 2]);
    $endedPlacement = FosterPlacement::factory()->ended()->create();

    $response = $this->actingAs($admin)->post(route('account.admin.foster-management.transfer', $endedPlacement), [
        'destination_foster_parent_id' => $destination->id,
        'transfer_reason' => 'Attempting to transfer concluded placement',
    ]);

    $response->assertSessionHasErrors(['transfer_reason']);
});

test('ending foster placement never hard deletes historical records', function () {
    $admin = User::factory()->admin()->create();
    $placement = FosterPlacement::factory()->create(['status' => 'active']);

    $this->actingAs($admin)->post(route('account.admin.foster-management.end', $placement), [
        'end_reason' => 'Successful trial run complete.',
        'target_status' => 'available',
    ]);

    $freshPlacement = FosterPlacement::withTrashed()->find($placement->id);
    expect($freshPlacement)->not->toBeNull()
        ->and($freshPlacement->status)->toBe('ended')
        ->and($freshPlacement->end_reason)->toBe('Successful trial run complete.');
});
