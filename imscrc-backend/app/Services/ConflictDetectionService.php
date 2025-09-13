<?php

namespace App\Services;

use App\Models\Schedule;
use App\Models\ScheduleConflict;
use Carbon\Carbon;

class ConflictDetectionService
{
    /**
     * Detect conflicts for a given schedule.
     */
    public function detectConflicts(Schedule $schedule)
    {
        $conflicts = [];

        // Check for PDL double booking
        $pdlConflicts = $this->checkPdlConflicts($schedule);
        $conflicts = array_merge($conflicts, $pdlConflicts);

        // Check for facility double booking
        if ($schedule->facility_id) {
            $facilityConflicts = $this->checkFacilityConflicts($schedule);
            $conflicts = array_merge($conflicts, $facilityConflicts);
        }

        // Check for officer conflicts
        if ($schedule->responsible_officer) {
            $officerConflicts = $this->checkOfficerConflicts($schedule);
            $conflicts = array_merge($conflicts, $officerConflicts);
        }

        // Store detected conflicts
        foreach ($conflicts as $conflict) {
            $this->storeConflict($conflict);
        }

        return $conflicts;
    }

    /**
     * Check for PDL double booking conflicts.
     */
    protected function checkPdlConflicts(Schedule $schedule)
    {
        $conflicts = [];

        $overlappingSchedules = Schedule::where('pdl_id', $schedule->pdl_id)
            ->where('id', '!=', $schedule->id)
            ->whereNotIn('status', ['cancelled'])
            ->where(function ($query) use ($schedule) {
                $query->whereBetween('start_datetime', [$schedule->start_datetime, $schedule->end_datetime])
                    ->orWhereBetween('end_datetime', [$schedule->start_datetime, $schedule->end_datetime])
                    ->orWhere(function ($q) use ($schedule) {
                        $q->where('start_datetime', '<=', $schedule->start_datetime)
                          ->where('end_datetime', '>=', $schedule->end_datetime);
                    });
            })
            ->get();

        foreach ($overlappingSchedules as $conflictingSchedule) {
            $conflicts[] = [
                'schedule_1_id' => $schedule->id,
                'schedule_2_id' => $conflictingSchedule->id,
                'conflict_type' => 'pdl_double_booking',
                'description' => "PDL {$schedule->pdl->first_name} {$schedule->pdl->last_name} has overlapping schedules",
                'severity' => $this->calculateSeverity($schedule, $conflictingSchedule),
            ];
        }

        return $conflicts;
    }

    /**
     * Check for facility double booking conflicts.
     */
    protected function checkFacilityConflicts(Schedule $schedule)
    {
        $conflicts = [];

        $overlappingSchedules = Schedule::where('facility_id', $schedule->facility_id)
            ->where('id', '!=', $schedule->id)
            ->whereNotIn('status', ['cancelled'])
            ->where(function ($query) use ($schedule) {
                $query->whereBetween('start_datetime', [$schedule->start_datetime, $schedule->end_datetime])
                    ->orWhereBetween('end_datetime', [$schedule->start_datetime, $schedule->end_datetime])
                    ->orWhere(function ($q) use ($schedule) {
                        $q->where('start_datetime', '<=', $schedule->start_datetime)
                          ->where('end_datetime', '>=', $schedule->end_datetime);
                    });
            })
            ->get();

        foreach ($overlappingSchedules as $conflictingSchedule) {
            $conflicts[] = [
                'schedule_1_id' => $schedule->id,
                'schedule_2_id' => $conflictingSchedule->id,
                'conflict_type' => 'facility_double_booking',
                'description' => "Facility {$schedule->facility->name} is double booked",
                'severity' => $this->calculateSeverity($schedule, $conflictingSchedule),
            ];
        }

        return $conflicts;
    }

    /**
     * Check for officer conflicts.
     */
    protected function checkOfficerConflicts(Schedule $schedule)
    {
        $conflicts = [];

        $overlappingSchedules = Schedule::where('responsible_officer', $schedule->responsible_officer)
            ->where('id', '!=', $schedule->id)
            ->whereNotIn('status', ['cancelled'])
            ->where(function ($query) use ($schedule) {
                $query->whereBetween('start_datetime', [$schedule->start_datetime, $schedule->end_datetime])
                    ->orWhereBetween('end_datetime', [$schedule->start_datetime, $schedule->end_datetime])
                    ->orWhere(function ($q) use ($schedule) {
                        $q->where('start_datetime', '<=', $schedule->start_datetime)
                          ->where('end_datetime', '>=', $schedule->end_datetime);
                    });
            })
            ->get();

        foreach ($overlappingSchedules as $conflictingSchedule) {
            $conflicts[] = [
                'schedule_1_id' => $schedule->id,
                'schedule_2_id' => $conflictingSchedule->id,
                'conflict_type' => 'officer_conflict',
                'description' => "Officer {$schedule->responsible_officer} has overlapping assignments",
                'severity' => $this->calculateSeverity($schedule, $conflictingSchedule),
            ];
        }

        return $conflicts;
    }

    /**
     * Calculate conflict severity based on schedule types and timing.
     */
    protected function calculateSeverity(Schedule $schedule1, Schedule $schedule2)
    {
        // Court appearances are critical
        if ($schedule1->scheduleType->name === 'court' || $schedule2->scheduleType->name === 'court') {
            return 'critical';
        }

        // Complete overlap is high severity
        if ($schedule1->start_datetime == $schedule2->start_datetime &&
            $schedule1->end_datetime == $schedule2->end_datetime) {
            return 'high';
        }

        // Partial overlap is medium severity
        return 'medium';
    }

    /**
     * Store conflict in database.
     */
    protected function storeConflict(array $conflictData)
    {
        // Check if conflict already exists
        $existingConflict = ScheduleConflict::where(function ($query) use ($conflictData) {
            $query->where('schedule_1_id', $conflictData['schedule_1_id'])
                  ->where('schedule_2_id', $conflictData['schedule_2_id']);
        })->orWhere(function ($query) use ($conflictData) {
            $query->where('schedule_1_id', $conflictData['schedule_2_id'])
                  ->where('schedule_2_id', $conflictData['schedule_1_id']);
        })->first();

        if (!$existingConflict) {
            ScheduleConflict::create($conflictData);
        }
    }

    /**
     * Check availability for a time slot.
     */
    public function checkAvailability($pdlId, $facilityId, $startTime, $endTime, $excludeScheduleId = null)
    {
        $conflicts = [];

        // Check PDL availability
        $pdlConflicts = Schedule::where('pdl_id', $pdlId)
            ->whereNotIn('status', ['cancelled'])
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_datetime', [$startTime, $endTime])
                    ->orWhereBetween('end_datetime', [$startTime, $endTime])
                    ->orWhere(function ($q) use ($startTime, $endTime) {
                        $q->where('start_datetime', '<=', $startTime)
                          ->where('end_datetime', '>=', $endTime);
                    });
            });

        if ($excludeScheduleId) {
            $pdlConflicts->where('id', '!=', $excludeScheduleId);
        }

        if ($pdlConflicts->exists()) {
            $conflicts[] = 'PDL is not available during this time';
        }

        // Check facility availability
        if ($facilityId) {
            $facilityConflicts = Schedule::where('facility_id', $facilityId)
                ->whereNotIn('status', ['cancelled'])
                ->where(function ($query) use ($startTime, $endTime) {
                    $query->whereBetween('start_datetime', [$startTime, $endTime])
                        ->orWhereBetween('end_datetime', [$startTime, $endTime])
                        ->orWhere(function ($q) use ($startTime, $endTime) {
                            $q->where('start_datetime', '<=', $startTime)
                              ->where('end_datetime', '>=', $endTime);
                        });
                });

            if ($excludeScheduleId) {
                $facilityConflicts->where('id', '!=', $excludeScheduleId);
            }

            if ($facilityConflicts->exists()) {
                $conflicts[] = 'Facility is not available during this time';
            }
        }

        return [
            'available' => empty($conflicts),
            'conflicts' => $conflicts,
        ];
    }

    /**
     * Get all unresolved conflicts.
     */
    public function getUnresolvedConflicts()
    {
        return ScheduleConflict::with(['schedule1.pdl', 'schedule1.scheduleType', 'schedule2.pdl', 'schedule2.scheduleType'])
            ->unresolved()
            ->orderBy('severity', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Resolve conflict.
     */
    public function resolveConflict($conflictId, $userId, $notes = null)
    {
        $conflict = ScheduleConflict::findOrFail($conflictId);
        $conflict->resolve($userId, $notes);

        return $conflict;
    }
}
