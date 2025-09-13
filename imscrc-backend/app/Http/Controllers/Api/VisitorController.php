<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class VisitorController extends Controller
{
    /**
     * Display a listing of visitors with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Visitor::with(['createdBy:id,name', 'updatedBy:id,name']);

            // Apply filters
            if ($request->has('search') && $request->search !== '') {
                $query->search($request->search);
            }

            if ($request->has('background_status') && $request->background_status !== '') {
                $query->byBackgroundStatus($request->background_status);
            }

            if ($request->has('is_restricted') && $request->is_restricted !== '') {
                $query->where('is_restricted', $request->is_restricted === 'true');
            }

            if ($request->has('risk_level') && $request->risk_level !== '') {
                $query->where('risk_level', $request->risk_level);
            }

            if ($request->has('registration_date_from') && $request->registration_date_from !== '') {
                $query->where('created_at', '>=', $request->registration_date_from);
            }

            if ($request->has('registration_date_to') && $request->registration_date_to !== '') {
                $query->where('created_at', '<=', $request->registration_date_to . ' 23:59:59');
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $visitors = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $visitors,
                'message' => 'Visitors retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving visitors: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created visitor
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), Visitor::validationRules());

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $visitorData = $request->all();
            $visitorData['created_by'] = auth()->id();
            $visitorData['updated_by'] = auth()->id();

            // Generate visitor number if not provided
            if (!isset($visitorData['visitor_number']) || empty($visitorData['visitor_number'])) {
                $visitorData['visitor_number'] = $this->generateVisitorNumber();
            }

            $visitor = Visitor::create($visitorData);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $visitor->load(['createdBy:id,name', 'updatedBy:id,name']),
                'message' => 'Visitor registered successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating visitor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified visitor
     */
    public function show(string $id): JsonResponse
    {
        try {
            $visitor = Visitor::with([
                'createdBy:id,name',
                'updatedBy:id,name',
                'visits' => function($query) {
                    $query->with(['pdl:id,pdl_number,first_name,last_name'])
                          ->orderBy('scheduled_date', 'desc')
                          ->limit(10);
                },
                'backgroundChecks' => function($query) {
                    $query->orderBy('check_date', 'desc')
                          ->limit(5);
                }
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $visitor,
                'message' => 'Visitor retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Visitor not found'
            ], 404);
        }
    }

    /**
     * Update the specified visitor
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $visitor = Visitor::findOrFail($id);

            $validator = Validator::make($request->all(), Visitor::updateValidationRules($id));

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $visitorData = $request->all();
            $visitorData['updated_by'] = auth()->id();

            $visitor->update($visitorData);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $visitor->load(['createdBy:id,name', 'updatedBy:id,name']),
                'message' => 'Visitor updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating visitor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified visitor (soft delete by restricting)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $visitor = Visitor::findOrFail($id);

            // Check if visitor has active visits
            $activeVisits = $visitor->visits()->active()->count();
            if ($activeVisits > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete visitor with active visits'
                ], 400);
            }

            // Instead of hard delete, restrict the visitor
            $visitor->update([
                'is_restricted' => true,
                'restriction_reason' => 'Visitor record deactivated by administrator',
                'updated_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Visitor restricted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restricting visitor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search visitors
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');

            if (empty($query)) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No search query provided'
                ]);
            }

            $visitors = Visitor::search($query)
                ->with(['createdBy:id,name'])
                ->limit(20)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $visitors,
                'message' => 'Search completed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error searching visitors: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get visitor statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_visitors' => Visitor::count(),
                'active_visitors' => Visitor::active()->count(),
                'restricted_visitors' => Visitor::restricted()->count(),
                'pending_background_checks' => Visitor::byBackgroundStatus('pending')->count(),
                'cleared_visitors' => Visitor::byBackgroundStatus('cleared')->count(),
                'flagged_visitors' => Visitor::byBackgroundStatus('flagged')->count(),
                'expired_background_checks' => Visitor::expiredBackgroundCheck()->count(),
                'recent_registrations' => Visitor::where('created_at', '>=', now()->subDays(30))->count(),
                'by_risk_level' => [
                    'low' => Visitor::where('risk_level', 'low')->count(),
                    'medium' => Visitor::where('risk_level', 'medium')->count(),
                    'high' => Visitor::where('risk_level', 'high')->count(),
                ],
                'by_background_status' => Visitor::select('background_check_status', DB::raw('count(*) as count'))
                    ->groupBy('background_check_status')
                    ->pluck('count', 'background_check_status')
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
     * Upload photo for visitor
     */
    public function uploadPhoto(Request $request, string $id): JsonResponse
    {
        try {
            $visitor = Visitor::findOrFail($id);

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
                // Delete old photo if exists
                if ($visitor->photo_path && Storage::disk('public')->exists($visitor->photo_path)) {
                    Storage::disk('public')->delete($visitor->photo_path);
                }

                $file = $request->file('photo');
                $filename = 'visitor_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('visitor-photos', $filename, 'public');

                $visitor->addPhoto($path);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'photo_path' => $path,
                        'photo_url' => Storage::url($path)
                    ],
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
     * Delete photo for visitor
     */
    public function deletePhoto(Request $request, string $id): JsonResponse
    {
        try {
            $visitor = Visitor::findOrFail($id);

            if (!$visitor->photo_path) {
                return response()->json([
                    'success' => false,
                    'message' => 'No photo to delete'
                ], 400);
            }

            // Remove from storage
            if (Storage::disk('public')->exists($visitor->photo_path)) {
                Storage::disk('public')->delete($visitor->photo_path);
            }

            // Remove from visitor record
            $visitor->removePhoto();

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

    /**
     * Get visitors eligible for visits (cleared background check, not restricted)
     */
    public function eligible(Request $request): JsonResponse
    {
        try {
            $visitors = Visitor::active()
                ->byBackgroundStatus('cleared')
                ->where('background_check_expiry', '>', now())
                ->with(['visits' => function($query) {
                    $query->active();
                }])
                ->get()
                ->filter(function($visitor) {
                    return $visitor->canVisit();
                });

            return response()->json([
                'success' => true,
                'data' => $visitors->values(),
                'message' => 'Eligible visitors retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving eligible visitors: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate unique visitor number
     */
    private function generateVisitorNumber(): string
    {
        $year = date('Y');
        $lastVisitor = Visitor::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastVisitor ? (int) substr($lastVisitor->visitor_number, -4) + 1 : 1;

        return 'VIS-' . $year . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
