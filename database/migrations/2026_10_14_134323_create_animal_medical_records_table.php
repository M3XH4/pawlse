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
        Schema::create('animal_medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shelter_animal_id')->constrained('shelter_animals')->cascadeOnDelete();
            $table->string('record_type')->default('vaccination'); // vaccination, medical_checkup, surgery, treatment, medication, dental, lab_test, other
            $table->string('title');
            $table->date('performed_date');
            $table->date('next_due_date')->nullable();
            $table->string('veterinarian')->nullable();
            $table->string('batch_number')->nullable();
            $table->string('dosage')->nullable();
            $table->string('status')->default('completed'); // completed, scheduled, overdue
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['shelter_animal_id', 'record_type']);
            $table->index(['shelter_animal_id', 'performed_date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('animal_medical_records');
    }
};
