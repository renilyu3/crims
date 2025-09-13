<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ReportGeneration extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'generated_by',
        'report_name',
        'file_path',
        'file_name',
        'file_type',
        'parameters',
        'status',
        'error_message',
        'file_size',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'parameters' => 'array',
        'file_size' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Relationships
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('generated_by', $userId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('file_type', $type);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Status Methods
    public function markAsProcessing(): void
    {
        $this->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);
    }

    public function markAsCompleted(string $filePath, string $fileName, int $fileSize): void
    {
        $this->update([
            'status' => 'completed',
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'completed_at' => now(),
            'error_message' => null,
        ]);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'completed_at' => now(),
        ]);
    }

    // File Methods
    public function fileExists(): bool
    {
        return $this->file_path && Storage::exists($this->file_path);
    }

    public function getFileUrl(): ?string
    {
        if (!$this->fileExists()) {
            return null;
        }

        return Storage::url($this->file_path);
    }

    public function getFileContents(): ?string
    {
        if (!$this->fileExists()) {
            return null;
        }

        return Storage::get($this->file_path);
    }

    public function downloadFile()
    {
        if (!$this->fileExists()) {
            return null;
        }

        return Storage::download($this->file_path, $this->file_name);
    }

    public function deleteFile(): bool
    {
        if (!$this->fileExists()) {
            return true;
        }

        return Storage::delete($this->file_path);
    }

    // Helper Methods
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function getProcessingTime(): ?int
    {
        if (!$this->started_at || !$this->completed_at) {
            return null;
        }

        return $this->completed_at->diffInSeconds($this->started_at);
    }

    public function getFormattedFileSize(): string
    {
        if (!$this->file_size) {
            return 'Unknown';
        }

        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getStatusBadgeClass(): string
    {
        return match ($this->status) {
            'completed' => 'bg-success',
            'failed' => 'bg-danger',
            'processing' => 'bg-warning',
            'pending' => 'bg-secondary',
            default => 'bg-secondary',
        };
    }

    public function getStatusIcon(): string
    {
        return match ($this->status) {
            'completed' => 'bi-check-circle',
            'failed' => 'bi-x-circle',
            'processing' => 'bi-arrow-clockwise',
            'pending' => 'bi-clock',
            default => 'bi-question-circle',
        };
    }

    // Validation Rules
    public static function validationRules(): array
    {
        return [
            'report_id' => 'nullable|exists:reports,id',
            'report_name' => 'required|string|max:255',
            'file_type' => 'required|in:pdf,xlsx,csv',
            'parameters' => 'nullable|array',
        ];
    }

    // Clean up old files (can be called by a scheduled job)
    public static function cleanupOldFiles(int $daysOld = 30): int
    {
        $oldGenerations = self::where('created_at', '<', now()->subDays($daysOld))
            ->where('status', 'completed')
            ->get();

        $deletedCount = 0;
        foreach ($oldGenerations as $generation) {
            if ($generation->deleteFile()) {
                $generation->delete();
                $deletedCount++;
            }
        }

        return $deletedCount;
    }
}
