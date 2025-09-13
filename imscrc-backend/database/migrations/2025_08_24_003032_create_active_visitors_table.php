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
        Schema::create('active_visitors', function (Blueprint $table) {
            $table->id();

            // Visitor Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('phone_number');
            $table->string('email')->nullable();
            $table->text('address');
            $table->string('id_type')->nullable(); // Driver's License, National ID, etc.
            $table->string('id_number')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();

            // Visit Information
            $table->foreignId('pdl_id')->constrained('pdls')->onDelete('cascade');
            $table->string('visit_purpose')->nullable();
            $table->enum('visit_type', ['family', 'legal', 'official', 'emergency'])->default('family');

            // Check-in Details
            $table->timestamp('check_in_time');
            $table->string('visitor_badge_number')->nullable();
            $table->foreignId('checked_in_by')->constrained('users');

            // Security & Items
            $table->json('items_brought')->nullable();
            $table->json('security_screening')->nullable();
            $table->text('notes')->nullable();

            // Emergency Contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relationship')->nullable();

            // Photo
            $table->string('photo_path')->nullable();

            // Timestamps
            $table->timestamps();

            // Indexes for better performance
            $table->index('check_in_time');
            $table->index('pdl_id');
            $table->index('visitor_badge_number');
            $table->index(['first_name', 'last_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('active_visitors');
    }
};
