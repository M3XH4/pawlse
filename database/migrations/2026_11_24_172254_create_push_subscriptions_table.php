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
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('endpoint');
            $table->char('endpoint_hash', 64)->unique();
            $table->string('public_key', 255)->nullable();
            $table->string('auth_token', 255)->nullable();
            $table->string('content_encoding', 32)->default('aes128gcm');
            $table->string('user_agent', 512)->nullable();
            $table->boolean('is_standalone')->default(false);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'updated_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('push_suppress_when_visible')->default(true)->after('sidebar_notification_style');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('push_suppress_when_visible');
        });

        Schema::dropIfExists('push_subscriptions');
    }
};
