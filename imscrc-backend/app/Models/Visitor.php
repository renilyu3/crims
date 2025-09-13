<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Visitor extends Model
{
    use HasFactory;

    protected $fillable = [
        'visitor_number',
        'first_name',
        'middle_name',
        'last_name',
        'id_type',
        'id_number',
        'date_of_birth',
        'gender',
        'address',
        'contact_information',
        'emergency_contact',
        'photo_path',
        'background_check_status',
        'background_check_date',
        'background_check_expiry',
        'risk_level',
        'is_restricted',
        'restriction_reason',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'address' => 'array',
        'contact_information' => 'array',
        'emergency_contact' => 'array',
        'date_of_birth' => 'date',
        'background_check_date' => 'date',
        'background_check_expiry' => 'date',
        'is_restricted' => 'boolean',
    ];

    protected $appends = [
        'full_name',
        'age',
        'is_background_check_expired',
        'visit_count',
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
        return $this->hasMany(Visit::class);
    }

    public function backgroundChecks(): HasMany
    {
        return $this->hasMany(BackgroundCheck::class);
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

    public function getAgeAttribute(): int
    {
        return $this->date_of_birth->age ?? 0;
    }

    public function getIsBackgroundCheckExpiredAttribute(): bool
    {
        if (!$this->background_check_expiry) {
            return true;
        }
        return $this->background_check_expiry->isPast();
    }

    public function getVisitCountAttribute(): int
    {
        return $this->visits()->count();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_restricted', false);
    }

    public function scopeRestricted($query)
    {
        return $query->where('is_restricted', true);
    }

    public function scopeByBackgroundStatus($query, $status)
    {
        return $query->where('background_check_status', $status);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('middle_name', 'like', "%{$search}%")
              ->orWhere('visitor_number', 'like', "%{$search}%")
              ->orWhere('id_number', 'like', "%{$search}%");
        });
    }

    public function scopeExpiredBackgroundCheck($query)
    {
        return $query->where('background_check_expiry', '<', now())
                    ->orWhereNull('background_check_expiry');
    }

    // Mutators
    public function setVisitorNumberAttribute($value)
    {
        if (!$value) {
            $this->attributes['visitor_number'] = $this->generateVisitorNumber();
        } else {
            $this->attributes['visitor_number'] = $value;
        }
    }

    // Helper Methods
    public function generateVisitorNumber(): string
    {
        $year = date('Y');
        $lastVisitor = static::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastVisitor ? (int) substr($lastVisitor->visitor_number, -4) + 1 : 1;

        return 'VIS-' . $year . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function canVisit(): bool
    {
        return !$this->is_restricted &&
               $this->background_check_status === 'cleared' &&
               !$this->is_background_check_expired;
    }

    public function getActiveVisits()
    {
        return $this->visits()
            ->whereIn('status', ['scheduled', 'approved', 'in_progress'])
            ->get();
    }

    public function getLastVisit()
    {
        return $this->visits()
            ->where('status', 'completed')
            ->orderBy('actual_end_time', 'desc')
            ->first();
    }

    public function hasActiveBackgroundCheck(): bool
    {
        return $this->backgroundChecks()
            ->where('status', 'in_progress')
            ->exists();
    }

    public function getLatestBackgroundCheck()
    {
        return $this->backgroundChecks()
            ->orderBy('check_date', 'desc')
            ->first();
    }

    public function addPhoto(string $photoPath): void
    {
        $this->photo_path = $photoPath;
        $this->save();
    }

    public function removePhoto(): void
    {
        $this->photo_path = null;
        $this->save();
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
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'id_type' => 'required|string|max:255',
            'id_number' => 'required|string|max:255|unique:visitors,id_number',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',
            'address' => 'required|array',
            'address.street' => 'required|string',
            'address.city' => 'required|string',
            'address.province' => 'required|string',
            'address.postal_code' => 'nullable|string',
            'contact_information' => 'required|array',
            'contact_information.phone' => 'required|string',
            'contact_information.email' => 'nullable|email',
            'emergency_contact' => 'nullable|array',
            'emergency_contact.name' => 'required_with:emergency_contact|string',
            'emergency_contact.phone' => 'required_with:emergency_contact|string',
            'emergency_contact.relationship' => 'required_with:emergency_contact|string',
        ];
    }

    public static function updateValidationRules($id): array
    {
        $rules = self::validationRules();
        $rules['id_number'] = 'required|string|max:255|unique:visitors,id_number,' . $id;
        return $rules;
    }
}
