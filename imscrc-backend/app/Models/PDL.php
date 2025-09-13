<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PDL extends Model
{
    use HasFactory;

    protected $table = 'pdls';

    protected $fillable = [
        'pdl_number',
        // Personal Information
        'first_name',
        'middle_name',
        'last_name',
        'aliases',
        'date_of_birth',
        'place_of_birth',
        'gender',
        'civil_status',
        'nationality',
        'religion',
        // Contact Information
        'address',
        'contact_information',
        'emergency_contacts',
        'physical_characteristics',
        // Legal Information
        'case_number',
        'charges',
        'court_information',
        'sentence_details',
        'legal_status',
        // Admission Details
        'admission_date',
        'admission_time',
        'arresting_officer',
        'arresting_agency',
        'property_inventory',
        'medical_screening',
        // System Information
        'status',
        'cell_assignment',
        'notes',
        'photos',
        // Audit fields
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        // Personal Information
        'aliases' => 'array',
        'date_of_birth' => 'date',
        // Contact Information
        'address' => 'array',
        'contact_information' => 'array',
        'emergency_contacts' => 'array',
        'physical_characteristics' => 'array',
        // Legal Information
        'charges' => 'array',
        'court_information' => 'array',
        'sentence_details' => 'array',
        // Admission Details
        'admission_date' => 'date',
        'admission_time' => 'datetime:H:i',
        'property_inventory' => 'array',
        'medical_screening' => 'array',
        // System Information
        'photos' => 'array',
    ];

    protected $appends = [
        'full_name',
        'age',
        'days_in_custody',
        'is_active',
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

    public function visitorCheckins(): HasMany
    {
        return $this->hasMany(VisitorCheckin::class);
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

    public function getDaysInCustodyAttribute(): int
    {
        if (!$this->admission_date) {
            return 0;
        }

        $endDate = $this->status === 'released' ? $this->updated_at : now();
        return $this->admission_date->diffInDays($endDate);
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeReleased($query)
    {
        return $query->where('status', 'released');
    }

    public function scopeTransferred($query)
    {
        return $query->where('status', 'transferred');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('middle_name', 'like', "%{$search}%")
              ->orWhere('pdl_number', 'like', "%{$search}%")
              ->orWhere('case_number', 'like', "%{$search}%");
        });
    }

    // Mutators
    public function setPdlNumberAttribute($value)
    {
        if (!$value) {
            $this->attributes['pdl_number'] = $this->generatePdlNumber();
        } else {
            $this->attributes['pdl_number'] = $value;
        }
    }

    // Helper Methods
    public function generatePdlNumber(): string
    {
        $year = date('Y');
        $lastPdl = static::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastPdl ? (int) substr($lastPdl->pdl_number, -4) + 1 : 1;

        return 'PDL-' . $year . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function canReceiveVisitors(): bool
    {
        return $this->status === 'active';
    }

    public function getActiveVisits()
    {
        return $this->visitorCheckins()
            ->whereNull('check_out_time')
            ->get();
    }

    public function getTotalVisits(): int
    {
        return $this->visitorCheckins()->count();
    }

    public function getLastVisit()
    {
        return $this->visitorCheckins()
            ->whereNotNull('check_out_time')
            ->orderBy('check_out_time', 'desc')
            ->first();
    }

    // Validation Rules
    public static function validationRules(): array
    {
        return [
            // Personal Information
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'aliases' => 'nullable|array',
            'date_of_birth' => 'required|date|before:today',
            'place_of_birth' => 'required|string|max:255',
            'gender' => 'required|in:male,female,other',
            'civil_status' => 'required|in:single,married,divorced,widowed,separated',
            'nationality' => 'required|string|max:255',
            'religion' => 'nullable|string|max:255',

            // Contact Information
            'address' => 'required|array',
            'address.current' => 'required|string',
            'address.permanent' => 'nullable|string',
            'contact_information' => 'nullable|array',
            'contact_information.phone' => 'nullable|string',
            'contact_information.email' => 'nullable|email',
            'emergency_contacts' => 'nullable|array',
            'physical_characteristics' => 'nullable|array',

            // Legal Information
            'case_number' => 'required|string|max:255',
            'charges' => 'required|array|min:1',
            'court_information' => 'nullable|array',
            'sentence_details' => 'nullable|array',
            'legal_status' => 'required|in:detained,convicted,acquitted,transferred,released',

            // Admission Details
            'admission_date' => 'required|date',
            'admission_time' => 'required|date_format:H:i',
            'arresting_officer' => 'nullable|string|max:255',
            'arresting_agency' => 'nullable|string|max:255',
            'property_inventory' => 'nullable|array',
            'medical_screening' => 'nullable|array',

            // System Information
            'status' => 'required|in:active,transferred,released,deceased',
            'cell_assignment' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'photos' => 'nullable|array',
        ];
    }

    public static function updateValidationRules($id): array
    {
        $rules = self::validationRules();
        $rules['pdl_number'] = 'required|string|max:255|unique:pdls,pdl_number,' . $id;
        return $rules;
    }
}
