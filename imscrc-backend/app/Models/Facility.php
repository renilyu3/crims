<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'description',
        'capacity',
        'available_hours',
        'is_active',
    ];

    protected $casts = [
        'available_hours' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the schedules for this facility.
     */
    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Scope to get only active facilities.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by facility type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Check if facility is available at given time.
     */
    public function isAvailableAt($startTime, $endTime, $excludeScheduleId = null)
    {
        $query = $this->schedules()
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_datetime', [$startTime, $endTime])
                  ->orWhereBetween('end_datetime', [$startTime, $endTime])
                  ->orWhere(function ($q2) use ($startTime, $endTime) {
                      $q2->where('start_datetime', '<=', $startTime)
                         ->where('end_datetime', '>=', $endTime);
                  });
            })
            ->whereNotIn('status', ['cancelled']);

        if ($excludeScheduleId) {
            $query->where('id', '!=', $excludeScheduleId);
        }

        return $query->count() === 0;
    }
}
