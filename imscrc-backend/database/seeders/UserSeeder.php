<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@imscrc.gov.ph',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'employee_id' => 'ADMIN001',
            'position' => 'System Administrator',
            'department' => 'IT Department',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Staff User',
            'email' => 'staff@imscrc.gov.ph',
            'password' => Hash::make('staff123'),
            'role' => 'staff',
            'employee_id' => 'STAFF001',
            'position' => 'Rehabilitation Officer',
            'department' => 'Operations',
            'is_active' => true,
        ]);
    }
}
