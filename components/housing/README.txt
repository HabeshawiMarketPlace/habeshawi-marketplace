HABESHAWI RENTAL CATEGORY UPDATE

1. Copy all folders and files into:
   C:\Users\ENDAL\habeshawi-marketplace

2. Allow Windows to replace the four existing page.tsx files.

3. This adds:
   components/housing/RentalCategoryPage.tsx
   app/housing/commercial/page.tsx

4. Delete the old duplicate component:
   components/housing/RentalCard.tsx

5. Run:
   npm run dev

6. Test:
   http://localhost:3000/housing/rooms
   http://localhost:3000/housing/apartments
   http://localhost:3000/housing/houses
   http://localhost:3000/housing/roommates
   http://localhost:3000/housing/commercial

IMPORTANT:
Commercial listings must use exactly this property_type value in Supabase:
Commercial
