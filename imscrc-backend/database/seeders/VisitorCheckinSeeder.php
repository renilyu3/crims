<?php

namespace Database\Seeders;

use App\Models\VisitorCheckin;
use App\Models\User;
use App\Models\PDL;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class VisitorCheckinSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get the admin user for seeding
        $adminUser = User::where('email', 'admin@imscrc.gov.ph')->first();

        if (!$adminUser) {
            $this->command->warn('Admin user not found. Creating sample user...');
            $adminUser = User::create([
                'name' => 'Administrator',
                'email' => 'admin@imscrc.gov.ph',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'department' => 'Administration',
                'is_active' => true,
            ]);
        }

        // Get PDLs for visitor relationships
        $pdls = PDL::all();

        if ($pdls->isEmpty()) {
            $this->command->error('No PDLs found. Please run PDLSeeder first.');
            return;
        }

        // Create sample visitor check-ins
        $sampleCheckins = [
            // Active visitor (checked in but not checked out)
            [
                'first_name' => 'Maria',
                'last_name' => 'Garcia',
                'phone_number' => '09123456789',
                'address' => '123 Rizal Street, Barangay San Jose, Roxas City, Capiz',
                'pdl_id' => $pdls[0]->id,
                'purpose' => 'Family visit - first time visitor',
                'check_in_time' => now()->subHours(2),
                'status' => 'active',
                'checked_in_by' => $adminUser->id,
                'notes' => 'Family visit - first time visitor',
            ],

            // Completed visits from today
            [
                'first_name' => 'Roberto',
                'last_name' => 'Mendoza',
                'phone_number' => '09987654321',
                'address' => '456 Mabini Avenue, Barangay Poblacion, Roxas City, Capiz',
                'pdl_id' => $pdls[1]->id,
                'purpose' => 'Legal consultation visit',
                'check_in_time' => today()->setTime(9, 0),
                'check_out_time' => today()->setTime(10, 30),
                'status' => 'completed',
                'duration_minutes' => 90,
                'checked_in_by' => $adminUser->id,
                'checked_out_by' => $adminUser->id,
                'notes' => 'Legal consultation visit',
            ],

            [
                'first_name' => 'Ana',
                'last_name' => 'Villanueva',
                'phone_number' => '09555123456',
                'address' => '789 Del Pilar Street, Barangay Lawaan, Roxas City, Capiz',
                'pdl_id' => $pdls[2]->id,
                'purpose' => 'Sister visit - regular visitor',
                'check_in_time' => today()->setTime(14, 0),
                'check_out_time' => today()->setTime(15, 15),
                'status' => 'completed',
                'duration_minutes' => 75,
                'checked_in_by' => $adminUser->id,
                'checked_out_by' => $adminUser->id,
                'notes' => 'Sister visit - regular visitor',
            ],

            // Completed visits from yesterday
            [
                'first_name' => 'Pedro',
                'last_name' => 'Santos',
                'phone_number' => '09777888999',
                'address' => '321 Bonifacio Street, Barangay Baybay, Roxas City, Capiz',
                'pdl_id' => $pdls[3]->id,
                'purpose' => 'Father visit',
                'check_in_time' => now()->subDay()->setTime(10, 30),
                'check_out_time' => now()->subDay()->setTime(11, 45),
                'status' => 'completed',
                'duration_minutes' => 75,
                'checked_in_by' => $adminUser->id,
                'checked_out_by' => $adminUser->id,
                'notes' => 'Father visit',
            ],

            [
                'first_name' => 'Carmen',
                'last_name' => 'Dela Cruz',
                'phone_number' => '09444555666',
                'address' => '654 Luna Street, Barangay Culasi, Roxas City, Capiz',
                'pdl_id' => $pdls[4]->id,
                'purpose' => 'Mother visit - emotional support',
                'check_in_time' => now()->subDay()->setTime(15, 0),
                'check_out_time' => now()->subDay()->setTime(16, 30),
                'status' => 'completed',
                'duration_minutes' => 90,
                'checked_in_by' => $adminUser->id,
                'checked_out_by' => $adminUser->id,
                'notes' => 'Mother visit - emotional support',
            ],
        ];

        foreach ($sampleCheckins as $checkinData) {
            VisitorCheckin::create($checkinData);
        }

        $this->command->info('Sample visitor check-ins created successfully!');
        $this->command->info('- 1 active visitor (currently checked in)');
        $this->command->info('- 2 completed visits from today');
        $this->command->info('- 2 completed visits from yesterday');
        $this->command->info('- All visits linked to PDLs');
    }
}
