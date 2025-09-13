<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ActiveVisitor;
use App\Models\PDL;
use App\Models\User;

class ActiveVisitorSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get available PDLs and users
        $pdls = PDL::where('status', 'active')->get();
        $users = User::all();

        if ($pdls->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No PDLs or users found. Please run PDLSeeder and UserSeeder first.');
            return;
        }

        // Create sample active visitors
        $activeVisitors = [
            [
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'middle_name' => 'Cruz',
                'phone_number' => '+63 917 123 4567',
                'email' => 'maria.santos@email.com',
                'address' => '123 Rizal Street, Quezon City, Metro Manila',
                'id_type' => 'Driver\'s License',
                'id_number' => 'N01-12-345678',
                'date_of_birth' => '1985-03-15',
                'gender' => 'female',
                'pdl_id' => $pdls->first()->id,
                'visit_purpose' => 'Weekly family visit to check on son\'s welfare',
                'visit_type' => 'family',
                'check_in_time' => now()->subHours(1)->subMinutes(30),
                'visitor_badge_number' => 'BADGE-' . now()->format('Ymd') . '-001',
                'checked_in_by' => $users->first()->id,
                'items_brought' => ['clothes', 'food', 'toiletries'],
                'security_screening' => [
                    'metal_detector' => 'passed',
                    'bag_search' => 'completed',
                    'prohibited_items' => 'none'
                ],
                'notes' => 'Regular visitor, no issues. Brought care package for son.',
                'emergency_contact_name' => 'Roberto Santos',
                'emergency_contact_phone' => '+63 917 987 6543',
                'emergency_contact_relationship' => 'husband',
            ],
            [
                'first_name' => 'Attorney',
                'last_name' => 'Rodriguez',
                'middle_name' => 'Miguel',
                'phone_number' => '+63 918 234 5678',
                'email' => 'atty.rodriguez@lawfirm.com',
                'address' => '456 Makati Avenue, Makati City, Metro Manila',
                'id_type' => 'Professional ID',
                'id_number' => 'IBP-2019-12345',
                'date_of_birth' => '1975-08-22',
                'gender' => 'male',
                'pdl_id' => $pdls->skip(1)->first()->id ?? $pdls->first()->id,
                'visit_purpose' => 'Legal consultation for upcoming court hearing',
                'visit_type' => 'legal',
                'check_in_time' => now()->subMinutes(45),
                'visitor_badge_number' => 'BADGE-' . now()->format('Ymd') . '-002',
                'checked_in_by' => $users->first()->id,
                'items_brought' => ['legal documents', 'laptop', 'briefcase'],
                'security_screening' => [
                    'metal_detector' => 'passed',
                    'bag_search' => 'completed',
                    'prohibited_items' => 'none',
                    'special_clearance' => 'legal counsel'
                ],
                'notes' => 'Legal counsel for client. Has special clearance for confidential meetings.',
                'emergency_contact_name' => 'Law Firm Reception',
                'emergency_contact_phone' => '+63 2 8123 4567',
                'emergency_contact_relationship' => 'office',
            ],
            [
                'first_name' => 'Carmen',
                'last_name' => 'Dela Cruz',
                'middle_name' => 'Flores',
                'phone_number' => '+63 919 345 6789',
                'email' => 'carmen.delacruz@gmail.com',
                'address' => '789 Bonifacio Street, Taguig City, Metro Manila',
                'id_type' => 'National ID',
                'id_number' => '1234-5678-9012-3456',
                'date_of_birth' => '1960-12-05',
                'gender' => 'female',
                'pdl_id' => $pdls->skip(2)->first()->id ?? $pdls->first()->id,
                'visit_purpose' => 'Mother visiting son for the first time',
                'visit_type' => 'family',
                'check_in_time' => now()->subMinutes(20),
                'visitor_badge_number' => 'BADGE-' . now()->format('Ymd') . '-003',
                'checked_in_by' => $users->first()->id,
                'items_brought' => ['home-cooked food', 'family photos', 'letters'],
                'security_screening' => [
                    'metal_detector' => 'passed',
                    'bag_search' => 'completed',
                    'prohibited_items' => 'none'
                ],
                'notes' => 'First-time visitor. Very emotional. Provided orientation about visit procedures.',
                'emergency_contact_name' => 'Pedro Dela Cruz',
                'emergency_contact_phone' => '+63 919 876 5432',
                'emergency_contact_relationship' => 'husband',
            ],
        ];

        foreach ($activeVisitors as $visitorData) {
            ActiveVisitor::create($visitorData);
        }

        $this->command->info('Active visitor seeder completed successfully!');
        $this->command->info('Created ' . count($activeVisitors) . ' active visitors:');
        $this->command->info('- 2 family visits (Maria Santos, Carmen Dela Cruz)');
        $this->command->info('- 1 legal visit (Attorney Rodriguez)');
        $this->command->info('- All visitors currently checked in with different durations');
    }
}
