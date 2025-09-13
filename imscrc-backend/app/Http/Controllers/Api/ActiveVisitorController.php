<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActiveVisitor;
use App\Models\PDL;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ActiveVisitorController extends Controller
{
    /**
     * Display a listing of active visitors
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = ActiveVisitor::with([
                'pdl:id,pdl_number,first_name,last_name',
                'checkedInBy:id,name'
            ]);

            // Apply filters
            if ($request->has('search') && $request->search !== '') {
                $query->search($request->search);
            }

            if ($request->has('pdl_id') && $request->pdl_id !== '') {
                $query->byPdl($request->pdl_id);
            }

            if ($request->has('visit_type') && $request->visit_type !== '') {
                $query->byVisitType($request->visit_type);
            }

            if ($request->has('overdue') && $request->overdue === 'true') {
                $query->overdue();
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
            $activeVisitors = $query->paginate($perPage);

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
     * Store a newly created active visitor (check-in)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), ActiveVisitor::validationRules());

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Check if PDL exists and is active
            $pdl = PDL::findOrFail($request->pdl_id);
            if ($pdl->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'PDL is not available for visits.'
                ], 400);
            }

            // Check if visitor is already checked in
            $existingVisitor = ActiveVisitor::where('phone_number', $request->phone_number)
                ->orWhere(function ($query) use ($request) {
                    $query->where('first_name', $request->first_name)
                          ->where('last_name', $request->last_name);
                })
                ->first();

            if ($existingVisitor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visitor is already checked in.'
                ], 400);
            }

            $visitorData = $request->all();
            $visitorData['check_in_time'] = now();
            $visitorData['checked_in_by'] = auth()->id();

            // Generate badge number
            $activeVisitor = new ActiveVisitor($visitorData);
            $visitorData['visitor_badge_number'] = $activeVisitor->generateBadgeNumber();

            $activeVisitor = ActiveVisitor::create($visitorData);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $activeVisitor->load([
                    'pdl:id,pdl_number,first_name,last_name',
                    'checkedInBy:id,name'
                ]),
                'message' => 'Visitor checked in successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error checking in visitor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified active visitor
     */
    public function show(string $id): JsonResponse
    {
        try {
            $activeVisitor = ActiveVisitor::with([
                'pdl',
                'checkedInBy:id,name'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $activeVisitor,
                'message' => 'Active visitor retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Active visitor not found'
            ], 404);
        }
    }

    /**
     * Update the specified active visitor
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $activeVisitor = ActiveVisitor::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'notes' => 'nullable|string|max:1000',
                'visit_purpose' => 'nullable|string|max:500',
                'items_brought' => 'nullable|array',
                'security_screening' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $activeVisitor->update($request->only([
                'notes', 'visit_purpose', 'items_brought', 'security_screening'
            ]));

            return response()->json([
                'success' => true,
                'data' => $activeVisitor->load([
                    'pdl:id,pdl_number,first_name,last_name',
                    'checkedInBy:id,name'
                ]),
                'message' => 'Active visitor updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating active visitor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check out an active visitor (move to history)
     */
    public function checkOut(Request $request, string $id): JsonResponse
    {
        try {
            $activeVisitor = ActiveVisitor::findOrFail($id);

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

            DB::beginTransaction();

            // Check out the visitor (this will create history record and delete from active)
            $historyRecord = $activeVisitor->checkOut(auth()->user(), $request->all());

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $historyRecord,
                'message' => 'Visitor checked out successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error checking out visitor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active visitor statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_active' => ActiveVisitor::count(),
                'today_checkins' => ActiveVisitor::today()->count(),
                'overdue_visits' => ActiveVisitor::overdue()->count(),
                'by_visit_type' => ActiveVisitor::select('visit_type', DB::raw('count(*) as count'))
                    ->groupBy('visit_type')
                    ->pluck('count', 'visit_type')
                    ->toArray(),
                'average_duration' => ActiveVisitor::selectRaw('AVG(TIMESTAMPDIFF(MINUTE, check_in_time, NOW())) as avg_minutes')
                    ->value('avg_minutes') ?? 0,
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
     * Upload photo for active visitor
     */
    public function uploadPhoto(Request $request, string $id): JsonResponse
    {
        try {
            $activeVisitor = ActiveVisitor::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if ($request->hasFile('photo')) {
                $photo = $request->file('photo');
                $filename = 'visitor_' . $activeVisitor->id . '_' . time() . '.' . $photo->getClientOriginalExtension();
                $path = $photo->storeAs('visitor_photos', $filename, 'public');

                // Delete old photo if exists
                if ($activeVisitor->photo_path) {
                    \Storage::disk('public')->delete($activeVisitor->photo_path);
                }

                $activeVisitor->update(['photo_path' => $path]);

                return response()->json([
                    'success' => true,
                    'data' => ['photo_path' => $path],
                    'message' => 'Photo uploaded successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No photo file provided'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading photo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete photo for active visitor
     */
    public function deletePhoto(string $id): JsonResponse
    {
        try {
            $activeVisitor = ActiveVisitor::findOrFail($id);

            if ($activeVisitor->photo_path) {
                \Storage::disk('public')->delete($activeVisitor->photo_path);
                $activeVisitor->update(['photo_path' => null]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Photo deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting photo: ' . $e->getMessage()
            ], 500);
        }
    }
}
