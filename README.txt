HABESHAWI JOBS + BUSINESSES UPGRADE

Replace these files:

JOBS
1. lib/jobs/queries.ts
2. app/jobs/page.tsx
3. app/jobs/[id]/page.tsx

BUSINESSES
4. lib/businesses/queries.ts
5. app/businesses/page.tsx
6. components/businesses/BusinessCard.tsx

This update adds:

JOBS
- keyword search
- category filter
- employment-type filter
- location filter
- Featured Jobs section
- Latest Jobs section
- Similar Jobs on the detail page
- case-insensitive approved status matching

BUSINESSES
- keyword search
- category filter
- city filter
- Featured Businesses section
- Newest Businesses section
- fixed duplicate image wrapper in BusinessCard
- cleaner business card layout
- case-insensitive approved status matching

IMPORTANT DATABASE NOTE

The Featured Jobs query expects a boolean column named:

featured

in the jobs table.

If your jobs table does not have it, run this in Supabase SQL Editor:

alter table public.jobs
add column if not exists featured boolean not null default false;

After replacing the files, run:

npm run build

Then test:

http://localhost:3000/jobs
http://localhost:3000/businesses
