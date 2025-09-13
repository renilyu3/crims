# PDL Management System - Setup Instructions

## Backend Setup (Laravel)

1. **Navigate to the backend directory:**

   ```bash
   cd imsrc/imscrc-backend
   ```

2. **Install dependencies (if not already done):**

   ```bash
   composer install
   ```

3. **Run the database migrations:**

   ```bash
   php artisan migrate
   ```

4. **Seed the database with sample data:**

   ```bash
   php artisan db:seed
   ```

5. **Start the Laravel development server:**
   ```bash
   php artisan serve
   ```
   The backend will be available at: `http://127.0.0.1:8000`

## Frontend Setup (React)

1. **Navigate to the frontend directory:**

   ```bash
   cd imsrc/imscrc-frontend
   ```

2. **Install dependencies (if not already done):**

   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at: `http://localhost:5173`

## Accessing the PDL Management System

1. **Login to the system:**

   - Go to `http://localhost:5173`
   - Use the credentials from your UserSeeder (check `imscrc-backend/database/seeders/UserSeeder.php`)

2. **Navigate to PDL Management:**
   - From the main dashboard, click "Manage PDLs" or "Register New PDL"
   - Or directly visit: `http://localhost:5173/pdls`

## Available PDL Routes

- **PDL Dashboard:** `http://localhost:5173/pdls`
- **Register New PDL:** `http://localhost:5173/pdls/register`
- **View All PDLs:** `http://localhost:5173/pdls/list`
- **Search PDLs:** `http://localhost:5173/pdls/search`

## Sample Data

The system includes 3 sample PDL records:

- Juan Santos Dela Cruz (PDL-2024-0001)
- Maria Gonzales Rodriguez (PDL-2024-0002)
- Roberto Cruz Villanueva (PDL-2024-0003)

## API Endpoints

The backend provides these API endpoints:

- `GET /api/pdls` - List all PDLs with pagination and filtering
- `POST /api/pdls` - Create new PDL
- `GET /api/pdls/{id}` - Get specific PDL
- `PUT /api/pdls/{id}` - Update PDL
- `DELETE /api/pdls/{id}` - Delete PDL (soft delete)
- `GET /api/pdls-search` - Search PDLs
- `GET /api/pdls-statistics` - Get PDL statistics
- `POST /api/pdls/{id}/photos` - Upload PDL photo
- `DELETE /api/pdls/{id}/photos` - Delete PDL photo

## Features Available

✅ **PDL Registration:**

- Multi-step form with validation
- Personal information, contact details, legal information
- Dynamic aliases and charges management
- Emergency contacts

✅ **PDL Management:**

- View all PDLs with pagination
- Search and filter functionality
- Statistics dashboard
- Status management

✅ **Data Management:**

- Complete database schema
- Sample data seeding
- Audit trail tracking
- Photo upload support (backend ready)

## Troubleshooting

1. **Database Connection Issues:**

   - Check your `.env` file in the backend directory
   - Ensure MySQL is running
   - Verify database credentials

2. **CORS Issues:**

   - The backend is configured for CORS with the frontend
   - If you change ports, update the CORS configuration

3. **API Connection Issues:**
   - Ensure the backend is running on `http://127.0.0.1:8000`
   - Check the API base URL in `imscrc-frontend/src/lib/api.ts`

## Next Steps

After testing the current implementation, you can:

1. Add photo upload functionality to the frontend
2. Create PDL profile view pages
3. Add edit PDL functionality
4. Integrate with other modules (Visitors, Scheduling)
5. Add reporting features
