<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProgramController extends Controller
{
    /**
     * Display a listing of programs.
     */
    public function index(Request $request)
    {
        try {
            $query = Program::query();

            // Filter by type
            if ($request->has('type')) {
                $query->ofType($request->type);
            }

            // Filter by active status
            if ($request->has('active')) {
                if ($request->boolean('active')) {
                    $query->active();
                } else {
                    $query->where('is_active', false);
                }
            }

            $programs = $query->orderBy('name')->get();

            return response()->json([
                'success' => true,
                'data' => $programs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching programs: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created program.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:programs',
                'type' => 'required|string|max:255',
                'description' => 'nullable|string',
                'duration_minutes' => 'required|integer|min:1',
                'max_participants' => 'required|integer|min:1',
                'instructor' => 'nullable|string|max:255',
                'requirements' => 'nullable|array',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $program = Program::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $program,
                'message' => 'Program created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating program: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified program.
     */
    public function show($id)
    {
        try {
            $program = Program::with(['schedules' => function ($query) {
                $query->with(['scheduleType', 'pdl', 'facility'])
                    ->where('start_datetime', '>=', now())
                    ->orderBy('start_datetime');
            }])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $program,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Program not found',
            ], 404);
        }
    }

    /**
     * Update the specified program.
     */
    public function update(Request $request, $id)
    {
        try {
            $program = Program::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255|unique:programs,name,' . $id,
                'type' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'duration_minutes' => 'sometimes|integer|min:1',
                'max_participants' => 'sometimes|integer|min:1',
                'instructor' => 'nullable|string|max:255',
                'requirements' => 'nullable|array',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $program->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $program,
                'message' => 'Program updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating program: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified program.
     */
    public function destroy($id)
    {
        try {
            $program = Program::findOrFail($id);

            // Check if program has active schedules
            $activeSchedules = $program->schedules()
                ->where('start_datetime', '>', now())
                ->whereNotIn('status', ['cancelled'])
                ->count();

            if ($activeSchedules > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete program with active schedules',
                ], 422);
            }

            $program->delete();

            return response()->json([
                'success' => true,
                'message' => 'Program deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting program: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get program types.
     */
    public function types()
    {
        try {
            $types = Program::select('type')
                ->distinct()
                ->orderBy('type')
                ->pluck('type');

            return response()->json([
                'success' => true,
                'data' => $types,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching program types: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get program enrollment for a specific schedule.
     */
    public function enrollment(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'schedule_id' => 'required|exists:schedules,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $program = Program::findOrFail($id);
            $currentEnrollment = $program->getCurrentEnrollment($request->schedule_id);
            $hasAvailableSlots = $program->hasAvailableSlots($request->schedule_id);

            return response()->json([
                'success' => true,
                'data' => [
                    'current_enrollment' => $currentEnrollment,
                    'max_participants' => $program->max_participants,
                    'available_slots' => $program->max_participants - $currentEnrollment,
                    'has_available_slots' => $hasAvailableSlots,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching enrollment data: ' . $e->getMessage(),
            ], 500);
        }
    }
}
