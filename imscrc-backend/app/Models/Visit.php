<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Visit extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_number',
        'visitor_id',
        'pdl_id',
        'visit_type',
        'visit_purpose',
        'scheduled_date',
        'scheduled_time',
        'actual_start_time',
        'actual_end_time',
        'status',
        'approval_status',
        'approved_by',
        'approval_date',
        'approval_notes',
        'check_in_time',
        'check_out_time',
        'visitor_badge_number',
        'checked_in_by',
        'checked_out_by',
        'items_brought',
        'security_screening',
        'visit_notes',
        'incident_notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'scheduled_time' => 'datetime:H:i',
        'actual_start_time' => 'datetime',
        'actual_end_time' => 'datetime',
        'approval_date' => 'datetime',
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
        'items_brought' => 'array',
        'security_screening' => 'array',
    ];

    protected $appends = [
        'duration_minutes',
        'is_overdue',
        'is_active',
        'scheduled_datetime',
    ];

    // Relationships
    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }

    public function pdl(): BelongsTo
    {
        return $this->belongsTo(PDL::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function checkedInBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }

    public function checkedOutBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_out_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Accessors
    public function getDurationMinutesAttribute(): ?int
    {
        if ($this->actual_start_time && $this->actual_end_time) {
            return $this->actual_start_time->diffInMinutes($this->actual_end_time);
        }
        return null;
    }

    public function getIsOverdueAttribute(): bool
    {
        if ($this->status === 'in_progress' && $this->actual_start_time) {
            // Consider visit overdue if it's been more than 2 hours
            return $this->actual_start_time->diffInHours(now()) > 2;
        }
        return false;
    }

    public function getIsActiveAttribute(): bool
    {
        return in_array($this->status, ['scheduled', 'approved', 'in_progress']);
    }

    public function getScheduledDatetimeAttribute(): string
    {
        return $this->scheduled_date->format('Y-m-d') . ' ' . $this->scheduled_time->format('H:i');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['scheduled', 'approved', 'in_progress']);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopeByVisitType($query, $type)
    {
        return $query->where('visit_type', $type);
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('scheduled_date', $date);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('scheduled_date', [$startDate, $endDate]);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'in_progress')
                    ->where('actual_start_time', '<', now()->subHours(2));
    }

    public function scopeToday($query)
    {
        return $query->whereDate('scheduled_date', today());
    }

    // Boot method to auto-generate visit number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($visit) {
            if (empty($visit->visit_number)) {
                $visit->visit_number = $visit->generateVisitNumber();
            }
        });
    }

    // Mutators
    public function setVisitNumberAttribute($value)
    {
        if (!$value) {
            $this->attributes['visit_number'] = $this->generateVisitNumber();
        } else {
            $this->attributes['visit_number'] = $value;
        }
    }

    // Helper Methods
    public function generateVisitNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        $lastVisit = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastVisit ? (int) substr($lastVisit->visit_number, -4) + 1 : 1;

        return 'VST-' . $year . $month . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function canCheckIn(): bool
    {
        return $this->approval_status === 'approved' &&
               $this->status === 'scheduled' &&
               $this->scheduled_date->isToday();
    }

    public function canCheckOut(): bool
    {
        return $this->status === 'in_progress' &&
               !empty($this->check_in_time);
    }

    public function checkIn(User $user, array $additionalData = []): bool
    {
        if (!$this->canCheckIn()) {
            return false;
        }

        $this->update([
            'status' => 'in_progress',
            'check_in_time' => now(),
            'actual_start_time' => now(),
            'checked_in_by' => $user->id,
            'visitor_badge_number' => $this->generateBadgeNumber(),
            'security_screening' => $additionalData['security_screening'] ?? null,
            'items_brought' => $additionalData['items_brought'] ?? null,
        ]);

        return true;
    }

    public function checkOut(User $user, array $additionalData = []): bool
    {
        if (!$this->canCheckOut()) {
            return false;
        }

        $this->update([
            'status' => 'completed',
            'check_out_time' => now(),
            'actual_end_time' => now(),
            'checked_out_by' => $user->id,
            'visit_notes' => $additionalData['visit_notes'] ?? $this->visit_notes,
            'incident_notes' => $additionalData['incident_notes'] ?? $this->incident_notes,
        ]);

        return true;
    }

    public function approve(User $user, string $notes = null): bool
    {
        if ($this->approval_status !== 'pending') {
            return false;
        }

        $this->update([
            'approval_status' => 'approved',
            'approved_by' => $user->id,
            'approval_date' => now(),
            'approval_notes' => $notes,
        ]);

        return true;
    }

    public function deny(User $user, string $reason): bool
    {
        if ($this->approval_status !== 'pending') {
            return false;
        }

        $this->update([
            'approval_status' => 'denied',
            'status' => 'denied',
            'approved_by' => $user->id,
            'approval_date' => now(),
            'approval_notes' => $reason,
        ]);

        return true;
    }

    public function cancel(User $user, string $reason = null): bool
    {
        if (!in_array($this->status, ['scheduled', 'approved'])) {
            return false;
        }

        $this->update([
            'status' => 'cancelled',
            'approval_notes' => $reason,
            'updated_by' => $user->id,
        ]);

        return true;
    }

    private function generateBadgeNumber(): string
    {
        $date = now()->format('Ymd');
        $sequence = static::whereDate('check_in_time', today())->count() + 1;
        return 'BADGE-' . $date . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    // Validation Rules
    public static function validationRules(): array
    {
        return [
            'visitor_id' => 'required|exists:visitors,id',
            'pdl_id' => 'required|exists:pdls,id',
            'visit_type' => 'required|in:family,legal,official,emergency',
            'visit_purpose' => 'required|string|max:500',
            'scheduled_date' => 'required|date|after_or_equal:today',
            'scheduled_time' => 'required|date_format:H:i',
            'items_brought' => 'nullable|array',
            'security_screening' => 'nullable|array',
            'visit_notes' => 'nullable|string|max:1000',
        ];
    }

    public static function updateValidationRules($id): array
    {
        $rules = self::validationRules();
        // Allow past dates for updates (in case of corrections)
        $rules['scheduled_date'] = 'required|date';
        return $rules;
    }
}
