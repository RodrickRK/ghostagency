# Design Guidelines: Ghost Design Agency Management Platform

## Design Approach
**Selected Approach:** Design System Foundation with Custom Branding Layer
- **Base System:** Tailwind UI + shadcn/ui components for consistency and efficiency
- **Custom Layer:** Ghost Designer-inspired playful minimalism with distinctive personality
- **Rationale:** Balance professional SaaS functionality with creative agency aesthetic that builds trust while maintaining operational efficiency

## Core Design Principles
1. **Dual Interface Philosophy:** Clean utility for admins, delightful simplicity for clients
2. **Ghost Theme Integration:** Subtle playful elements without compromising professionalism
3. **Status Clarity:** Always-visible progress indicators and credit tracking
4. **Confidence Through Design:** Premium feel justifies subscription model

## Color Palette

### Light Mode
- **Primary Brand:** 270 65% 55% (Ghost purple, distinctive and memorable)
- **Secondary/Accent:** 240 5% 96% (Soft gray for cards and sections)
- **Background:** 0 0% 100% (Clean white)
- **Text Primary:** 240 10% 15% (Near black)
- **Text Secondary:** 240 5% 45% (Medium gray)
- **Success:** 142 70% 45% (Progress indicators)
- **Warning:** 38 92% 50% (Pause states)
- **Border:** 240 6% 90% (Subtle divisions)

### Dark Mode
- **Primary Brand:** 270 65% 60% (Slightly lighter purple)
- **Secondary/Accent:** 240 5% 15% (Dark gray cards)
- **Background:** 240 10% 8% (Deep charcoal)
- **Text Primary:** 0 0% 95% (Near white)
- **Text Secondary:** 240 5% 65% (Light gray)
- **Success:** 142 70% 50%
- **Warning:** 38 92% 55%
- **Border:** 240 5% 20% (Dark divisions)

## Typography
- **Primary Font:** Inter (Google Fonts) - Clean, professional SaaS standard
- **Display/Hero:** Inter Bold 600-700 weight for headings
- **Body Text:** Inter Regular 400 weight
- **Code/Monospace:** JetBrains Mono for ticket IDs, dates

### Type Scale
- Hero/H1: text-4xl md:text-5xl font-bold
- H2: text-3xl md:text-4xl font-semibold
- H3: text-2xl font-semibold
- H4: text-xl font-semibold
- Body Large: text-lg
- Body: text-base
- Body Small: text-sm
- Caption: text-xs

## Layout System
**Spacing Units:** Tailwind scale focusing on 2, 4, 8, 12, 16, 24 for consistency
- **Micro spacing:** gap-2, p-2 (tight grouped elements)
- **Component padding:** p-4, p-6 (cards, forms)
- **Section spacing:** py-8, py-12, py-16 (page sections)
- **Macro spacing:** py-24, py-32 (major divisions)

**Grid System:**
- Dashboard: 12-column grid for flexible layouts
- Kanban: 4-column board (Requested, In Progress, Review, Completed)
- Forms: Single column max-w-2xl for focus
- Admin tables: Full-width responsive with horizontal scroll on mobile

## Component Library

### Navigation
- **Client Dashboard:** Clean top nav with logo, credit counter badge, profile dropdown
- **Admin Dashboard:** Sidebar navigation with collapsible sections (Tickets, Team, Analytics)
- **Mobile:** Hamburger menu with slide-out drawer

### Cards & Containers
- **Ticket Cards:** Rounded-lg with shadow-sm, hover:shadow-md transition
- **Kanban Cards:** Compact with drag handles, priority indicators, assignee avatars
- **Stat Cards:** Dashboard metrics with large numbers, trend indicators
- **Borders:** 1px solid with border color from palette

### Forms
- **Request Form:** Multi-step with progress indicator, file upload dropzone
- **Input Fields:** Rounded borders, focus ring with primary color, consistent height h-10
- **Textareas:** Min height with resize capability
- **File Upload:** Drag-and-drop zone with preview thumbnails
- **Dark Mode Forms:** Ensure input backgrounds contrast properly (bg-gray-800 dark mode)

### Kanban Board
- **Columns:** Equal width, vertical scrolling, distinct background shading
- **Card Movement:** Smooth drag animations, drop zone indicators
- **Empty States:** Friendly ghost illustrations with encouraging copy
- **Filters:** Tag-based filtering by project type, priority, assignee

### Status & Progress
- **Subscription Widget:** Prominent card showing days used/remaining with visual progress bar
- **Pause Button:** Warning-styled with confirmation modal
- **Status Badges:** Rounded-full pills with color coding (purple: active, orange: paused, green: completed)
- **Timeline:** Vertical timeline for ticket history visible to both admin and client

### Data Display
- **Tables:** Striped rows, sortable columns, pagination
- **Avatar Groups:** Overlapping circles for team assignments
- **Metrics:** Large numbers with contextual labels and trend arrows

### Buttons & Actions
- **Primary CTA:** bg-primary text-white rounded-md px-6 py-2.5
- **Secondary:** variant="outline" with primary border
- **Destructive:** variant="destructive" for pause/cancel actions
- **Icon Buttons:** Square with hover background, 40px touch target

### Modals & Overlays
- **Assignment Modal:** Team member selection with workload indicators
- **Confirmation Dialogs:** Clear action consequences, especially for pause/cancel
- **Image Previews:** Full-screen lightbox for uploaded files

## Images
- **Landing Hero:** Full-width hero with ghost-themed illustration or abstract gradient background (not required but recommended for marketing page)
- **Empty States:** Custom ghost character illustrations for empty Kanban columns, no tickets state
- **Avatars:** Team member and client profile images, default ghost avatar for unassigned
- **Upload Previews:** Thumbnail grid for client-uploaded reference files

## Animations
**Minimal and Purposeful Only:**
- **Card Hovers:** Subtle lift with shadow transition (150ms)
- **Drag & Drop:** Smooth card movement, drop zone highlighting
- **Status Changes:** Badge color transitions
- **Loading States:** Skeleton screens for data fetching, no spinners
- **Page Transitions:** None - instant navigation for SaaS feel

## Accessibility
- Maintain WCAG AA contrast ratios across both modes
- Focus indicators on all interactive elements
- Keyboard navigation for Kanban drag-drop (arrow keys + enter)
- Screen reader labels for status badges and progress indicators
- Dark mode toggle accessible from any page

## Platform-Specific Patterns
- **Client View:** Simplified, beautiful, focuses on their projects only
- **Admin View:** Information-dense, efficiency-focused with bulk actions
- **Credit System:** Always visible counter, visual warnings at 5 days remaining
- **Pause State:** Orange theme overlay when subscription paused, resume CTA prominent