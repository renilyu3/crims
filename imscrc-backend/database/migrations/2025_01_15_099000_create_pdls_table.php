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
        Schema::create('pdls', function (Blueprint $table) {
            $table->id();
            $table->string('pdl_number')->unique();

            // Personal Information
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->json('aliases')->nullable(); // Array of aliases
            $table->date('date_of_birth');
            $table->string('place_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->enum('civil_status', ['single', 'married', 'divorced', 'widowed', 'separated']);
            $table->string('nationality')->default('Filipino');
            $table->string('religion')->nullable();

            // Address Information
            $table->json('address'); // Current and permanent addresses
            $table->json('contact_information')->nullable(); // Phone, email, etc.
            $table->json('emergency_contacts')->nullable(); // Emergency contact details

            // Physical Characteristics
            $table->json('physical_characteristics')->nullable(); // Height, weight, identifying marks, etc.

            // Legal Information
            $table->string('case_number');
            $table->json('charges'); // Array of charges
            $table->json('court_information')->nullable(); // Court details
            $table->json('sentence_details')->nullable(); // Sentence information
            $table->enum('legal_status', ['detained', 'convicted', 'acquitted', 'transferred', 'released']);

            // Admission Details
            $table->date('admission_date');
            $table->time('admission_time');
            $table->string('arresting_officer')->nullable();
            $table->string('arresting_agency')->nullable();
            $table->json('property_inventory')->nullable(); // Personal belongings
            $table->json('medical_screening')->nullable(); // Initial medical screening

            // System Information
            $table->enum('status', ['active', 'transferred', 'released', 'deceased'])->default('active');
            $table->json('photos')->nullable(); // Array of photo file paths
            $table->string('cell_assignment')->nullable();
            $table->text('notes')->nullable();

            // Audit Trail
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');

            $table->timestamps();

            // Indexes for better performance
            $table->index(['first_name', 'last_name']);
            $table->index('case_number');
            $table->index('legal_status');
            $table->index('status');
            $table->index('admission_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pdls');
    }
};
