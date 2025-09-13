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
        Schema::create('visitor_checkins', function (Blueprint $table) {
            $table->id();

            // Basic visitor information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone_number');
            $table->text('address');

            // Check-in/Check-out times
            $table->timestamp('check_in_time');
            $table->timestamp('check_out_time')->nullable();

            // Status: 'active' for checked-in, 'completed' for checked-out
            $table->enum('status', ['active', 'completed'])->default('active');

            // Duration in minutes (calculated when checked out)
            $table->integer('duration_minutes')->nullable();

            // Optional notes
            $table->text('notes')->nullable();

            // Who performed the check-in/check-out
            $table->foreignId('checked_in_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('checked_out_by')->nullable()->constrained('users')->onDelete('cascade');

            $table->timestamps();

            // Indexes for better performance
            $table->index('status');
            $table->index('check_in_time');
            $table->index(['first_name', 'last_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitor_checkins');
    }
};
