# Ghost Agency - Design Management Platform

## Overview

Ghost Agency is a subscription-based design management platform that connects clients with design teams through a ticket-based workflow system. The platform enables clients to submit design requests, track their subscription credits, and monitor project progress through an intuitive dashboard. Design teams can manage incoming requests, assign work to employees, and track project status through various workflow stages.

The application provides dual interfaces: a clean, simplified client portal for submitting and tracking design requests, and a comprehensive admin dashboard for managing tickets, team assignments, and workflow operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Library Strategy**
- **Base System**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens following the "Ghost Designer" aesthetic
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

**Design System**
- Custom color palette with light/dark mode support via CSS variables
- Purple primary brand color (270 65% 55%) for distinctive identity
- Inter font family for clean, professional typography
- Consistent spacing and border radius tokens (9px/6px/3px)
- Hover and active elevation states for interactive elements

**Key UI Patterns**
- Drag-and-drop ticket boards using @dnd-kit for kanban-style workflow
- Modal dialogs for ticket assignment and detailed views
- Toast notifications for user feedback
- Theme switching with persistent preference storage
- Responsive design with mobile-first approach

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for type-safe server code
- RESTful API design pattern
- Middleware-based request processing

**Database Layer**
- Drizzle ORM for type-safe database queries
- Schema-first approach with automated migrations
- Connection pooling via @neondatabase/serverless
- WebSocket support for real-time database connections

**Data Models**
- **Users**: Multi-role system (client, admin, employee)
- **Subscriptions**: Credit-based system tracking days used/remaining with pause/resume capability
- **Tickets**: Design requests with status workflow (requested → in_progress → review → completed)
- **Comments**: Thread-based communication on tickets

**Authentication & Authorization**
- Mock authentication system (production requires proper auth implementation)
- Role-based access control (RBAC)
- Session-based authentication pattern

**File Management**
- Multer for multipart form data handling
- Local file storage in uploads directory
- 10MB file size limit per upload
- Support for multiple attachments per ticket

### API Architecture

**Endpoint Structure**
- `/api/user` - Current user profile with subscription data
- `/api/tickets` - Client ticket operations (CRUD)
- `/api/subscriptions/pause` - Subscription pause functionality
- `/api/subscriptions/resume` - Subscription resume functionality
- `/api/admin/tickets` - Admin ticket management with assignment
- `/api/admin/employees` - Employee listing
- `/api/upload` - File upload handling

**Request/Response Pattern**
- JSON request/response bodies
- Consistent error handling with HTTP status codes
- Request validation using Zod schemas
- Response logging middleware for debugging

### External Dependencies

**Database**
- PostgreSQL via Neon serverless platform
- Required environment variable: `DATABASE_URL`
- Uses WebSocket connections via 'ws' package for serverless compatibility

**UI Component Libraries**
- Radix UI primitives (@radix-ui/* packages) - Accessible, unstyled component primitives
- shadcn/ui components - Pre-built styled components on top of Radix
- Lucide React - Icon library for consistent iconography

**Development Tools**
- Vite for build tooling and dev server
- TypeScript for type safety across stack
- Drizzle Kit for database migrations
- ESBuild for server-side bundling

**Third-Party Integrations**
- Google Fonts (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter) loaded via CDN
- date-fns for date formatting and manipulation
- TanStack Query for efficient server state caching and synchronization

**Deployment Considerations**
- Replit-specific plugins for development experience
- Environment-based configuration (NODE_ENV)
- Static asset serving from dist/public
- Server-side rendering setup via Vite SSR middleware