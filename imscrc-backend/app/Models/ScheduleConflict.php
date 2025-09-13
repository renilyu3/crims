<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduleConflict extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_1_id',
        'schedule_2_id',
        'conflict_type',
        'description',
        'severity',
        'status',
        'resolution_notes',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    /**
     * Get the first schedule involved in the conflict.
     */
    public function schedule1()
    {
        return $this->belongsTo(Schedule::class, 'schedule_1_id');
    }

    /**
     * Get the second schedule involved in the conflict.
     */
    public function schedule2()
    {
        return $this->belongsTo(Schedule::class, 'schedule_2_id');
    }

    /**
     * Get the user who resolved the conflict.
     */
    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Scope to get unresolved conflicts.
     */
    public function scopeUnresolved($query)
    {
        return $query->whereIn('status', ['detected', 'acknowledged']);
    }

    /**
     * Scope to get resolved conflicts.
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    /**
     * Scope to filter by severity.
     */
    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope to get critical conflicts.
     */
    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    /**
     * Mark conflict as resolved.
     */
    public function resolve($userId, $notes = null)
    {
        $this->update([
            'status' => 'resolved',
            'resolved_by' => $userId,
            'resolved_at' => now(),
            'resolution_notes' => $notes,
        ]);
    }

    /**
     * Mark conflict as acknowledged.
     */
    public function acknowledge()
    {
        $this->update(['status' => 'acknowledged']);
    }

    /**
     * Mark conflict as ignored.
     */
    public function ignore()
    {
        $this->update(['status' => 'ignored']);
    }

    /**
     * Get severity color for UI display.
     */
    public function getSeverityColorAttribute()
    {
        return match($this->severity) {
            'low' => '#28a745',
            'medium' => '#ffc107',
            'high' => '#fd7e14',
            'critical' => '#dc3545',
            default => '#6c757d'
        };
    }

    /**
     * Get conflict type display name.
     */
    public function getConflictTypeDisplayAttribute()
    {
        return match($this->conflict_type) {
            'pdl_double_booking' => 'PDL Double Booking',
            'facility_double_booking' => 'Facility Double Booking',
            'officer_conflict' => 'Officer Conflict',
            'resource_conflict' => 'Resource Conflict',
            default => ucfirst(str_replace('_', ' ', $this->conflict_type))
        };
    }
}
