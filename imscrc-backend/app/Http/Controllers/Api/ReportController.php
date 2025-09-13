<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\ReportGeneration;
use App\Services\PDFReportService;
use App\Services\ExcelReportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ReportController extends Controller
{
    protected $pdfService;
    protected $excelService;

    public function __construct(PDFReportService $pdfService, ExcelReportService $excelService)
    {
        $this->pdfService = $pdfService;
        $this->excelService = $excelService;
    }

    /**
     * Get all available reports
     */
    public function index(Request $request): JsonResponse
    {
        $query = Report::with(['createdBy', 'recentGenerations'])
            ->accessibleBy(auth()->id())
            ->active();

        if ($request->has('type')) {
            $query->byType($request->type);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $reports = $query->orderBy('name')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $reports,
        ]);
    }

    /**
     * Create a new report template
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate(Report::validationRules());
            $validated['created_by'] = auth()->id();

            $report = Report::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Report template created successfully',
                'data' => $report->load('createdBy'),
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Get a specific report template
     */
    public function show(Report $report): JsonResponse
    {
        if (!$report->canBeAccessedBy(auth()->id())) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $report->load(['createdBy', 'recentGenerations.generatedBy']),
        ]);
    }

    /**
     * Update a report template
     */
    public function update(Request $request, Report $report): JsonResponse
    {
        if ($report->created_by !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        try {
            $validated = $request->validate(Report::updateValidationRules($report->id));
            $report->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Report template updated successfully',
                'data' => $report->load('createdBy'),
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Delete a report template
     */
    public function destroy(Report $report): JsonResponse
    {
        if ($report->created_by !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        $report->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Report template deleted successfully',
        ]);
    }

    /**
     * Generate a PDF report
     */
    public function generatePDF(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'type' => 'required|in:pdl_status,pdl_detail,custom',
                'report_id' => 'required_if:type,custom|exists:reports,id',
                'pdl_id' => 'required_if:type,pdl_detail|exists:pdls,id',
                'parameters' => 'nullable|array',
            ]);

            $generation = match ($validated['type']) {
                'pdl_status' => $this->pdfService->generatePDLStatusReport($validated['parameters'] ?? []),
                'pdl_detail' => $this->pdfService->generatePDLDetailReport($validated['pdl_id']),
                'custom' => $this->pdfService->generateCustomReport(
                    Report::findOrFail($validated['report_id']),
                    $validated['parameters'] ?? []
                ),
            };

            return response()->json([
                'success' => true,
                'message' => 'PDF report generated successfully',
                'data' => $generation->load('generatedBy'),
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PDF report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate an Excel export
     */
    public function generateExcel(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'type' => 'required|in:pdl_export,statistics_export,custom',
                'report_id' => 'required_if:type,custom|exists:reports,id',
                'parameters' => 'nullable|array',
            ]);

            $generation = match ($validated['type']) {
                'pdl_export' => $this->excelService->generatePDLExport($validated['parameters'] ?? []),
                'statistics_export' => $this->excelService->generateStatisticsExport($validated['parameters'] ?? []),
                'custom' => $this->excelService->generateCustomExport(
                    Report::findOrFail($validated['report_id']),
                    $validated['parameters'] ?? []
                ),
            };

            return response()->json([
                'success' => true,
                'message' => 'Excel export generated successfully',
                'data' => $generation->load('generatedBy'),
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate Excel export: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get report generations history
     */
    public function generations(Request $request): JsonResponse
    {
        $query = ReportGeneration::with(['report', 'generatedBy'])
            ->byUser(auth()->id());

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->byType($request->type);
        }

        if ($request->has('report_id')) {
            $query->where('report_id', $request->report_id);
        }

        $generations = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $generations,
        ]);
    }

    /**
     * Get a specific report generation
     */
    public function getGeneration(ReportGeneration $generation): JsonResponse
    {
        if ($generation->generated_by !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $generation->load(['report', 'generatedBy']),
        ]);
    }

    /**
     * Download a generated report file
     */
    public function download(ReportGeneration $generation)
    {
        if ($generation->generated_by !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        if (!$generation->isCompleted() || !$generation->fileExists()) {
            return response()->json([
                'success' => false,
                'message' => 'File not available',
            ], 404);
        }

        return $generation->downloadFile();
    }

    /**
     * Delete a report generation
     */
    public function deleteGeneration(ReportGeneration $generation): JsonResponse
    {
        if ($generation->generated_by !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        $generation->deleteFile();
        $generation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Report generation deleted successfully',
        ]);
    }

    /**
     * Get available report types and their parameters
     */
    public function getReportTypes(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'pdf' => $this->pdfService->getAvailableReportTypes(),
                'excel' => $this->excelService->getAvailableExportTypes(),
            ],
        ]);
    }

    /**
     * Get dashboard statistics for reports
     */
    public function getStatistics(): JsonResponse
    {
        $userId = auth()->id();

        $stats = [
            'total_reports' => Report::accessibleBy($userId)->active()->count(),
            'my_reports' => Report::where('created_by', $userId)->active()->count(),
            'total_generations' => ReportGeneration::byUser($userId)->count(),
            'recent_generations' => ReportGeneration::byUser($userId)->recent(7)->count(),
            'completed_generations' => ReportGeneration::byUser($userId)->completed()->count(),
            'failed_generations' => ReportGeneration::byUser($userId)->failed()->count(),
            'by_type' => ReportGeneration::byUser($userId)
                ->selectRaw('file_type, COUNT(*) as count')
                ->groupBy('file_type')
                ->pluck('count', 'file_type')
                ->toArray(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get recent report generations for dashboard
     */
    public function getRecentGenerations(): JsonResponse
    {
        $generations = ReportGeneration::with(['report', 'generatedBy'])
            ->byUser(auth()->id())
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $generations,
        ]);
    }
}
