# Bangladesh NID Card Maker - Project Conversion

## Task ID: nid-conversion-001

## Summary
Converted a PHP-based Bangladesh NID Card Maker project to Next.js 16 with App Router, TypeScript, Tailwind CSS 4, shadcn/ui, and Prisma ORM with SQLite.

## Files Created/Modified

### Database
- `prisma/schema.prisma` - Updated with NidCard and AdminPassword models
- Database pushed with `bun run db:push`

### API Routes
- `src/app/api/nid/route.ts` - NID CRUD API (GET, POST, DELETE)
- `src/app/api/admin/login/route.ts` - Admin login API

### State Management
- `src/lib/store.ts` - Zustand store with types and state for views, cards, search, admin auth

### Components
- `src/components/nid-card-form.tsx` - Form with all fields, photo/signature upload, auto-generate demo data
- `src/components/nid-card-print.tsx` - Printable NID card (front & back) with PDF417 barcode
- `src/components/nid-card-view.tsx` - Card viewer with download (PDF/PNG/Print)
- `src/components/nid-card-admin.tsx` - Admin panel with login, stats, search, CRUD

### Main Page & Layout
- `src/app/page.tsx` - Single-page app with tabs/views (home, card-view, admin, search)
- `src/app/layout.tsx` - Updated layout with Sonner toaster, Bengali lang
- `src/app/globals.css` - Bangladesh government theme colors, Bengali font support, print styles

### Config
- `eslint.config.mjs` - Added nid-card-project to ignores

## Key Features
1. NID card creation form with drag & drop photo/signature upload
2. Auto-generate demo data button
3. NID card viewer showing front (photo, name, father, mother, DOB, NID) and back (address, blood, barcode)
4. PDF417 barcode on card back
5. Download as PDF/PNG and print support
6. Search by NID number or PIN
7. Admin panel with login (password: "fahad"), stats, search/filter, delete
8. Bangladesh government theme (green #006a4e, gold, red)
9. Bengali text support throughout
10. Responsive design

## Status: Complete
- Lint passes with no errors
- Dev server running, pages compile successfully
- API endpoints tested and working (POST /api/nid returns 201, GET /api/nid?all=true returns 200)
