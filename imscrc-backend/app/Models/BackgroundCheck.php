<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BackgroundCheck extends Model
{
    use HasFactory;

    protected $fillable = [
        'visitor_id',
        'check_type',
        'check_date',
        'expiry_date',
        'check_result',
        'status',
        'risk_assessment',
        'criminal_history',
        'watchlist_match',
        'previous_incidents',
        'flags',
        'checked_by',
        'approved_by',
        'completed_date',
        'notes',
        'recommendations',
        'external_reference_number',
        'external_data',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'check_date' => 'date',
        'expiry_date' => 'date',
        'completed_date' => 'datetime',
        'check_result' => 'array',
        'flags' => 'array',
        'external_data' => 'array',
        'criminal_history' => 'boolean',
        'watchlist_match' => 'boolean',
        'previous_incidents' => 'boolean',
    ];

    protected $appends = [
        'is_expired',
        'days_until_expiry',
        'is_pending',
        'is_cleared',
    ];

    // Relationships
    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }

    public function checkedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
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
    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function getDaysUntilExpiryAttribute(): ?int
    {
        if (!$this->expiry_date) {
            return null;
        }
        return max(0, now()->diffInDays($this->expiry_date, false));
    }

    public function getIsPendingAttribute(): bool
    {
        return in_array($this->status, ['pending', 'in_progress']);
    }

    public function getIsClearedAttribute(): bool
    {
        return $this->status === 'cleared';
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'in_progress']);
    }

    public function scopeCleared($query)
    {
        return $query->where('status', 'cleared');
    }

    public function scopeFlagged($query)
    {
        return $query->where('status', 'flagged');
    }

    public function scopeDenied($query)
    {
        return $query->where('status', 'denied');
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    public function scopeExpiringWithin($query, $days)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days))
                    ->where('expiry_date', '>', now());
    }

    public function scopeByCheckType($query, $type)
    {
        return $query->where('check_type', $type);
    }

    public function scopeByRiskLevel($query, $level)
    {
        return $query->where('risk_assessment', $level);
    }

    public function scopeWithFlags($query)
    {
        return $query->where(function ($q) {
            $q->where('criminal_history', true)
              ->orWhere('watchlist_match', true)
              ->orWhere('previous_incidents', true)
              ->orWhereNotNull('flags');
        });
    }

    // Helper Methods
    public function complete(User $user, array $results): bool
    {
        if (!$this->is_pending) {
            return false;
        }

        $status = $this->determineStatus($results);
        $riskLevel = $this->assessRisk($results);

        $this->update([
            'status' => $status,
            'risk_assessment' => $riskLevel,
            'check_result' => $results,
            'criminal_history' => $results['criminal_history'] ?? false,
            'watchlist_match' => $results['watchlist_match'] ?? false,
            'previous_incidents' => $results['previous_incidents'] ?? false,
            'flags' => $results['flags'] ?? null,
            'checked_by' => $user->id,
            'completed_date' => now(),
            'expiry_date' => $this->calculateExpiryDate($status),
        ]);

        // Update visitor's background check status
        $this->visitor->update([
            'background_check_status' => $status,
            'background_check_date' => $this->check_date,
            'background_check_expiry' => $this->expiry_date,
            'risk_level' => $riskLevel,
        ]);

        return true;
    }

    public function approve(User $user, string $notes = null): bool
    {
        if ($this->status !== 'flagged') {
            return false;
        }

        $this->update([
            'status' => 'cleared',
            'approved_by' => $user->id,
            'notes' => $notes,
            'expiry_date' => $this->calculateExpiryDate('cleared'),
        ]);

        // Update visitor status
        $this->visitor->update([
            'background_check_status' => 'cleared',
            'background_check_expiry' => $this->expiry_date,
        ]);

        return true;
    }

    public function deny(User $user, string $reason): bool
    {
        if (!in_array($this->status, ['pending', 'in_progress', 'flagged'])) {
            return false;
        }

        $this->update([
            'status' => 'denied',
            'approved_by' => $user->id,
            'notes' => $reason,
            'completed_date' => now(),
        ]);

        // Update visitor status
        $this->visitor->update([
            'background_check_status' => 'denied',
            'is_restricted' => true,
            'restriction_reason' => 'Background check denied: ' . $reason,
        ]);

        return true;
    }

    public function needsRenewal(): bool
    {
        return $this->is_expired || ($this->expiry_date && $this->expiry_date->diffInDays(now()) <= 30);
    }

    private function determineStatus(array $results): string
    {
        $hasFlags = $results['criminal_history'] ?? false ||
                   $results['watchlist_match'] ?? false ||
                   $results['previous_incidents'] ?? false ||
                   !empty($results['flags']);

        return $hasFlags ? 'flagged' : 'cleared';
    }

    private function assessRisk(array $results): string
    {
        $riskScore = 0;

        if ($results['criminal_history'] ?? false) {
            $riskScore += 3;
        }

        if ($results['watchlist_match'] ?? false) {
            $riskScore += 5;
        }

        if ($results['previous_incidents'] ?? false) {
            $riskScore += 2;
        }

        if (!empty($results['flags'])) {
            $riskScore += count($results['flags']);
        }

        if ($riskScore >= 5) {
            return 'high';
        } elseif ($riskScore >= 2) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    private function calculateExpiryDate(string $status): ?\Carbon\Carbon
    {
        if ($status === 'denied') {
            return null;
        }

        // Background checks expire after 1 year for cleared status
        // or 6 months for flagged status
        $months = $status === 'cleared' ? 12 : 6;
        return now()->addMonths($months);
    }

    // Validation Rules
    public static function validationRules(): array
    {
        return [
            'visitor_id' => 'required|exists:visitors,id',
            'check_type' => 'required|in:initial,renewal,update,appeal',
            'check_date' => 'required|date',
            'check_result' => 'nullable|array',
            'status' => 'required|in:pending,in_progress,cleared,flagged,denied',
            'risk_assessment' => 'nullable|in:low,medium,high',
            'criminal_history' => 'boolean',
            'watchlist_match' => 'boolean',
            'previous_incidents' => 'boolean',
            'flags' => 'nullable|array',
            'notes' => 'nullable|string|max:1000',
            'recommendations' => 'nullable|string|max:1000',
            'external_reference_number' => 'nullable|string|max:255',
            'external_data' => 'nullable|array',
        ];
    }

    public static function updateValidationRules($id): array
    {
        return self::validationRules();
    }
}
