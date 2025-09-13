# Enhanced Layout System Documentation

## Overview

The Enhanced Layout System provides a professional, modern, and responsive layout architecture for the IMSCRC Management System. It includes a comprehensive set of components designed for optimal user experience and maintainability.

## Components Structure

```
src/components/
├── layout/
│   ├── EnhancedLayout.tsx      # Main layout wrapper
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── Header.tsx              # Top header with search & notifications
│   ├── Breadcrumbs.tsx         # Dynamic breadcrumb navigation
│   ├── Footer.tsx              # System footer with status
│   └── README.md               # This documentation
├── layouts/
│   ├── DashboardLayout.tsx     # Dashboard-specific layout
│   ├── FormLayout.tsx          # Form pages layout
│   └── TableLayout.tsx         # Data table layout
└── EnhancedApp.tsx             # Example integration
```

## Key Features

### 1. Responsive Design

- **Mobile-first approach** with breakpoints at 576px, 768px, 992px, and 1200px
- **Collapsible sidebar** that adapts to screen size
- **Mobile drawer navigation** for small screens
- **Responsive typography and spacing**

### 2. Professional UI/UX

- **Modern design language** with clean lines and consistent spacing
- **Smooth animations and transitions** for better user experience
- **Consistent color scheme** following Bootstrap design system
- **Accessibility-compliant** with proper ARIA labels and keyboard navigation

### 3. Modular Architecture

- **Reusable layout components** for different page types
- **Flexible prop system** for customization
- **Consistent styling** across all components
- **Easy to extend and maintain**

## Component Usage

### EnhancedLayout (Main Layout)

The main layout wrapper that provides the overall structure:

```tsx
import EnhancedLayout from "./components/layout/EnhancedLayout";

<EnhancedLayout>{/* Your page content */}</EnhancedLayout>;
```

**Features:**

- Responsive sidebar with navigation
- Header with search, notifications, and user menu
- Breadcrumb navigation
- Footer with system status
- Mobile overlay and drawer navigation

### DashboardLayout

Specialized layout for dashboard-style pages:

```tsx
import DashboardLayout from "./components/layouts/DashboardLayout";

<DashboardLayout
  title="Dashboard Title"
  subtitle="Optional subtitle"
  actions={
    <div>
      <button className="btn btn-primary">Action Button</button>
    </div>
  }
>
  {/* Dashboard content */}
</DashboardLayout>;
```

**Props:**

- `title?: string` - Main page title
- `subtitle?: string` - Optional subtitle
- `actions?: React.ReactNode` - Action buttons or controls

### FormLayout

Optimized layout for form pages:

```tsx
import FormLayout from "./components/layouts/FormLayout";

<FormLayout
  title="Form Title"
  subtitle="Form description"
  maxWidth="md"
  showCard={true}
>
  {/* Form content */}
</FormLayout>;
```

**Props:**

- `title?: string` - Form title
- `subtitle?: string` - Form description
- `maxWidth?: "sm" | "md" | "lg" | "xl"` - Maximum width constraint
- `showCard?: boolean` - Whether to wrap in a card (default: true)

### TableLayout

Enhanced layout for data tables with search and filters:

```tsx
import TableLayout from "./components/layouts/TableLayout";

<TableLayout
  title="Data Table"
  subtitle="Table description"
  searchPlaceholder="Search records..."
  onSearch={(query) => handleSearch(query)}
  showSearch={true}
  showFilters={true}
  actions={<button className="btn btn-success">Export</button>}
  filters={<div className="row">{/* Filter controls */}</div>}
>
  {/* Table content */}
</TableLayout>;
```

**Props:**

- `title?: string` - Table title
- `subtitle?: string` - Table description
- `searchPlaceholder?: string` - Search input placeholder
- `onSearch?: (query: string) => void` - Search callback
- `actions?: React.ReactNode` - Action buttons
- `filters?: React.ReactNode` - Filter controls
- `showSearch?: boolean` - Show search bar (default: true)
- `showFilters?: boolean` - Show filters panel (default: false)

## Sidebar Navigation

The sidebar automatically generates navigation based on the current route and user permissions:

### Navigation Structure

```tsx
const navigationItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: "bi-speedometer2",
  },
  {
    path: "/pdls",
    label: "PDL Management",
    icon: "bi-people",
    children: [
      { path: "/pdls", label: "Dashboard", icon: "bi-grid" },
      { path: "/pdls/register", label: "Register PDL", icon: "bi-person-plus" },
      // ... more items
    ],
  },
  // ... more sections
];
```

### Features

- **Hierarchical navigation** with expandable sections
- **Active state highlighting** based on current route
- **Icon support** using Bootstrap Icons
- **Badge support** for notifications or counts
- **Role-based visibility** (future enhancement)

## Header Components

### Search Functionality

- **Global search bar** with autocomplete support
- **Quick search** across PDLs, visitors, and records
- **Search suggestions** and recent searches

### Notifications System

- **Real-time notifications** with badge counter
- **Notification types**: info, success, warning, error
- **Mark as read** functionality
- **Notification history** and management

### User Menu

- **User profile information** display
- **Quick access** to profile and settings
- **Secure logout** functionality
- **Role and department** display

## Responsive Behavior

### Desktop (≥992px)

- Full sidebar visible (280px width)
- Complete header with all features
- Multi-column layouts where appropriate

### Tablet (768px - 991px)

- Collapsible sidebar (80px width when collapsed)
- Simplified header layout
- Responsive grid adjustments

### Mobile (≤767px)

- Hidden sidebar with mobile drawer
- Compact header with essential features only
- Single-column layouts
- Touch-optimized interactions

## Styling System

### CSS Architecture

```
styles/
├── enhanced-layout.css      # Main layout styles
└── layout-components.css    # Component-specific styles
```

### Design Tokens

- **Primary Color**: #0d6efd (Bootstrap Blue)
- **Success Color**: #198754 (Bootstrap Green)
- **Warning Color**: #ffc107 (Bootstrap Yellow)
- **Danger Color**: #dc3545 (Bootstrap Red)
- **Gray Scale**: #f8f9fa, #e9ecef, #6c757d, #495057, #212529

### Typography

- **Primary Font**: 'Segoe UI', system-ui, sans-serif
- **Monospace Font**: 'Courier New', monospace (for time displays)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## Accessibility Features

### Keyboard Navigation

- **Tab order** properly managed
- **Focus indicators** clearly visible
- **Keyboard shortcuts** for common actions
- **Screen reader** compatible

### ARIA Support

- **Proper labeling** for all interactive elements
- **Role attributes** for complex components
- **Live regions** for dynamic content updates
- **Semantic HTML** structure

### Color and Contrast

- **WCAG AA compliant** color contrasts
- **High contrast mode** support
- **Color-blind friendly** palette
- **Focus indicators** meet accessibility standards

## Performance Optimizations

### Code Splitting

- **Lazy loading** for non-critical components
- **Dynamic imports** for large dependencies
- **Route-based splitting** for better initial load

### Rendering Optimizations

- **React.memo** for expensive components
- **useMemo and useCallback** for expensive calculations
- **Virtualization** for large data sets
- **Debounced search** to reduce API calls

## Browser Support

### Supported Browsers

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Fallbacks

- **CSS Grid** with Flexbox fallback
- **CSS Custom Properties** with SCSS variables fallback
- **Modern JavaScript** with Babel transpilation

## Integration Guide

### 1. Install Dependencies

```bash
npm install react-router-dom bootstrap bootstrap-icons
```

### 2. Import Styles

```tsx
// In your main App.tsx or index.tsx
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/enhanced-layout.css";
import "./styles/layout-components.css";
```

### 3. Replace Existing Layout

```tsx
// Replace your existing App.tsx with EnhancedApp.tsx
import EnhancedApp from "./components/EnhancedApp";

function App() {
  return <EnhancedApp />;
}
```

### 4. Customize as Needed

- Modify navigation items in `Sidebar.tsx`
- Adjust color scheme in CSS files
- Add custom components as needed

## Future Enhancements

### Planned Features

- **Theme switching** (light/dark mode)
- **Layout customization** per user
- **Advanced notifications** with push support
- **Offline support** with service workers
- **Multi-language support** (i18n)

### Performance Improvements

- **Virtual scrolling** for large lists
- **Image optimization** and lazy loading
- **Bundle size optimization**
- **Caching strategies**

## Troubleshooting

### Common Issues

1. **Sidebar not showing on mobile**

   - Check if `isMobile` state is properly set
   - Verify CSS media queries are working

2. **Navigation not highlighting active route**

   - Ensure React Router is properly configured
   - Check `isActiveRoute` function logic

3. **Responsive breakpoints not working**

   - Verify Bootstrap CSS is loaded
   - Check for CSS conflicts

4. **TypeScript errors**
   - Ensure all prop types are properly defined
   - Check for missing imports

### Debug Mode

Enable debug logging by setting:

```tsx
localStorage.setItem("layout-debug", "true");
```

## Contributing

### Code Style

- Use **TypeScript** for all new components
- Follow **React Hooks** patterns
- Maintain **consistent naming** conventions
- Add **proper documentation** for new features

### Testing

- Write **unit tests** for new components
- Test **responsive behavior** across devices
- Verify **accessibility compliance**
- Check **cross-browser compatibility**

---

For questions or support, please refer to the project documentation or contact the development team.
