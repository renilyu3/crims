<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'description',
        'duration_minutes',
        'max_participants',
        'instructor',
        'requirements',
        'is_active',
    ];

    protected $casts = [
        'requirements' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the schedules for this program.
     */
    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Scope to get only active programs.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by program type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Get current enrollment count for a specific schedule.
     */
    public function getCurrentEnrollment($scheduleId)
    {
        return Schedule::where('program_id', $this->id)
            ->where('id', $scheduleId)
            ->whereNotIn('status', ['cancelled'])
            ->count();
    }

    /**
     * Check if program has available slots for enrollment.
     */
    public function hasAvailableSlots($scheduleId)
    {
        return $this->getCurrentEnrollment($scheduleId) < $this->max_participants;
    }
}
