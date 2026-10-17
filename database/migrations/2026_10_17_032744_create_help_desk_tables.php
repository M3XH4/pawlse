<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('frequent_problems', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category')->default('General');
            $table->text('problem_description')->nullable();
            $table->text('solution');
            $table->string('target_audience')->default('all'); // all, user, volunteer, admin
            $table->boolean('is_published')->default(true);
            $table->integer('display_order')->default(0);
            $table->unsignedInteger('helpful_count')->default(0);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('help_desk_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('category')->default('general');
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            $table->string('status')->default('open'); // open, in_progress, waiting_on_user, resolved, closed
            $table->string('subject');
            $table->text('description');
            $table->string('target_role')->default('admin'); // admin, super-admin
            $table->boolean('is_escalated')->default(false);
            $table->timestamp('escalated_to_super_admin_at')->nullable();
            $table->text('escalation_reason')->nullable();
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('help_desk_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('help_desk_tickets')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->boolean('is_internal_note')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('help_desk_replies');
        Schema::dropIfExists('help_desk_tickets');
        Schema::dropIfExists('frequent_problems');
    }
};
