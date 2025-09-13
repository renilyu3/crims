<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActiveVisitor extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'phone_number',
        'email',
        'address',
        'id_type',
        'id_number',
        'date_of_birth',
        'gender',
        'pdl_id',
        'visit_purpose',
        'visit_type',
        'check_in_time',
        'visitor_badge_number',
        'checked_in_by',
        'items_brought',
        'security_screening',
        'notes',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'photo_path',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'check_in_time' => 'datetime',
        'items_brought' => 'array',
        'security_screening' => 'array',
    ];

    protected $appends = [
        'full_name',
        'duration_minutes',
        'is_overdue',
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

    // Accessors
    public function getFullNameAttribute(): string
    {
        $name = $this->first_name;
        if ($this->middle_name) {
            $name .= ' ' . $this->middle_name;
        }
        $name .= ' ' . $this->last_name;
        return $name;
    }

    public function getDurationMinutesAttribute(): int
    {
        return $this->check_in_time->diffInMinutes(now());
    }

    public function getIsOverdueAttribute(): bool
    {
        // Consider visit overdue if it's been more than 2 hours
        return $this->check_in_time->diffInHours(now()) > 2;
    }

    // Scopes
    public function scopeOverdue($query)
    {
        return $query->where('check_in_time', '<', now()->subHours(2));
    }

    public function scopeByPdl($query, $pdlId)
    {
        return $query->where('pdl_id', $pdlId);
    }

    public function scopeByVisitType($query, $type)
    {
        return $query->where('visit_type', $type);
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
              ->orWhere('middle_name', 'like', "%{$search}%")
              ->orWhere('phone_number', 'like', "%{$search}%")
              ->orWhere('visitor_badge_number', 'like', "%{$search}%");
        });
    }

    // Helper Methods
    public function generateBadgeNumber(): string
    {
        $date = now()->format('Ymd');
        $sequence = static::whereDate('check_in_time', today())->count() + 1;
        return 'BADGE-' . $date . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    public function checkOut(User $user, array $additionalData = []): VisitorCheckin
    {
        // Create a record in visitor_checkins (history) table
        $historyRecord = VisitorCheckin::create([
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'middle_name' => $this->middle_name,
            'phone_number' => $this->phone_number,
            'email' => $this->email,
            'address' => $this->address,
            'id_type' => $this->id_type,
            'id_number' => $this->id_number,
            'date_of_birth' => $this->date_of_birth,
            'gender' => $this->gender,
            'pdl_id' => $this->pdl_id,
            'visit_purpose' => $this->visit_purpose,
            'visit_type' => $this->visit_type,
            'time_in' => $this->check_in_time,
            'time_out' => now(),
            'visitor_badge_number' => $this->visitor_badge_number,
            'checked_in_by' => $this->checked_in_by,
            'checked_out_by' => $user->id,
            'items_brought' => $this->items_brought,
            'security_screening' => $this->security_screening,
            'notes' => $additionalData['notes'] ?? $this->notes,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'emergency_contact_relationship' => $this->emergency_contact_relationship,
            'photo_path' => $this->photo_path,
            'status' => 'completed',
        ]);

        // Remove from active visitors table
        $this->delete();

        return $historyRecord;
    }

    public function hasPhoto(): bool
    {
        return !empty($this->photo_path);
    }

    // Validation Rules
    public static function validationRules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'phone_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'required|string|max:500',
            'id_type' => 'nullable|string|max:100',
            'id_number' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'pdl_id' => 'required|exists:pdls,id',
            'visit_purpose' => 'nullable|string|max:500',
            'visit_type' => 'required|in:family,legal,official,emergency',
            'items_brought' => 'nullable|array',
            'security_screening' => 'nullable|array',
            'notes' => 'nullable|string|max:1000',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:100',
        ];
    }
}
