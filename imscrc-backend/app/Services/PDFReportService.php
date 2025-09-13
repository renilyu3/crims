<?php

namespace App\Services;

use App\Models\PDL;
use App\Models\Report;
use App\Models\ReportGeneration;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PDFReportService
{
    public function generatePDLStatusReport(array $parameters = []): ReportGeneration
    {
        $generation = ReportGeneration::create([
            'report_name' => 'PDL Status Report',
            'generated_by' => auth()->id(),
            'file_type' => 'pdf',
            'parameters' => $parameters,
            'status' => 'pending',
        ]);

        try {
            $generation->markAsProcessing();

            // Get PDL data based on parameters
            $pdls = $this->getPDLsForReport($parameters);

            // Generate PDF
            $pdf = $this->createPDLStatusPDF($pdls, $parameters);

            // Save file
            $fileName = 'pdl_status_report_' . now()->format('Y_m_d_H_i_s') . '.pdf';
            $filePath = 'reports/pdf/' . $fileName;

            Storage::put($filePath, $pdf->output());
            $fileSize = Storage::size($filePath);

            $generation->markAsCompleted($filePath, $fileName, $fileSize);

            return $generation;

        } catch (\Exception $e) {
            $generation->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    public function generatePDLDetailReport(int $pdlId): ReportGeneration
    {
        $generation = ReportGeneration::create([
            'report_name' => 'PDL Detail Report',
            'generated_by' => auth()->id(),
            'file_type' => 'pdf',
            'parameters' => ['pdl_id' => $pdlId],
            'status' => 'pending',
        ]);

        try {
            $generation->markAsProcessing();

            $pdl = PDL::findOrFail($pdlId);

            // Generate PDF
            $pdf = $this->createPDLDetailPDF($pdl);

            // Save file
            $fileName = 'pdl_detail_' . $pdl->pdl_number . '_' . now()->format('Y_m_d_H_i_s') . '.pdf';
            $filePath = 'reports/pdf/' . $fileName;

            Storage::put($filePath, $pdf->output());
            $fileSize = Storage::size($filePath);

            $generation->markAsCompleted($filePath, $fileName, $fileSize);

            return $generation;

        } catch (\Exception $e) {
            $generation->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    public function generateCustomReport(Report $report, array $parameters = []): ReportGeneration
    {
        $generation = ReportGeneration::create([
            'report_id' => $report->id,
            'report_name' => $report->name,
            'generated_by' => auth()->id(),
            'file_type' => 'pdf',
            'parameters' => $parameters,
            'status' => 'pending',
        ]);

        try {
            $generation->markAsProcessing();

            // Get data based on report template
            $data = $this->getDataForCustomReport($report, $parameters);

            // Generate PDF
            $pdf = $this->createCustomPDF($report, $data, $parameters);

            // Save file
            $fileName = Str::slug($report->name) . '_' . now()->format('Y_m_d_H_i_s') . '.pdf';
            $filePath = 'reports/pdf/' . $fileName;

            Storage::put($filePath, $pdf->output());
            $fileSize = Storage::size($filePath);

            $generation->markAsCompleted($filePath, $fileName, $fileSize);

            return $generation;

        } catch (\Exception $e) {
            $generation->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    private function getPDLsForReport(array $parameters)
    {
        $query = PDL::query();

        // Apply filters based on parameters
        if (isset($parameters['status']) && !empty($parameters['status'])) {
            $query->whereIn('status', $parameters['status']);
        }

        if (isset($parameters['legal_status']) && !empty($parameters['legal_status'])) {
            $query->whereIn('legal_status', $parameters['legal_status']);
        }

        if (isset($parameters['date_range'])) {
            if (isset($parameters['date_range']['start'])) {
                $query->where('admission_date', '>=', $parameters['date_range']['start']);
            }
            if (isset($parameters['date_range']['end'])) {
                $query->where('admission_date', '<=', $parameters['date_range']['end']);
            }
        }

        if (isset($parameters['gender']) && !empty($parameters['gender'])) {
            $query->where('gender', $parameters['gender']);
        }

        return $query->orderBy('pdl_number')->get();
    }

    private function createPDLStatusPDF($pdls, array $parameters)
    {
        $data = [
            'title' => 'PDL Status Report',
            'generated_at' => now()->format('F j, Y g:i A'),
            'generated_by' => auth()->user()->name,
            'pdls' => $pdls,
            'parameters' => $parameters,
            'total_count' => $pdls->count(),
            'statistics' => $this->calculateStatistics($pdls),
        ];

        return Pdf::loadView('reports.pdl_status', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'defaultFont' => 'sans-serif',
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
            ]);
    }

    private function createPDLDetailPDF(PDL $pdl)
    {
        $data = [
            'title' => 'PDL Detail Report',
            'generated_at' => now()->format('F j, Y g:i A'),
            'generated_by' => auth()->user()->name,
            'pdl' => $pdl,
        ];

        return Pdf::loadView('reports.pdl_detail', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'defaultFont' => 'sans-serif',
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
            ]);
    }

    private function createCustomPDF(Report $report, $data, array $parameters)
    {
        $viewData = [
            'title' => $report->getTitle(),
            'generated_at' => now()->format('F j, Y g:i A'),
            'generated_by' => auth()->user()->name,
            'report' => $report,
            'data' => $data,
            'parameters' => $parameters,
        ];

        $layout = $report->getLayout();
        $view = "reports.custom_{$layout}";

        // Fallback to default if custom view doesn't exist
        if (!view()->exists($view)) {
            $view = 'reports.custom_default';
        }

        return Pdf::loadView($view, $viewData)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'defaultFont' => 'sans-serif',
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
            ]);
    }

    private function getDataForCustomReport(Report $report, array $parameters)
    {
        $fields = $report->getFields();
        $data = [];

        // This is a simplified version - in a real implementation,
        // you would have more sophisticated data retrieval based on the report template
        if (in_array('pdls', $fields)) {
            $data['pdls'] = $this->getPDLsForReport($parameters);
        }

        if (in_array('statistics', $fields)) {
            $data['statistics'] = $this->calculateStatistics($data['pdls'] ?? collect());
        }

        return $data;
    }

    private function calculateStatistics($pdls)
    {
        return [
            'total' => $pdls->count(),
            'by_status' => $pdls->groupBy('status')->map->count(),
            'by_legal_status' => $pdls->groupBy('legal_status')->map->count(),
            'by_gender' => $pdls->groupBy('gender')->map->count(),
            'recent_admissions' => $pdls->where('admission_date', '>=', now()->subDays(30))->count(),
        ];
    }

    public function getAvailableReportTypes(): array
    {
        return [
            'pdl_status' => [
                'name' => 'PDL Status Report',
                'description' => 'Comprehensive report of all PDL records with filtering options',
                'parameters' => [
                    'status' => 'array',
                    'legal_status' => 'array',
                    'date_range' => 'object',
                    'gender' => 'string',
                ]
            ],
            'pdl_detail' => [
                'name' => 'PDL Detail Report',
                'description' => 'Detailed report for a specific PDL',
                'parameters' => [
                    'pdl_id' => 'integer'
                ]
            ],
        ];
    }
}
