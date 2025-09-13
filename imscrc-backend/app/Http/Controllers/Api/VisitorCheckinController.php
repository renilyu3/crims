<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisitorCheckin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class VisitorCheckinController extends Controller
{
    /**
     * Get all visitor check-ins with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = VisitorCheckin::with(['checkedInBy:id,name', 'checkedOutBy:id,name']);

            // Apply filters
            if ($request->has('status') && $request->status !== '') {
                if ($request->status === 'active') {
                    $query->active();
                } elseif ($request->status === 'completed') {
                    $query->completed();
                }
            }

            if ($request->has('search') && $request->search !== '') {
                $query->search($request->search);
            }

            if ($request->has('date_from') && $request->date_from !== '') {
                $query->where('check_in_time', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to !== '') {
                $query->where('check_in_time', '<=', $request->date_to . ' 23:59:59');
            }

            if ($request->has('today') && $request->today === 'true') {
                $query->today();
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'check_in_time');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $checkins = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $checkins,
                'message' => 'Visitor check-ins retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving visitor check-ins: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check in a new visitor
     */
    public function checkIn(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), VisitorCheckin::validationRules());

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $checkin = VisitorCheckin::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'phone_number' => $request->phone_number,
                'address' => $request->address,
                'check_in_time' => now(),
                'status' => 'active',
                'checked_in_by' => auth()->id(),
                'notes' => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'data' => $checkin->load('checkedInBy:id,name'),
                'message' => 'Visitor checked in successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking in visitor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check out a visitor
     */
    public function checkOut(Request $request, string $id): JsonResponse
    {
        try {
            $checkin = VisitorCheckin::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'notes' => 'nullable|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if (!$checkin->checkOut(auth()->user(), $request->notes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot check out this visitor. Visitor may already be checked out.'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => $checkin->fresh()->load(['checkedInBy:id,name', 'checkedOutBy:id,name']),
                'message' => 'Visitor checked out successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking out visitor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active visitors (currently checked in)
     */
    public function activeVisitors(): JsonResponse
    {
        try {
            $activeVisitors = VisitorCheckin::active()
                ->with('checkedInBy:id,name')
                ->orderBy('check_in_time', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $activeVisitors,
                'message' => 'Active visitors retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving active visitors: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get visitor check-in statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_checkins' => VisitorCheckin::count(),
                'active_visitors' => VisitorCheckin::active()->count(),
                'today_checkins' => VisitorCheckin::today()->count(),
                'completed_today' => VisitorCheckin::today()->completed()->count(),
                'by_status' => VisitorCheckin::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific visitor check-in record
     */
    public function show(string $id): JsonResponse
    {
        try {
            $checkin = VisitorCheckin::with(['checkedInBy:id,name', 'checkedOutBy:id,name'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $checkin,
                'message' => 'Visitor check-in retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Visitor check-in not found'
            ], 404);
        }
    }

    /**
     * Delete a visitor check-in record
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $checkin = VisitorCheckin::findOrFail($id);
            $checkin->delete();

            return response()->json([
                'success' => true,
                'message' => 'Visitor check-in record deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting visitor check-in record: ' . $e->getMessage()
            ], 500);
        }
    }
}
