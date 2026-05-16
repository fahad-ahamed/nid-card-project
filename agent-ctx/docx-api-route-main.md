# Task: Create DOCX Download API Route for NID Card Project

## Task ID: docx-api-route

## Summary

Created the DOCX download API route at `/home/z/my-project/src/app/api/nid/docx/route.ts` that generates a proper Word document with the NID card layout (front and back sides).

## What was done

1. **Installed JSZip dependency** - `npm install jszip` in the project

2. **Created `/src/app/api/nid/docx/route.ts`** - A Next.js API route handler that:
   - Takes `nid` as a query parameter
   - Gets NID card data from the in-memory store (`@/lib/store` - `getCardByNid()`)
   - Generates a DOCX file using JSZip with proper OOXML structure
   - Returns the DOCX file as a downloadable response

3. **DOCX structure** includes:
   - `[Content_Types].xml` - Package content type definitions
   - `_rels/.rels` - Root relationships
   - `word/document.xml` - Main document with OOXML tables for front/back card
   - `word/styles.xml` - Document styles (Arial default, CardTitle, Label, Value, NIDCardTable)
   - `word/_rels/document.xml.rels` - Image relationships
   - `word/media_photo.png` - User's photo (from base64)
   - `word/media_sign.png` - User's signature (from base64)
   - `word/media_bdicon.png` - Bangladesh icon (from public/assets)
   - `word/media_adminsign.jpg` - Admin signature (from public/assets)
   - `word/media_mududdron.png` - Mududdron stamp (from public/assets)

4. **Front card layout** (table):
   - Row 1: BD icon + Government header text (Bengali + English) + "National ID Card / জাতীয় পরিচয় পত্র"
   - Row 2: Photo+Signature column | Data fields column (নাম/Name/পিতা/মাতা/DOB/ID NO)

5. **Back card layout** (table):
   - Row 1: Property text (সম্পত্তি declaration)
   - Row 2: Address | Blood Group | Birth Place
   - Row 3: Admin signature + "প্রদানকারী কর্তৃপক্ষের স্বাক্ষর" | Issue date | Mududdron stamp

6. **Response headers**:
   - `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - `Content-Disposition: attachment; filename="NID-{nid}.docx"`

## Key design decisions

- Used JSZip to create the DOCX (ZIP with XML files) matching the original PHP implementation
- Bengali text uses "Kalpurush" font in DOCX (matching the project's CSS `bn` class)
- Images are embedded inline using OOXML `<wp:inline>` drawing elements
- Card dimensions approximate credit card size (85.6mm) using OOXML twips
- Gracefully handles missing images (placeholder text, empty cells)
- Static assets loaded from `public/assets/Images/` directory at build time

## API Usage

```
GET /api/nid/docx?nid=1234567890
```

Returns a DOCX file download, or:
- 400 if `nid` parameter is missing
- 404 if NID card not found in store
- 500 if DOCX generation fails
