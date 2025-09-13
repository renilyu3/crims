<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PDL;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class PDLController extends Controller
{
    /**
     * Display a listing of PDLs with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = PDL::with(['createdBy:id,name', 'updatedBy:id,name']);

            // Apply filters
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }

            if ($request->has('legal_status') && $request->legal_status !== '') {
                $query->where('legal_status', $request->legal_status);
            }

            if ($request->has('search') && $request->search !== '') {
                $query->search($request->search);
            }

            if ($request->has('admission_date_from') && $request->admission_date_from !== '') {
                $query->where('admission_date', '>=', $request->admission_date_from);
            }

            if ($request->has('admission_date_to') && $request->admission_date_to !== '') {
                $query->where('admission_date', '<=', $request->admission_date_to);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $pdls = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $pdls,
                'message' => 'PDLs retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving PDLs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created PDL
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), PDL::validationRules());

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $pdlData = $request->all();
            $pdlData['created_by'] = auth()->id();
            $pdlData['updated_by'] = auth()->id();

            // Generate PDL number if not provided
            if (!isset($pdlData['pdl_number']) || empty($pdlData['pdl_number'])) {
                $pdlData['pdl_number'] = $this->generatePdlNumber();
            }

            $pdl = PDL::create($pdlData);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $pdl->load(['createdBy:id,name', 'updatedBy:id,name']),
                'message' => 'PDL registered successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating PDL: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified PDL
     */
    public function show(string $id): JsonResponse
    {
        try {
            $pdl = PDL::with(['createdBy:id,name', 'updatedBy:id,name'])->findOrFail($id);

            // Log the original PDL data for debugging
            \Log::info('Original PDL data:', $pdl->toArray());

            return response()->json([
                'success' => true,
                'data' => $pdl,
                'message' => 'PDL retrieved successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching PDL:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'PDL not found: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified PDL
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $pdl = PDL::findOrFail($id);

            $validator = Validator::make($request->all(), PDL::updateValidationRules($id));

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $pdlData = $request->all();
            $pdlData['updated_by'] = auth()->id();

            $pdl->update($pdlData);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $pdl->load(['createdBy:id,name', 'updatedBy:id,name']),
                'message' => 'PDL updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating PDL: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified PDL (permanent delete)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $pdl = PDL::findOrFail($id);

            DB::beginTransaction();

            // Delete associated photos from storage
            if (!empty($pdl->photos)) {
                foreach ($pdl->photos as $photoPath) {
                    if (Storage::disk('public')->exists($photoPath)) {
                        Storage::disk('public')->delete($photoPath);
                    }
                }
            }

            // Permanently delete the PDL record
            $pdl->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'PDL deleted permanently'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error deleting PDL: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search PDLs
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

            $pdls = PDL::search($query)
                ->with(['createdBy:id,name'])
                ->limit(20)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $pdls,
                'message' => 'Search completed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error searching PDLs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get PDL statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_pdls' => PDL::count(),
                'active_pdls' => PDL::where('status', 'active')->count(),
                'detained' => PDL::where('legal_status', 'detained')->count(),
                'convicted' => PDL::where('legal_status', 'convicted')->count(),
                'transferred' => PDL::where('status', 'transferred')->count(),
                'released' => PDL::where('status', 'released')->count(),
                'recent_admissions' => PDL::where('admission_date', '>=', now()->subDays(30))->count(),
                'by_gender' => [
                    'male' => PDL::where('gender', 'male')->count(),
                    'female' => PDL::where('gender', 'female')->count(),
                    'other' => PDL::where('gender', 'other')->count(),
                ],
                'by_legal_status' => PDL::select('legal_status', DB::raw('count(*) as count'))
                    ->groupBy('legal_status')
                    ->pluck('count', 'legal_status')
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
     * Upload photo for PDL
     */
    public function uploadPhoto(Request $request, string $id): JsonResponse
    {
        try {
            $pdl = PDL::findOrFail($id);

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
                $file = $request->file('photo');
                $filename = 'pdl_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('pdl-photos', $filename, 'public');

                $pdl->addPhoto($path);

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
     * Delete photo for PDL
     */
    public function deletePhoto(Request $request, string $id): JsonResponse
    {
        try {
            $pdl = PDL::findOrFail($id);
            $photoPath = $request->get('photo_path');

            if (!$photoPath) {
                return response()->json([
                    'success' => false,
                    'message' => 'Photo path is required'
                ], 400);
            }

            // Remove from storage
            if (Storage::disk('public')->exists($photoPath)) {
                Storage::disk('public')->delete($photoPath);
            }

            // Remove from PDL record
            $pdl->removePhoto($photoPath);

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
     * Generate unique PDL number
     */
    private function generatePdlNumber(): string
    {
        $year = date('Y');
        $lastPdl = PDL::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastPdl ? (int) substr($lastPdl->pdl_number, -4) + 1 : 1;

        return 'PDL-' . $year . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
