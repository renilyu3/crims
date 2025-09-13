<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PDL;
use App\Models\User;

class PDLSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get admin user for created_by field
        $adminUser = User::where('email', 'admin@imscrc.gov.ph')->first();

        if (!$adminUser) {
            $this->command->error('Admin user not found. Please run UserSeeder first.');
            return;
        }

        // Check if PDLs already exist
        if (PDL::count() > 0) {
            $this->command->info('PDLs already exist. Skipping seeder.');
            return;
        }

        $pdls = [
            [
                'pdl_number' => 'PDL-2025-0001',
                'first_name' => 'Juan',
                'middle_name' => 'Santos',
                'last_name' => 'Dela Cruz',
                'aliases' => ['Johnny', 'Juan Santos'],
                'date_of_birth' => '1985-03-15',
                'place_of_birth' => 'Roxas City, Capiz',
                'gender' => 'male',
                'civil_status' => 'married',
                'nationality' => 'Filipino',
                'religion' => 'Catholic',
                'address' => [
                    'current' => '123 Barangay Street, Roxas City, Capiz 5800',
                    'permanent' => '123 Barangay Street, Roxas City, Capiz 5800'
                ],
                'contact_information' => [
                    'phone' => '09123456789',
                    'email' => null
                ],
                'emergency_contacts' => [
                    [
                        'name' => 'Maria Dela Cruz',
                        'relationship' => 'Wife',
                        'phone' => '09987654321',
                        'address' => '123 Barangay Street, Roxas City, Capiz'
                    ]
                ],
                'physical_characteristics' => [
                    'height' => '5\'8"',
                    'weight' => '70kg',
                    'identifying_marks' => 'Scar on left arm'
                ],
                'case_number' => 'CASE-2024-001',
                'charges' => ['Theft'],
                'court_information' => [
                    'court_name' => 'RTC Roxas City',
                    'judge' => 'Hon. Judge Santos'
                ],
                'sentence_details' => [
                    'sentence' => '2 years imprisonment',
                    'date_sentenced' => '2024-01-10'
                ],
                'legal_status' => 'convicted',
                'admission_date' => '2024-01-15',
                'admission_time' => '09:00',
                'arresting_officer' => 'PO1 Garcia',
                'arresting_agency' => 'Roxas City Police',
                'property_inventory' => [
                    'wallet' => '1 leather wallet',
                    'phone' => '1 mobile phone',
                    'cash' => 'PHP 500'
                ],
                'medical_screening' => [
                    'blood_pressure' => '120/80',
                    'temperature' => '36.5°C',
                    'medical_conditions' => 'None',
                    'medications' => 'None'
                ],
                'status' => 'active',
                'cell_assignment' => 'A-101',
                'notes' => 'First-time offender, good behavior record.',
                'photos' => [],
                'created_by' => $adminUser->id,
            ],
            [
                'pdl_number' => 'PDL-2025-0002',
                'first_name' => 'Pedro',
                'middle_name' => 'Garcia',
                'last_name' => 'Mendoza',
                'aliases' => ['Pete'],
                'date_of_birth' => '1978-07-22',
                'place_of_birth' => 'Panay, Capiz',
                'gender' => 'male',
                'civil_status' => 'single',
                'nationality' => 'Filipino',
                'religion' => 'Protestant',
                'address' => [
                    'current' => '456 Main Avenue, Panay, Capiz 5801',
                    'permanent' => '456 Main Avenue, Panay, Capiz 5801'
                ],
                'contact_information' => [
                    'phone' => '09234567890',
                    'email' => null
                ],
                'emergency_contacts' => [
                    [
                        'name' => 'Ana Mendoza',
                        'relationship' => 'Sister',
                        'phone' => '09876543210',
                        'address' => '789 Sister Street, Panay, Capiz'
                    ]
                ],
                'physical_characteristics' => [
                    'height' => '5\'6"',
                    'weight' => '65kg',
                    'identifying_marks' => 'Tattoo on right shoulder'
                ],
                'case_number' => 'CASE-2024-002',
                'charges' => ['Assault'],
                'court_information' => [
                    'court_name' => 'RTC Panay',
                    'judge' => 'Hon. Judge Mendoza'
                ],
                'sentence_details' => [
                    'sentence' => '18 months imprisonment',
                    'date_sentenced' => '2024-06-05'
                ],
                'legal_status' => 'convicted',
                'admission_date' => '2024-06-10',
                'admission_time' => '14:30',
                'arresting_officer' => 'PO2 Reyes',
                'arresting_agency' => 'Panay Police Station',
                'property_inventory' => [
                    'watch' => '1 wristwatch',
                    'cash' => 'PHP 200'
                ],
                'medical_screening' => [
                    'blood_pressure' => '140/90',
                    'temperature' => '36.8°C',
                    'medical_conditions' => 'Hypertension',
                    'medications' => 'Amlodipine 5mg'
                ],
                'status' => 'active',
                'cell_assignment' => 'B-205',
                'notes' => 'Requires regular medical check-ups for hypertension.',
                'photos' => [],
                'created_by' => $adminUser->id,
            ],
            [
                'pdl_number' => 'PDL-2025-0003',
                'first_name' => 'Roberto',
                'middle_name' => 'Cruz',
                'last_name' => 'Villanueva',
                'aliases' => ['Bobby', 'Rob'],
                'date_of_birth' => '1990-11-08',
                'place_of_birth' => 'Dumalag, Capiz',
                'gender' => 'male',
                'civil_status' => 'single',
                'nationality' => 'Filipino',
                'religion' => 'Catholic',
                'address' => [
                    'current' => '789 Poblacion Road, Dumalag, Capiz 5802',
                    'permanent' => '789 Poblacion Road, Dumalag, Capiz 5802'
                ],
                'contact_information' => [
                    'phone' => '09345678901',
                    'email' => null
                ],
                'emergency_contacts' => [
                    [
                        'name' => 'Carmen Villanueva',
                        'relationship' => 'Mother',
                        'phone' => '09765432109',
                        'address' => '789 Poblacion Road, Dumalag, Capiz'
                    ]
                ],
                'physical_characteristics' => [
                    'height' => '5\'10"',
                    'weight' => '75kg',
                    'identifying_marks' => 'Birthmark on neck'
                ],
                'case_number' => 'CASE-2024-003',
                'charges' => ['Drug possession'],
                'court_information' => [
                    'court_name' => 'RTC Dumalag',
                    'judge' => 'Hon. Judge Cruz'
                ],
                'sentence_details' => [
                    'sentence' => '3 years imprisonment',
                    'date_sentenced' => '2024-09-15'
                ],
                'legal_status' => 'convicted',
                'admission_date' => '2024-09-20',
                'admission_time' => '10:15',
                'arresting_officer' => 'PO3 Santos',
                'arresting_agency' => 'PDEA Capiz',
                'property_inventory' => [
                    'phone' => '1 smartphone',
                    'cash' => 'PHP 1500'
                ],
                'medical_screening' => [
                    'blood_pressure' => '110/70',
                    'temperature' => '36.2°C',
                    'medical_conditions' => 'None',
                    'medications' => 'None'
                ],
                'status' => 'active',
                'cell_assignment' => 'B-310',
                'notes' => 'Enrolled in rehabilitation program.',
                'photos' => [],
                'created_by' => $adminUser->id,
            ],
            [
                'pdl_number' => 'PDL-2025-0004',
                'first_name' => 'Miguel',
                'middle_name' => 'Reyes',
                'last_name' => 'Santos',
                'aliases' => ['Mike'],
                'date_of_birth' => '1982-12-03',
                'place_of_birth' => 'Pontevedra, Capiz',
                'gender' => 'male',
                'civil_status' => 'married',
                'nationality' => 'Filipino',
                'religion' => 'Catholic',
                'address' => [
                    'current' => '321 Riverside Street, Pontevedra, Capiz 5803',
                    'permanent' => '321 Riverside Street, Pontevedra, Capiz 5803'
                ],
                'contact_information' => [
                    'phone' => '09456789012',
                    'email' => null
                ],
                'emergency_contacts' => [
                    [
                        'name' => 'Elena Santos',
                        'relationship' => 'Wife',
                        'phone' => '09654321098',
                        'address' => '321 Riverside Street, Pontevedra, Capiz'
                    ]
                ],
                'physical_characteristics' => [
                    'height' => '5\'7"',
                    'weight' => '68kg',
                    'identifying_marks' => 'None'
                ],
                'case_number' => 'CASE-2024-004',
                'charges' => ['Fraud'],
                'court_information' => [
                    'court_name' => 'RTC Pontevedra',
                    'judge' => 'Hon. Judge Reyes'
                ],
                'sentence_details' => [
                    'sentence' => '6 months imprisonment',
                    'date_sentenced' => '2024-11-01'
                ],
                'legal_status' => 'convicted',
                'admission_date' => '2024-11-05',
                'admission_time' => '16:00',
                'arresting_officer' => 'PO1 Cruz',
                'arresting_agency' => 'Pontevedra Police',
                'property_inventory' => [
                    'wallet' => '1 wallet',
                    'documents' => 'Various documents',
                    'cash' => 'PHP 800'
                ],
                'medical_screening' => [
                    'blood_pressure' => '115/75',
                    'temperature' => '36.4°C',
                    'medical_conditions' => 'Shellfish allergy',
                    'medications' => 'None'
                ],
                'status' => 'active',
                'cell_assignment' => 'A-150',
                'notes' => 'Short-term sentence, good conduct.',
                'photos' => [],
                'created_by' => $adminUser->id,
            ],
            [
                'pdl_number' => 'PDL-2025-0005',
                'first_name' => 'Antonio',
                'middle_name' => 'Lopez',
                'last_name' => 'Fernandez',
                'aliases' => ['Tony', 'Tonio'],
                'date_of_birth' => '1975-05-18',
                'place_of_birth' => 'Sigma, Capiz',
                'gender' => 'male',
                'civil_status' => 'divorced',
                'nationality' => 'Filipino',
                'religion' => 'Catholic',
                'address' => [
                    'current' => '654 Market Street, Sigma, Capiz 5804',
                    'permanent' => '654 Market Street, Sigma, Capiz 5804'
                ],
                'contact_information' => [
                    'phone' => '09567890123',
                    'email' => null
                ],
                'emergency_contacts' => [
                    [
                        'name' => 'Rosa Fernandez',
                        'relationship' => 'Daughter',
                        'phone' => '09543210987',
                        'address' => '123 Daughter Street, Sigma, Capiz'
                    ]
                ],
                'physical_characteristics' => [
                    'height' => '5\'9"',
                    'weight' => '80kg',
                    'identifying_marks' => 'Scar on forehead'
                ],
                'case_number' => 'CASE-2023-015',
                'charges' => ['Robbery'],
                'court_information' => [
                    'court_name' => 'RTC Sigma',
                    'judge' => 'Hon. Judge Lopez'
                ],
                'sentence_details' => [
                    'sentence' => '5 years imprisonment',
                    'date_sentenced' => '2023-08-08'
                ],
                'legal_status' => 'convicted',
                'admission_date' => '2023-08-12',
                'admission_time' => '11:30',
                'arresting_officer' => 'PO3 Fernandez',
                'arresting_agency' => 'Sigma Police Station',
                'property_inventory' => [
                    'phone' => '1 old phone',
                    'cash' => 'PHP 50'
                ],
                'medical_screening' => [
                    'blood_pressure' => '130/85',
                    'temperature' => '36.6°C',
                    'medical_conditions' => 'Type 2 Diabetes',
                    'medications' => 'Metformin 500mg'
                ],
                'status' => 'active',
                'cell_assignment' => 'C-401',
                'notes' => 'Requires diabetic diet and regular glucose monitoring.',
                'photos' => [],
                'created_by' => $adminUser->id,
            ],
        ];

        foreach ($pdls as $pdlData) {
            PDL::create($pdlData);
        }

        $this->command->info('PDL seeder completed successfully. Created ' . count($pdls) . ' PDL records.');
    }
}
