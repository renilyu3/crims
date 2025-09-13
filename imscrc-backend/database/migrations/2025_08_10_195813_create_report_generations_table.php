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
        Schema::create('report_generations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->nullable()->constrained('reports')->onDelete('set null');
            $table->foreignId('generated_by')->constrained('users')->onDelete('cascade');
            $table->string('report_name'); // Store report name in case report is deleted
            $table->string('file_path', 500)->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_type', 10)->default('pdf'); // pdf, xlsx, csv
            $table->json('parameters')->nullable(); // Generation parameters used
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->integer('file_size')->nullable(); // File size in bytes
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['generated_by', 'status']);
            $table->index(['report_id', 'status']);
            $table->index(['created_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_generations');
    }
};
