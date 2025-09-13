<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FacilityController extends Controller
{
    /**
     * Display a listing of facilities.
     */
    public function index(Request $request)
    {
        try {
            $query = Facility::query();

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

            $facilities = $query->orderBy('name')->get();

            return response()->json([
                'success' => true,
                'data' => $facilities,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching facilities: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created facility.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:facilities',
                'type' => 'required|string|max:255',
                'description' => 'nullable|string',
                'capacity' => 'required|integer|min:1',
                'available_hours' => 'nullable|array',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $facility = Facility::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $facility,
                'message' => 'Facility created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating facility: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified facility.
     */
    public function show($id)
    {
        try {
            $facility = Facility::with(['schedules' => function ($query) {
                $query->with(['scheduleType', 'pdl'])
                    ->where('start_datetime', '>=', now())
                    ->orderBy('start_datetime');
            }])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $facility,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Facility not found',
            ], 404);
        }
    }

    /**
     * Update the specified facility.
     */
    public function update(Request $request, $id)
    {
        try {
            $facility = Facility::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255|unique:facilities,name,' . $id,
                'type' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'capacity' => 'sometimes|integer|min:1',
                'available_hours' => 'nullable|array',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $facility->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $facility,
                'message' => 'Facility updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating facility: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified facility.
     */
    public function destroy($id)
    {
        try {
            $facility = Facility::findOrFail($id);

            // Check if facility has active schedules
            $activeSchedules = $facility->schedules()
                ->where('start_datetime', '>', now())
                ->whereNotIn('status', ['cancelled'])
                ->count();

            if ($activeSchedules > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete facility with active schedules',
                ], 422);
            }

            $facility->delete();

            return response()->json([
                'success' => true,
                'message' => 'Facility deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting facility: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check facility availability.
     */
    public function checkAvailability(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
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

            $facility = Facility::findOrFail($id);

            $isAvailable = $facility->isAvailableAt(
                $request->start_datetime,
                $request->end_datetime,
                $request->exclude_schedule_id
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'available' => $isAvailable,
                    'facility' => $facility,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking availability: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get facility types.
     */
    public function types()
    {
        try {
            $types = Facility::select('type')
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
                'message' => 'Error fetching facility types: ' . $e->getMessage(),
            ], 500);
        }
    }
}
