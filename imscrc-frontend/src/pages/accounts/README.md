# Account Management System

This module provides comprehensive user account management functionality for the IMSCRC system with role-based access control.

## Features

### 🔐 Role-Based Access Control

- **Admin Role**: Full access to all system features including account management
- **Staff Role**: Access to all features except account management
- Automatic role-based navigation menu filtering
- Protected routes with role validation

### 👥 User Management

- **Create Users**: Add new user accounts with role assignment
- **View Users**: Detailed user profiles and information
- **Edit Users**: Update user information and roles
- **User Status**: Activate/deactivate user accounts
- **Delete Users**: Remove user accounts (with confirmation)

### 📊 Dashboard Features

- User statistics (Total, Active, Admin, Staff counts)
- Advanced filtering and search capabilities
- Bulk operations support
- Export functionality

## Components

### Pages

- `AccountsDashboard.tsx` - Main user management dashboard
- `CreateUser.tsx` - New user creation form
- `UserDetail.tsx` - Individual user profile view
- `EditUser.tsx` - User information editing form

### Supporting Components

- `RoleProtectedRoute.tsx` - Route protection based on user roles
- Account management navigation in sidebar (admin-only)

### Types & Services

- `types/account.ts` - TypeScript interfaces for account management
- `services/accountApi.ts` - API service for user operations

## Usage

### For Administrators

1. **Access Account Management**: Navigate to "Account Management" in the sidebar
2. **Create New User**: Click "Create New User" button
3. **Manage Existing Users**: Use the dashboard to view, edit, or manage user accounts
4. **Filter Users**: Use search and filter options to find specific users

### For Staff Users

- Account Management section is automatically hidden from navigation
- Attempting to access account management URLs will show access denied message

## API Endpoints

The system expects the following backend endpoints:

```
GET    /users              - Get paginated user list with filters
GET    /users/{id}         - Get specific user details
POST   /users              - Create new user
PUT    /users/{id}         - Update user information
DELETE /users/{id}         - Delete user account
PATCH  /users/{id}/toggle-status - Toggle user active status
PATCH  /users/{id}/change-password - Change user password
GET    /departments         - Get available departments
GET    /positions          - Get available positions
```

## Security Features

### Frontend Protection

- Role-based route protection
- Component-level access control
- Navigation menu filtering based on user role

### Form Validation

- Password strength requirements (minimum 6 characters)
- Password confirmation matching
- Required field validation
- Email format validation

### User Safety

- Confirmation dialogs for destructive actions
- Prevention of self-deletion
- Clear access denied messages

## Styling

Custom styles are defined in `styles/accounts.css` with:

- Responsive design for mobile devices
- Bootstrap-compatible styling
- Custom avatar and badge components
- Professional form layouts

## Role Definitions

### Admin Role

- Full system access
- Can create, edit, and delete user accounts
- Can assign roles to other users
- Can activate/deactivate accounts
- Access to all system modules

### Staff Role

- Access to all operational modules:
  - PDL Management
  - Visitor Management
  - Scheduling
  - Reports
- Cannot access Account Management
- Cannot modify user accounts or roles

## Future Enhancements

- Bulk user operations (import/export)
- Advanced user permissions beyond roles
- User activity logging and audit trails
- Password reset functionality
- User profile picture uploads
- Department and position management
