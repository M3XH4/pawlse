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
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->integer('min_threshold')->default(5)->after('category');
            $table->string('storage_location')->nullable()->after('min_threshold');
            $table->boolean('has_expiry')->default(false)->after('storage_location');
        });

        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->string('batch_number')->nullable();
            $table->integer('quantity')->default(0);
            $table->integer('initial_quantity')->default(0);
            $table->date('expires_at')->nullable();
            $table->date('received_at')->nullable();
            $table->string('source')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->foreignId('inventory_batch_id')->nullable()->after('inventory_item_id')->constrained('inventory_batches')->nullOnDelete();
            $table->string('batch_info')->nullable()->after('reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->dropForeign(['inventory_batch_id']);
            $table->dropColumn(['inventory_batch_id', 'batch_info']);
        });

        Schema::dropIfExists('inventory_batches');

        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn(['min_threshold', 'storage_location', 'has_expiry']);
        });
    }
};
