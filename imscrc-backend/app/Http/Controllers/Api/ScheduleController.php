<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\ScheduleConflict;
use App\Services\ConflictDetectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    protected $conflictService;

    public function __construct(ConflictDetectionService $conflictService)
    {
        $this->conflictService = $conflictService;
    }

    /**
     * Display a listing of schedules.
     */
    public function index(Request $request)
    {
        try {
            $query = Schedule::with(['scheduleType', 'pdl', 'facility', 'program', 'visitor', 'creator']);

            // Filter by date range
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->dateRange($request->start_date, $request->end_date);
            }

            // Filter by PDL
            if ($request->has('pdl_id')) {
                $query->forPdl($request->pdl_id);
            }

            // Filter by schedule type
            if ($request->has('type_id')) {
                $query->ofType($request->type_id);
            }

            // Filter by status
            if ($request->has('status')) {
                $query->withStatus($request->status);
            }

            // Filter by facility
            if ($request->has('facility_id')) {
                $query->where('facility_id', $request->facility_id);
            }

            // Sort by start datetime
            $query->orderBy('start_datetime', 'asc');

            $perPage = $request->get('per_page', 15);
            $schedules = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $schedules,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching schedules: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created schedule.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'schedule_type_id' => 'required|exists:schedule_types,id',
                'pdl_id' => 'required|exists:pdls,id',
                'title' => 'required|string|max:255',
                'start_datetime' => 'required|date|after:now',
                'end_datetime' => 'required|date|after:start_datetime',
                'facility_id' => 'nullable|exists:facilities,id',
                'program_id' => 'nullable|exists:programs,id',
                'visitor_id' => 'nullable|exists:visitors,id',
                'location' => 'nullable|string|max:255',
                'responsible_officer' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'notes' => 'nullable|string',
                'additional_data' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            DB::beginTransaction();

            $schedule = Schedule::create([
                ...$validator->validated(),
                'created_by' => Auth::id(),
                'status' => 'scheduled',
            ]);

            // Check for conflicts
            $conflicts = $this->conflictService->detectConflicts($schedule);

            DB::commit();

            $schedule->load(['scheduleType', 'pdl', 'facility', 'program', 'visitor', 'creator']);

            return response()->json([
                'success' => true,
                'data' => $schedule,
                'conflicts' => $conflicts,
                'message' => 'Schedule created successfully',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating schedule: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified schedule.
     */
    public function show($id)
    {
        try {
            $schedule = Schedule::with(['scheduleType', 'pdl', 'facility', 'program', 'visitor', 'creator', 'updater'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $schedule,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found',
            ], 404);
        }
    }

    /**
     * Update the specified schedule.
     */
    public function update(Request $request, $id)
    {
        try {
            $schedule = Schedule::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'schedule_type_id' => 'sometimes|exists:schedule_types,id',
                'pdl_id' => 'sometimes|exists:pdls,id',
                'title' => 'sometimes|string|max:255',
                'start_datetime' => 'sometimes|date',
                'end_datetime' => 'sometimes|date|after:start_datetime',
                'facility_id' => 'nullable|exists:facilities,id',
                'program_id' => 'nullable|exists:programs,id',
                'visitor_id' => 'nullable|exists:visitors,id',
                'location' => 'nullable|string|max:255',
                'responsible_officer' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'notes' => 'nullable|string',
                'status' => 'sometimes|in:scheduled,confirmed,completed,cancelled,rescheduled',
                'additional_data' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            DB::beginTransaction();

            $schedule->update([
                ...$validator->validated(),
                'updated_by' => Auth::id(),
            ]);

            // Check for conflicts if datetime changed
            $conflicts = [];
            if ($request->has('start_datetime') || $request->has('end_datetime')) {
                $conflicts = $this->conflictService->detectConflicts($schedule);
            }

            DB::commit();

            $schedule->load(['scheduleType', 'pdl', 'facility', 'program', 'visitor', 'creator', 'updater']);

            return response()->json([
                'success' => true,
                'data' => $schedule,
                'conflicts' => $conflicts,
                'message' => 'Schedule updated successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating schedule: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified schedule.
     */
    public function destroy($id)
    {
        try {
            $schedule = Schedule::findOrFail($id);
            $schedule->delete();

            return response()->json([
                'success' => true,
                'message' => 'Schedule deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting schedule: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get calendar view data.
     */
    public function calendar(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'view' => 'sometimes|in:month,week,day',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $schedules = Schedule::with(['scheduleType', 'pdl', 'facility', 'program', 'visitor'])
                ->dateRange($request->start_date, $request->end_date)
                ->whereNotIn('status', ['cancelled'])
                ->orderBy('start_datetime')
                ->get();

            // Format for calendar display
            $events = $schedules->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'title' => $schedule->title,
                    'start' => $schedule->start_datetime->toISOString(),
                    'end' => $schedule->end_datetime->toISOString(),
                    'color' => $schedule->scheduleType->color,
                    'type' => $schedule->scheduleType->name,
                    'pdl' => $schedule->pdl->first_name . ' ' . $schedule->pdl->last_name,
                    'facility' => $schedule->facility?->name,
                    'status' => $schedule->status,
                    'location' => $schedule->location,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $events,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching calendar data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get today's schedules.
     */
    public function today()
    {
        try {
            $schedules = Schedule::with(['scheduleType', 'pdl', 'facility', 'program', 'visitor'])
                ->today()
                ->whereNotIn('status', ['cancelled'])
                ->orderBy('start_datetime')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $schedules,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching today\'s schedules: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get upcoming schedules.
     */
    public function upcoming(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);

            $schedules = Schedule::with(['scheduleType', 'pdl', 'facility', 'program', 'visitor'])
                ->upcoming()
                ->whereNotIn('status', ['cancelled'])
                ->orderBy('start_datetime')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $schedules,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching upcoming schedules: ' . $e->getMessage(),
            ], 500);
        }
    }
}
