<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }

        .header .subtitle {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
        }

        .pdl-header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
            text-align: center;
        }

        .pdl-header h2 {
            margin: 0;
            font-size: 20px;
        }

        .pdl-header .pdl-number {
            font-size: 16px;
            margin-top: 5px;
            opacity: 0.9;
        }

        .section {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
        }

        .section-header {
            background-color: #f8f9fa;
            padding: 15px;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            color: #333;
        }

        .section-content {
            padding: 20px;
        }

        .info-grid {
            display: table;
            width: 100%;
        }

        .info-row {
            display: table-row;
        }

        .info-label {
            display: table-cell;
            padding: 8px 15px 8px 0;
            font-weight: bold;
            color: #555;
            width: 30%;
            vertical-align: top;
        }

        .info-value {
            display: table-cell;
            padding: 8px 0;
            color: #333;
            vertical-align: top;
        }

        .status-badge {
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            display: inline-block;
        }

        .status-active {
            background-color: #28a745;
            color: white;
        }

        .status-inactive {
            background-color: #6c757d;
            color: white;
        }

        .status-transferred {
            background-color: #17a2b8;
            color: white;
        }

        .legal-status-badge {
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: bold;
            display: inline-block;
        }

        .legal-detained {
            background-color: #ffc107;
            color: #212529;
        }

        .legal-convicted {
            background-color: #dc3545;
            color: white;
        }

        .charges-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .charges-list li {
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }

        .charges-list li:last-child {
            border-bottom: none;
        }

        .charges-list li:before {
            content: "•";
            color: #007bff;
            font-weight: bold;
            margin-right: 10px;
        }

        .aliases-list {
            color: #666;
            font-style: italic;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }

        .emergency-contact {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin-top: 15px;
        }

        .emergency-contact h4 {
            margin: 0 0 10px 0;
            color: #856404;
        }

        .page-break {
            page-break-before: always;
        }
    </style>
</head>

<body>
    <!-- Header -->
    <div class="header">
        <h1>{{ $title }}</h1>
        <div class="subtitle">Information Management System for Capiz Rehabilitation Center</div>
        <div class="subtitle">Generated on {{ $generated_at }} by {{ $generated_by }}</div>
    </div>

    <!-- PDL Header -->
    <div class="pdl-header">
        <h2>{{ $pdl->full_name ?? $pdl->first_name . ' ' . $pdl->last_name }}</h2>
        <div class="pdl-number">PDL Number: {{ $pdl->pdl_number }}</div>
    </div>

    <!-- Personal Information -->
    <div class="section">
        <div class="section-header">Personal Information</div>
        <div class="section-content">
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Full Name:</div>
                    <div class="info-value">{{ $pdl->full_name ?? $pdl->first_name . ' ' . $pdl->last_name }}</div>
                </div>
                @if ($pdl->aliases && (is_array($pdl->aliases) ? count($pdl->aliases) > 0 : !empty($pdl->aliases)))
                    <div class="info-row">
                        <div class="info-label">Aliases:</div>
                        <div class="info-value aliases-list">
                            @if (is_array($pdl->aliases))
                                {{ implode(', ', $pdl->aliases) }}
                            @else
                                {{ $pdl->aliases }}
                            @endif
                        </div>
                    </div>
                @endif
                <div class="info-row">
                    <div class="info-label">Age:</div>
                    <div class="info-value">{{ $pdl->age ?? 'N/A' }} years old</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Date of Birth:</div>
                    <div class="info-value">{{ $pdl->date_of_birth ? $pdl->date_of_birth->format('F j, Y') : 'N/A' }}
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">Gender:</div>
                    <div class="info-value">{{ ucfirst($pdl->gender ?? 'N/A') }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Civil Status:</div>
                    <div class="info-value">{{ ucfirst($pdl->civil_status ?? 'N/A') }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Nationality:</div>
                    <div class="info-value">{{ $pdl->nationality ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Religion:</div>
                    <div class="info-value">{{ $pdl->religion ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Education Level:</div>
                    <div class="info-value">{{ $pdl->education_level ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Occupation:</div>
                    <div class="info-value">{{ $pdl->occupation ?? 'N/A' }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Address Information -->
    <div class="section">
        <div class="section-header">Address Information</div>
        <div class="section-content">
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Current Address:</div>
                    <div class="info-value">{{ $pdl->address ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Barangay:</div>
                    <div class="info-value">{{ $pdl->barangay ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Municipality:</div>
                    <div class="info-value">{{ $pdl->municipality ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Province:</div>
                    <div class="info-value">{{ $pdl->province ?? 'N/A' }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Legal Information -->
    <div class="section">
        <div class="section-header">Legal Information</div>
        <div class="section-content">
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Current Status:</div>
                    <div class="info-value">
                        <span class="status-badge status-{{ strtolower($pdl->status ?? 'unknown') }}">
                            {{ $pdl->status ?? 'Unknown' }}
                        </span>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">Legal Status:</div>
                    <div class="info-value">
                        <span class="legal-status-badge legal-{{ strtolower($pdl->legal_status ?? 'unknown') }}">
                            {{ $pdl->legal_status ?? 'Unknown' }}
                        </span>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">Case Number:</div>
                    <div class="info-value">{{ $pdl->case_number ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Court:</div>
                    <div class="info-value">{{ $pdl->court ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Judge:</div>
                    <div class="info-value">{{ $pdl->judge ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Arresting Officer:</div>
                    <div class="info-value">{{ $pdl->arresting_officer ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Date of Arrest:</div>
                    <div class="info-value">{{ $pdl->date_of_arrest ? $pdl->date_of_arrest->format('F j, Y') : 'N/A' }}
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">Place of Arrest:</div>
                    <div class="info-value">{{ $pdl->place_of_arrest ?? 'N/A' }}</div>
                </div>
            </div>

            @if ($pdl->charges && (is_array($pdl->charges) ? count($pdl->charges) > 0 : !empty($pdl->charges)))
                <h4 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Charges:</h4>
                <ul class="charges-list">
                    @if (is_array($pdl->charges))
                        @foreach ($pdl->charges as $charge)
                            <li>{{ $charge }}</li>
                        @endforeach
                    @else
                        <li>{{ $pdl->charges }}</li>
                    @endif
                </ul>
            @endif
        </div>
    </div>

    <!-- Admission Information -->
    <div class="section">
        <div class="section-header">Admission Information</div>
        <div class="section-content">
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Admission Date:</div>
                    <div class="info-value">{{ $pdl->admission_date ? $pdl->admission_date->format('F j, Y') : 'N/A' }}
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">Admission Time:</div>
                    <div class="info-value">{{ $pdl->admission_time ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Committed By:</div>
                    <div class="info-value">{{ $pdl->committed_by ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Commitment Order:</div>
                    <div class="info-value">{{ $pdl->commitment_order ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Cell Assignment:</div>
                    <div class="info-value">{{ $pdl->cell_assignment ?? 'N/A' }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Emergency Contact -->
    @if ($pdl->emergency_contact_name || $pdl->emergency_contact_phone || $pdl->emergency_contact_relationship)
        <div class="section">
            <div class="section-header">Emergency Contact Information</div>
            <div class="section-content">
                <div class="emergency-contact">
                    <h4>Emergency Contact</h4>
                    <div class="info-grid">
                        <div class="info-row">
                            <div class="info-label">Name:</div>
                            <div class="info-value">{{ $pdl->emergency_contact_name ?? 'N/A' }}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Relationship:</div>
                            <div class="info-value">{{ $pdl->emergency_contact_relationship ?? 'N/A' }}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Phone Number:</div>
                            <div class="info-value">{{ $pdl->emergency_contact_phone ?? 'N/A' }}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Address:</div>
                            <div class="info-value">{{ $pdl->emergency_contact_address ?? 'N/A' }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endif

    <!-- Additional Notes -->
    @if ($pdl->medical_conditions || $pdl->remarks)
        <div class="section">
            <div class="section-header">Additional Information</div>
            <div class="section-content">
                @if ($pdl->medical_conditions)
                    <div class="info-grid">
                        <div class="info-row">
                            <div class="info-label">Medical Conditions:</div>
                            <div class="info-value">{{ $pdl->medical_conditions }}</div>
                        </div>
                    </div>
                @endif

                @if ($pdl->remarks)
                    <div class="info-grid">
                        <div class="info-row">
                            <div class="info-label">Remarks:</div>
                            <div class="info-value">{{ $pdl->remarks }}</div>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <p>This detailed report was generated automatically by the IMSCRC system on {{ $generated_at }}.</p>
        <p>This document contains confidential information and should be handled according to institutional policies.
        </p>
        <p>For questions or concerns, please contact the system administrator.</p>
    </div>
</body>

</html>
