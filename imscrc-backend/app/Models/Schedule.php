<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_type_id',
        'pdl_id',
        'facility_id',
        'program_id',
        'visitor_id',
        'title',
        'description',
        'start_datetime',
        'end_datetime',
        'status',
        'location',
        'responsible_officer',
        'additional_data',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'additional_data' => 'array',
    ];

    /**
     * Get the schedule type that owns the schedule.
     */
    public function scheduleType()
    {
        return $this->belongsTo(ScheduleType::class);
    }

    /**
     * Get the PDL that owns the schedule.
     */
    public function pdl()
    {
        return $this->belongsTo(PDL::class);
    }

    /**
     * Get the facility that owns the schedule.
     */
    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    /**
     * Get the program that owns the schedule.
     */
    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the visitor that owns the schedule.
     */
    public function visitor()
    {
        return $this->belongsTo(Visitor::class);
    }

    /**
     * Get the user who created the schedule.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the schedule.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get conflicts where this schedule is involved.
     */
    public function conflicts()
    {
        return $this->hasMany(ScheduleConflict::class, 'schedule_1_id')
            ->orWhere('schedule_2_id', $this->id);
    }

    /**
     * Scope to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('start_datetime', [$startDate, $endDate]);
    }

    /**
     * Scope to filter by PDL.
     */
    public function scopeForPdl($query, $pdlId)
    {
        return $query->where('pdl_id', $pdlId);
    }

    /**
     * Scope to filter by schedule type.
     */
    public function scopeOfType($query, $typeId)
    {
        return $query->where('schedule_type_id', $typeId);
    }

    /**
     * Scope to filter by status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get upcoming schedules.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_datetime', '>', now());
    }

    /**
     * Scope to get today's schedules.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('start_datetime', today());
    }

    /**
     * Check if schedule overlaps with another time period.
     */
    public function overlaps($startTime, $endTime)
    {
        return $this->start_datetime < $endTime && $this->end_datetime > $startTime;
    }

    /**
     * Get duration in minutes.
     */
    public function getDurationAttribute()
    {
        return $this->start_datetime->diffInMinutes($this->end_datetime);
    }

    /**
     * Check if schedule is in the past.
     */
    public function getIsPastAttribute()
    {
        return $this->end_datetime < now();
    }

    /**
     * Check if schedule is currently active.
     */
    public function getIsActiveAttribute()
    {
        $now = now();
        return $this->start_datetime <= $now && $this->end_datetime >= $now;
    }

    /**
     * Get formatted date range.
     */
    public function getFormattedDateRangeAttribute()
    {
        if ($this->start_datetime->isSameDay($this->end_datetime)) {
            return $this->start_datetime->format('M j, Y g:i A') . ' - ' . $this->end_datetime->format('g:i A');
        }

        return $this->start_datetime->format('M j, Y g:i A') . ' - ' . $this->end_datetime->format('M j, Y g:i A');
    }
}
