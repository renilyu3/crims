<?php

namespace App\Services;

use App\Models\PDL;
use App\Models\Report;
use App\Models\ReportGeneration;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExcelReportService
{
    public function generatePDLExport(array $parameters = []): ReportGeneration
    {
        $generation = ReportGeneration::create([
            'report_name' => 'PDL Data Export',
            'generated_by' => auth()->id(),
            'file_type' => 'xlsx',
            'parameters' => $parameters,
            'status' => 'pending',
        ]);

        try {
            $generation->markAsProcessing();

            // Get PDL data based on parameters
            $pdls = $this->getPDLsForExport($parameters);

            // Generate Excel file
            $fileName = 'pdl_export_' . now()->format('Y_m_d_H_i_s') . '.xlsx';
            $filePath = 'reports/excel/' . $fileName;

            Excel::store(new PDLExport($pdls, $parameters), $filePath);
            $fileSize = Storage::size($filePath);

            $generation->markAsCompleted($filePath, $fileName, $fileSize);

            return $generation;

        } catch (\Exception $e) {
            $generation->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    public function generateStatisticsExport(array $parameters = []): ReportGeneration
    {
        $generation = ReportGeneration::create([
            'report_name' => 'Statistics Export',
            'generated_by' => auth()->id(),
            'file_type' => 'xlsx',
            'parameters' => $parameters,
            'status' => 'pending',
        ]);

        try {
            $generation->markAsProcessing();

            // Get statistics data
            $statistics = $this->getStatisticsForExport($parameters);

            // Generate Excel file
            $fileName = 'statistics_export_' . now()->format('Y_m_d_H_i_s') . '.xlsx';
            $filePath = 'reports/excel/' . $fileName;

            Excel::store(new StatisticsExport($statistics, $parameters), $filePath);
            $fileSize = Storage::size($filePath);

            $generation->markAsCompleted($filePath, $fileName, $fileSize);

            return $generation;

        } catch (\Exception $e) {
            $generation->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    public function generateCustomExport(Report $report, array $parameters = []): ReportGeneration
    {
        $generation = ReportGeneration::create([
            'report_id' => $report->id,
            'report_name' => $report->name,
            'generated_by' => auth()->id(),
            'file_type' => 'xlsx',
            'parameters' => $parameters,
            'status' => 'pending',
        ]);

        try {
            $generation->markAsProcessing();

            // Get data based on report template
            $data = $this->getDataForCustomExport($report, $parameters);

            // Generate Excel file
            $fileName = Str::slug($report->name) . '_' . now()->format('Y_m_d_H_i_s') . '.xlsx';
            $filePath = 'reports/excel/' . $fileName;

            Excel::store(new CustomReportExport($report, $data, $parameters), $filePath);
            $fileSize = Storage::size($filePath);

            $generation->markAsCompleted($filePath, $fileName, $fileSize);

            return $generation;

        } catch (\Exception $e) {
            $generation->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    private function getPDLsForExport(array $parameters)
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

    private function getStatisticsForExport(array $parameters)
    {
        $pdls = $this->getPDLsForExport($parameters);

        return [
            'summary' => [
                'total_pdls' => $pdls->count(),
                'by_status' => $pdls->groupBy('status')->map->count()->toArray(),
                'by_legal_status' => $pdls->groupBy('legal_status')->map->count()->toArray(),
                'by_gender' => $pdls->groupBy('gender')->map->count()->toArray(),
            ],
            'monthly_admissions' => $this->getMonthlyAdmissions($pdls),
            'age_distribution' => $this->getAgeDistribution($pdls),
        ];
    }

    private function getDataForCustomExport(Report $report, array $parameters)
    {
        $fields = $report->getFields();
        $data = [];

        if (in_array('pdls', $fields)) {
            $data['pdls'] = $this->getPDLsForExport($parameters);
        }

        if (in_array('statistics', $fields)) {
            $data['statistics'] = $this->getStatisticsForExport($parameters);
        }

        return $data;
    }

    private function getMonthlyAdmissions($pdls)
    {
        return $pdls->groupBy(function ($pdl) {
            return $pdl->admission_date ? $pdl->admission_date->format('Y-m') : 'Unknown';
        })->map->count()->toArray();
    }

    private function getAgeDistribution($pdls)
    {
        return $pdls->groupBy(function ($pdl) {
            if (!$pdl->age) return 'Unknown';

            if ($pdl->age < 18) return 'Under 18';
            if ($pdl->age < 25) return '18-24';
            if ($pdl->age < 35) return '25-34';
            if ($pdl->age < 45) return '35-44';
            if ($pdl->age < 55) return '45-54';
            if ($pdl->age < 65) return '55-64';
            return '65+';
        })->map->count()->toArray();
    }

    public function getAvailableExportTypes(): array
    {
        return [
            'pdl_export' => [
                'name' => 'PDL Data Export',
                'description' => 'Export PDL records to Excel with filtering options',
                'parameters' => [
                    'status' => 'array',
                    'legal_status' => 'array',
                    'date_range' => 'object',
                    'gender' => 'string',
                    'fields' => 'array',
                ]
            ],
            'statistics_export' => [
                'name' => 'Statistics Export',
                'description' => 'Export statistical data and summaries',
                'parameters' => [
                    'date_range' => 'object',
                    'include_charts' => 'boolean',
                ]
            ],
        ];
    }
}

// Excel Export Classes
class PDLExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $pdls;
    protected $parameters;

    public function __construct($pdls, $parameters = [])
    {
        $this->pdls = $pdls;
        $this->parameters = $parameters;
    }

    public function collection()
    {
        return $this->pdls;
    }

    public function headings(): array
    {
        return [
            'PDL Number',
            'Full Name',
            'Age',
            'Gender',
            'Status',
            'Legal Status',
            'Admission Date',
            'Case Number',
            'Charges',
            'Address',
            'Contact Person',
            'Contact Number',
        ];
    }

    public function map($pdl): array
    {
        return [
            $pdl->pdl_number,
            $pdl->full_name ?? ($pdl->first_name . ' ' . $pdl->last_name),
            $pdl->age,
            $pdl->gender,
            $pdl->status,
            $pdl->legal_status,
            $pdl->admission_date ? $pdl->admission_date->format('Y-m-d') : '',
            $pdl->case_number,
            is_array($pdl->charges) ? implode(', ', $pdl->charges) : $pdl->charges,
            $pdl->address,
            $pdl->emergency_contact_name,
            $pdl->emergency_contact_phone,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

class StatisticsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $statistics;
    protected $parameters;

    public function __construct($statistics, $parameters = [])
    {
        $this->statistics = $statistics;
        $this->parameters = $parameters;
    }

    public function collection()
    {
        $data = collect();

        // Add summary statistics
        $data->push((object)[
            'category' => 'Total PDLs',
            'value' => $this->statistics['summary']['total_pdls'],
            'type' => 'summary'
        ]);

        // Add status breakdown
        foreach ($this->statistics['summary']['by_status'] as $status => $count) {
            $data->push((object)[
                'category' => "Status: {$status}",
                'value' => $count,
                'type' => 'status'
            ]);
        }

        // Add legal status breakdown
        foreach ($this->statistics['summary']['by_legal_status'] as $legalStatus => $count) {
            $data->push((object)[
                'category' => "Legal Status: {$legalStatus}",
                'value' => $count,
                'type' => 'legal_status'
            ]);
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Category',
            'Value',
            'Type',
        ];
    }

    public function map($item): array
    {
        return [
            $item->category,
            $item->value,
            $item->type,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

class CustomReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $report;
    protected $data;
    protected $parameters;

    public function __construct(Report $report, $data, $parameters = [])
    {
        $this->report = $report;
        $this->data = $data;
        $this->parameters = $parameters;
    }

    public function collection()
    {
        // This would be customized based on the report template
        if (isset($this->data['pdls'])) {
            return $this->data['pdls'];
        }

        return collect();
    }

    public function headings(): array
    {
        $fields = $this->report->getFields();

        // Customize headings based on selected fields
        $headings = [];

        if (in_array('pdl_number', $fields)) $headings[] = 'PDL Number';
        if (in_array('name', $fields)) $headings[] = 'Full Name';
        if (in_array('age', $fields)) $headings[] = 'Age';
        if (in_array('gender', $fields)) $headings[] = 'Gender';
        if (in_array('status', $fields)) $headings[] = 'Status';
        if (in_array('legal_status', $fields)) $headings[] = 'Legal Status';
        if (in_array('admission_date', $fields)) $headings[] = 'Admission Date';

        return $headings;
    }

    public function map($pdl): array
    {
        $fields = $this->report->getFields();
        $row = [];

        if (in_array('pdl_number', $fields)) $row[] = $pdl->pdl_number;
        if (in_array('name', $fields)) $row[] = $pdl->full_name ?? ($pdl->first_name . ' ' . $pdl->last_name);
        if (in_array('age', $fields)) $row[] = $pdl->age;
        if (in_array('gender', $fields)) $row[] = $pdl->gender;
        if (in_array('status', $fields)) $row[] = $pdl->status;
        if (in_array('legal_status', $fields)) $row[] = $pdl->legal_status;
        if (in_array('admission_date', $fields)) $row[] = $pdl->admission_date ? $pdl->admission_date->format('Y-m-d') : '';

        return $row;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
