<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Visit;
use App\Models\Visitor;
use App\Models\PDL;
use App\Models\VisitSchedule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class VisitController extends Controller
{
    /**
     * Display a listing of visits with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Visit::with([
                'visitor:id,visitor_number,first_name,last_name,photo_path',
                'pdl:id,pdl_number,first_name,last_name',
                'approvedBy:id,name',
                'createdBy:id,name'
            ]);

            // Apply filters
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }

            if ($request->has('approval_status') && $request->approval_status !== '') {
                $query->where('approval_status', $request->approval_status);
            }

            if ($request->has('visit_type') && $request->visit_type !== '') {
                $query->byVisitType($request->visit_type);
            }

            if ($request->has('date_from') && $request->date_from !== '') {
                $query->where('scheduled_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to !== '') {
                $query->where('scheduled_date', '<=', $request->date_to);
            }

            if ($request->has('visitor_id') && $request->visitor_id !== '') {
                $query->where('visitor_id', $request->visitor_id);
            }

            if ($request->has('pdl_id') && $request->pdl_id !== '') {
                $query->where('pdl_id', $request->pdl_id);
            }

            // Special filters
            if ($request->has('today') && $request->today === 'true') {
                $query->today();
            }

            if ($request->has('active') && $request->active === 'true') {
                $query->active();
            }

            if ($request->has('pending_approval') && $request->pending_approval === 'true') {
                $query->pendingApproval();
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'scheduled_date');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $visits = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $visits,
                'message' => 'Visits retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving visits: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created visit
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), Visit::validationRules());

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Check if visitor can visit
            $visitor = Visitor::findOrFail($request->visitor_id);
            if (!$visitor->canVisit()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visitor is not eligible for visits. Please check background check status and restrictions.'
                ], 400);
            }

            // Check if PDL exists and is active
            $pdl = PDL::findOrFail($request->pdl_id);
            if ($pdl->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'PDL is not available for visits.'
                ], 400);
            }

            // Check for scheduling conflicts
            $conflictingVisit = Visit::where('pdl_id', $request->pdl_id)
                ->where('scheduled_date', $request->scheduled_date)
                ->where('scheduled_time', $request->scheduled_time)
                ->whereIn('status', ['scheduled', 'approved', 'in_progress'])
                ->first();

            if ($conflictingVisit) {
                return response()->json([
                    'success' => false,
                    'message' => 'PDL already has a visit scheduled at this time.'
                ], 400);
            }

            // Check visit schedule capacity
            $schedule = VisitSchedule::byDate($request->scheduled_date)
                ->where('start_time', '<=', $request->scheduled_time)
                ->where('end_time', '>=', $request->scheduled_time)
                ->first();

            if ($schedule && !$schedule->canAccommodateVisit($request->visit_type)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected time slot is not available or full.'
                ], 400);
            }

            $visitData = $request->all();
            $visitData['created_by'] = auth()->id();
            $visitData['updated_by'] = auth()->id();

            // Auto-approve for certain visit types or cleared visitors
            if ($request->visit_type === 'emergency' || $visitor->risk_level === 'low') {
                $visitData['approval_status'] = 'approved';
                $visitData['approved_by'] = auth()->id();
                $visitData['approval_date'] = now();
            }

            $visit = Visit::create($visitData);

            // Update schedule capacity if exists
            if ($schedule) {
                $schedule->bookSlot();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $visit->load([
                    'visitor:id,visitor_number,first_name,last_name',
                    'pdl:id,pdl_number,first_name,last_name',
                    'createdBy:id,name'
                ]),
                'message' => 'Visit scheduled successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating visit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified visit
     */
    public function show(string $id): JsonResponse
    {
        try {
            $visit = Visit::with([
                'visitor',
                'pdl',
                'approvedBy:id,name',
                'checkedInBy:id,name',
                'checkedOutBy:id,name',
                'createdBy:id,name',
                'updatedBy:id,name'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $visit,
                'message' => 'Visit retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Visit not found'
            ], 404);
        }
    }

    /**
     * Update the specified visit
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $visit = Visit::findOrFail($id);

            // Prevent updates to completed or cancelled visits
            if (in_array($visit->status, ['completed', 'cancelled'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update completed or cancelled visits'
                ], 400);
            }

            $validator = Validator::make($request->all(), Visit::updateValidationRules($id));

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $visitData = $request->all();
            $visitData['updated_by'] = auth()->id();

            $visit->update($visitData);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $visit->load([
                    'visitor:id,visitor_number,first_name,last_name',
                    'pdl:id,pdl_number,first_name,last_name',
                    'approvedBy:id,name'
                ]),
                'message' => 'Visit updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating visit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel the specified visit
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $visit = Visit::findOrFail($id);

            if (!$visit->cancel(auth()->user(), 'Cancelled by administrator')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot cancel this visit'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Visit cancelled successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error cancelling visit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check in a visitor for their visit
     */
    public function checkIn(Request $request, string $id): JsonResponse
    {
        try {
            $visit = Visit::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'security_screening' => 'nullable|array',
                'items_brought' => 'nullable|array',
                'notes' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if (!$visit->checkIn(auth()->user(), $request->all())) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot check in for this visit. Please verify visit status and schedule.'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => $visit->fresh()->load([
                    'visitor:id,visitor_number,first_name,last_name',
                    'pdl:id,pdl_number,first_name,last_name'
                ]),
                'message' => 'Visitor checked in successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking in visitor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check out a visitor from their visit
     */
    public function checkOut(Request $request, string $id): JsonResponse
    {
        try {
            $visit = Visit::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'visit_notes' => 'nullable|string|max:1000',
                'incident_notes' => 'nullable|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if (!$visit->checkOut(auth()->user(), $request->all())) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot check out for this visit. Please verify visit status.'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => $visit->fresh()->load([
                    'visitor:id,visitor_number,first_name,last_name',
                    'pdl:id,pdl_number,first_name,last_name'
                ]),
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
     * Approve a visit
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        try {
            $visit = Visit::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'notes' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if (!$visit->approve(auth()->user(), $request->notes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot approve this visit'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => $visit->fresh()->load([
                    'visitor:id,visitor_number,first_name,last_name',
                    'pdl:id,pdl_number,first_name,last_name',
                    'approvedBy:id,name'
                ]),
                'message' => 'Visit approved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error approving visit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deny a visit
     */
    public function deny(Request $request, string $id): JsonResponse
    {
        try {
            $visit = Visit::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'reason' => 'required|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if (!$visit->deny(auth()->user(), $request->reason)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot deny this visit'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => $visit->fresh()->load([
                    'visitor:id,visitor_number,first_name,last_name',
                    'pdl:id,pdl_number,first_name,last_name',
                    'approvedBy:id,name'
                ]),
                'message' => 'Visit denied successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error denying visit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get visit statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_visits' => Visit::count(),
                'today_visits' => Visit::today()->count(),
                'active_visits' => Visit::inProgress()->count(),
                'pending_approval' => Visit::pendingApproval()->count(),
                'completed_today' => Visit::today()->completed()->count(),
                'overdue_visits' => Visit::overdue()->count(),
                'by_status' => Visit::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'by_visit_type' => Visit::select('visit_type', DB::raw('count(*) as count'))
                    ->groupBy('visit_type')
                    ->pluck('count', 'visit_type')
                    ->toArray(),
                'by_approval_status' => Visit::select('approval_status', DB::raw('count(*) as count'))
                    ->groupBy('approval_status')
                    ->pluck('count', 'approval_status')
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
     * Get current active visits
     */
    public function activeVisits(): JsonResponse
    {
        try {
            $activeVisits = Visit::inProgress()
                ->with([
                    'visitor:id,visitor_number,first_name,last_name,photo_path',
                    'pdl:id,pdl_number,first_name,last_name',
                    'checkedInBy:id,name'
                ])
                ->orderBy('check_in_time', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $activeVisits,
                'message' => 'Active visits retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving active visits: ' . $e->getMessage()
            ], 500);
        }
    }
}
