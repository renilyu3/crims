<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScheduleConflict;
use App\Services\ConflictDetectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ConflictController extends Controller
{
    protected $conflictService;

    public function __construct(ConflictDetectionService $conflictService)
    {
        $this->conflictService = $conflictService;
    }

    /**
     * Display a listing of conflicts.
     */
    public function index(Request $request)
    {
        try {
            $query = ScheduleConflict::with([
                'schedule1.pdl',
                'schedule1.scheduleType',
                'schedule1.facility',
                'schedule2.pdl',
                'schedule2.scheduleType',
                'schedule2.facility',
                'resolver'
            ]);

            // Filter by status
            if ($request->has('status')) {
                if ($request->status === 'unresolved') {
                    $query->unresolved();
                } elseif ($request->status === 'resolved') {
                    $query->resolved();
                } else {
                    $query->where('status', $request->status);
                }
            }

            // Filter by severity
            if ($request->has('severity')) {
                $query->bySeverity($request->severity);
            }

            // Filter by conflict type
            if ($request->has('type')) {
                $query->where('conflict_type', $request->type);
            }

            $conflicts = $query->orderBy('severity', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $conflicts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching conflicts: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified conflict.
     */
    public function show($id)
    {
        try {
            $conflict = ScheduleConflict::with([
                'schedule1.pdl',
                'schedule1.scheduleType',
                'schedule1.facility',
                'schedule1.program',
                'schedule2.pdl',
                'schedule2.scheduleType',
                'schedule2.facility',
                'schedule2.program',
                'resolver'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $conflict,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Conflict not found',
            ], 404);
        }
    }

    /**
     * Resolve a conflict.
     */
    public function resolve(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'resolution_notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $conflict = $this->conflictService->resolveConflict(
                $id,
                Auth::id(),
                $request->resolution_notes
            );

            return response()->json([
                'success' => true,
                'data' => $conflict,
                'message' => 'Conflict resolved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error resolving conflict: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Acknowledge a conflict.
     */
    public function acknowledge($id)
    {
        try {
            $conflict = ScheduleConflict::findOrFail($id);
            $conflict->acknowledge();

            return response()->json([
                'success' => true,
                'data' => $conflict,
                'message' => 'Conflict acknowledged',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error acknowledging conflict: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ignore a conflict.
     */
    public function ignore($id)
    {
        try {
            $conflict = ScheduleConflict::findOrFail($id);
            $conflict->ignore();

            return response()->json([
                'success' => true,
                'data' => $conflict,
                'message' => 'Conflict ignored',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error ignoring conflict: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get unresolved conflicts.
     */
    public function unresolved()
    {
        try {
            $conflicts = $this->conflictService->getUnresolvedConflicts();

            return response()->json([
                'success' => true,
                'data' => $conflicts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching unresolved conflicts: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check for conflicts in a time period.
     */
    public function check(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'pdl_id' => 'required|exists:pdls,id',
                'facility_id' => 'nullable|exists:facilities,id',
                'start_datetime' => 'required|date',
                'end_datetime' => 'required|date|after:start_datetime',
                'exclude_schedule_id' => 'nullable|integer',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $availability = $this->conflictService->checkAvailability(
                $request->pdl_id,
                $request->facility_id,
                $request->start_datetime,
                $request->end_datetime,
                $request->exclude_schedule_id
            );

            return response()->json([
                'success' => true,
                'data' => $availability,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking conflicts: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get conflict statistics.
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_conflicts' => ScheduleConflict::count(),
                'unresolved_conflicts' => ScheduleConflict::unresolved()->count(),
                'critical_conflicts' => ScheduleConflict::critical()->unresolved()->count(),
                'conflicts_by_type' => ScheduleConflict::selectRaw('conflict_type, COUNT(*) as count')
                    ->groupBy('conflict_type')
                    ->pluck('count', 'conflict_type'),
                'conflicts_by_severity' => ScheduleConflict::selectRaw('severity, COUNT(*) as count')
                    ->groupBy('severity')
                    ->pluck('count', 'severity'),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching conflict statistics: ' . $e->getMessage(),
            ], 500);
        }
    }
}
