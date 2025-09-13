<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'template_data',
        'filters',
        'created_by',
        'is_public',
        'is_active',
    ];

    protected $casts = [
        'template_data' => 'array',
        'filters' => 'array',
        'is_public' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function generations(): HasMany
    {
        return $this->hasMany(ReportGeneration::class);
    }

    public function recentGenerations(): HasMany
    {
        return $this->hasMany(ReportGeneration::class)->latest()->limit(10);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeAccessibleBy($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('is_public', true)
              ->orWhere('created_by', $userId);
        });
    }

    // Helper Methods
    public function canBeAccessedBy($userId): bool
    {
        return $this->is_public || $this->created_by === $userId;
    }

    public function getLastGeneration(): ?ReportGeneration
    {
        return $this->generations()->latest()->first();
    }

    public function getTotalGenerations(): int
    {
        return $this->generations()->count();
    }

    public function getSuccessfulGenerations(): int
    {
        return $this->generations()->where('status', 'completed')->count();
    }

    public function getFailedGenerations(): int
    {
        return $this->generations()->where('status', 'failed')->count();
    }

    // Template Data Helpers
    public function getFields(): array
    {
        return $this->template_data['fields'] ?? [];
    }

    public function getDefaultFilters(): array
    {
        return $this->filters ?? [];
    }

    public function getLayout(): string
    {
        return $this->template_data['layout'] ?? 'default';
    }

    public function getTitle(): string
    {
        return $this->template_data['title'] ?? $this->name;
    }

    // Validation Rules
    public static function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:pdf,excel,dashboard',
            'template_data' => 'required|array',
            'template_data.fields' => 'required|array|min:1',
            'template_data.title' => 'nullable|string|max:255',
            'template_data.layout' => 'nullable|string|in:default,detailed,summary',
            'filters' => 'nullable|array',
            'is_public' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public static function updateValidationRules($id): array
    {
        $rules = self::validationRules();
        return $rules;
    }
}
