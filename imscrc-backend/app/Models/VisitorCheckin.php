<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitorCheckin extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'phone_number',
        'address',
        'pdl_id',
        'purpose',
        'check_in_time',
        'check_out_time',
        'status',
        'duration_minutes',
        'notes',
        'checked_in_by',
        'checked_out_by',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
    ];

    protected $appends = [
        'full_name',
        'is_active',
        'formatted_duration',
    ];

    // Relationships
    public function pdl(): BelongsTo
    {
        return $this->belongsTo(PDL::class);
    }

    public function checkedInBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }

    public function checkedOutBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_out_by');
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getFormattedDurationAttribute(): ?string
    {
        if (!$this->duration_minutes) {
            return null;
        }

        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;

        if ($hours > 0) {
            return "{$hours}h {$minutes}m";
        }
        return "{$minutes}m";
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('check_in_time', today());
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('phone_number', 'like', "%{$search}%");
        });
    }

    // Helper Methods
    public function checkOut(User $user, string $notes = null): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        $checkOutTime = now();
        $durationMinutes = $this->check_in_time->diffInMinutes($checkOutTime);

        $this->update([
            'status' => 'completed',
            'check_out_time' => $checkOutTime,
            'duration_minutes' => $durationMinutes,
            'checked_out_by' => $user->id,
            'notes' => $notes ?? $this->notes,
        ]);

        return true;
    }

    public function getCurrentDuration(): string
    {
        if ($this->status === 'completed') {
            return $this->formatted_duration ?? '0m';
        }

        $minutes = $this->check_in_time->diffInMinutes(now());
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;

        if ($hours > 0) {
            return "{$hours}h {$mins}m";
        }
        return "{$mins}m";
    }

    // Validation Rules
    public static function validationRules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
