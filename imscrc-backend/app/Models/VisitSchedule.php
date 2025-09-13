<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VisitSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'start_time',
        'end_time',
        'time_slot_label',
        'max_capacity',
        'current_bookings',
        'is_available',
        'allowed_visit_types',
        'is_holiday',
        'is_maintenance',
        'special_notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'allowed_visit_types' => 'array',
        'is_available' => 'boolean',
        'is_holiday' => 'boolean',
        'is_maintenance' => 'boolean',
    ];

    protected $appends = [
        'available_slots',
        'is_full',
        'duration_minutes',
    ];

    // Relationships
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class, 'scheduled_date', 'date')
                    ->where('scheduled_time', '>=', $this->start_time)
                    ->where('scheduled_time', '<=', $this->end_time);
    }

    // Accessors
    public function getAvailableSlotsAttribute(): int
    {
        return max(0, $this->max_capacity - $this->current_bookings);
    }

    public function getIsFullAttribute(): bool
    {
        return $this->current_bookings >= $this->max_capacity;
    }

    public function getDurationMinutesAttribute(): int
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)
                    ->where('is_maintenance', false)
                    ->whereColumn('current_bookings', '<', 'max_capacity');
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', today());
    }

    public function scopeToday($query)
    {
        return $query->whereDate('date', today());
    }

    public function scopeByVisitType($query, $visitType)
    {
        return $query->where(function ($q) use ($visitType) {
            $q->whereNull('allowed_visit_types')
              ->orWhereJsonContains('allowed_visit_types', $visitType);
        });
    }

    // Helper Methods
    public function canAccommodateVisit(string $visitType = null): bool
    {
        if (!$this->is_available || $this->is_maintenance || $this->is_full) {
            return false;
        }

        if ($visitType && $this->allowed_visit_types) {
            return in_array($visitType, $this->allowed_visit_types);
        }

        return true;
    }

    public function bookSlot(): bool
    {
        if ($this->is_full) {
            return false;
        }

        $this->increment('current_bookings');
        return true;
    }

    public function releaseSlot(): bool
    {
        if ($this->current_bookings <= 0) {
            return false;
        }

        $this->decrement('current_bookings');
        return true;
    }

    public function updateAvailability(): void
    {
        $actualBookings = Visit::where('scheduled_date', $this->date)
            ->where('scheduled_time', '>=', $this->start_time->format('H:i'))
            ->where('scheduled_time', '<=', $this->end_time->format('H:i'))
            ->whereIn('status', ['scheduled', 'approved', 'in_progress'])
            ->count();

        $this->update(['current_bookings' => $actualBookings]);
    }

    // Validation Rules
    public static function validationRules(): array
    {
        return [
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'time_slot_label' => 'required|string|max:255',
            'max_capacity' => 'required|integer|min:1|max:100',
            'allowed_visit_types' => 'nullable|array',
            'allowed_visit_types.*' => 'in:family,legal,official,emergency',
            'is_available' => 'boolean',
            'is_holiday' => 'boolean',
            'is_maintenance' => 'boolean',
            'special_notes' => 'nullable|string|max:500',
        ];
    }

    public static function updateValidationRules($id): array
    {
        $rules = self::validationRules();
        // Allow past dates for updates
        $rules['date'] = 'required|date';
        return $rules;
    }
}
