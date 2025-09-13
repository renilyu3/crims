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
        Schema::table('visitor_checkins', function (Blueprint $table) {
            $table->foreignId('pdl_id')->nullable()->after('address')->constrained('pdls')->onDelete('cascade');
            $table->string('purpose')->nullable()->after('pdl_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visitor_checkins', function (Blueprint $table) {
            $table->dropForeign(['pdl_id']);
            $table->dropColumn(['pdl_id', 'purpose']);
        });
    }
};
