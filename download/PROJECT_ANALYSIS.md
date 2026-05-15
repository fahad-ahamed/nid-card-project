# 🔍 NID Card Project - Full Analysis

## 📌 Project Overview
**Name:** NID Card Project (Bangladesh National Identity Card Maker)  
**Original Tech:** PHP + JSON File Storage  
**Converted Tech:** Next.js 16 + Prisma SQLite + TypeScript  
**Author:** fahad-ahamed  
**GitHub:** https://github.com/fahad-ahamed/nid-card-project  

---

## 📂 Original PHP Project Structure
```
nid-card-project/
├── index.php           → Redirect to nid_make.php
├── nid_make.php        → NID কার্ড তৈরির ফর্ম (photo/signature upload)
├── nid_view.php        → NID কার্ড ভিউ + PDF417 barcode
├── nid_search.php      → NID/PIN দিয়ে অনুসন্দান API (JSON response)
├── admin.php           → Admin panel (login, CRUD, timer, delete)
├── downloader.php      → PDF/PNG/DOCX ডাউনলোড
├── composer.json       → dompdf/dompdf ^3.1
├── Nid-Data/           → JSON ফাইল-ভিত্তিক ডাটা স্টোরেজ
│   ├── {nid}.json      → Individual NID card data
│   └── admin_password.json
├── assets/
│   ├── CSS/            → Bootstrap, custom CSS, Bengali fonts
│   ├── JavaScript/     → jQuery, PDF417, bcmath
│   ├── Images/         → Bangladesh icon, flower logo, etc.
│   └── vendor/         → Bootstrap 5, Bootstrap Icons
└── vendor/             → Composer packages (dompdf)
```

---

## 🔧 Dependencies Analysis

### PHP Dependencies (composer.json)
| Package | Version | Purpose |
|---------|---------|---------|
| dompdf/dompdf | ^3.1 | PDF generation from HTML |

### Frontend Dependencies (CDN/Bundled)
| Library | Version | Purpose |
|---------|---------|---------|
| Bootstrap | 5.x | UI framework |
| Bootstrap Icons | 1.x | Icon library |
| Font Awesome | 6.1.1 | Additional icons |
| jQuery | 1.11.1 | DOM manipulation |
| PDF417.js | - | Barcode generation |
| html2canvas | 1.4.1 | Screenshot capture |
| jsPDF | 2.5.1 | Client-side PDF |
| Nikosh Font | - | Bengali font for card |
| Kalpurush Font | - | Bengali font |
| Hind Siliguri | - | Bengali UI font |

### PHP Extensions Required
- `php-json` — JSON encode/decode
- `php-session` — Admin login sessions
- `php-fileinfo` — File type detection
- `php-zip` — DOCX generation (ZipArchive)
- `php-gd` or `php-imagick` — Image processing (for dompdf)
- `php-mbstring` — Multibyte string support (Bengali text)
- `php-xml` — DOM/XML parsing

---

## 🏗️ Architecture Analysis

### Data Flow
1. **Create:** User fills form → PHP validates → Saves JSON to `Nid-Data/` → Redirects to view
2. **View:** Load JSON file → Render HTML card → PDF417 barcode via JavaScript
3. **Search:** AJAX request to `nid_search.php` → Scans JSON files → Returns JSON
4. **Admin:** Session-based login → CRUD operations on JSON files → Timer for auto-delete
5. **Download:** html2canvas captures card → jsPDF generates PDF / Direct PNG / Server-side DOCX

### Security Features
- Input sanitization with `htmlspecialchars()`
- NID number validation (10-17 digits)
- PIN validation (4-10 digits)
- Blood group whitelist validation
- File upload size limits (Photo: 5MB, Signature: 2MB)
- Admin password protection (default: "fahad")
- Password reset with code (32423)

### Storage Mechanism
- **JSON file-based** — Each NID card stored as `{nid}.json` in `Nid-Data/`
- Photo & signature stored as **base64** within the JSON
- Admin password in `admin_password.json`
- Delete timer in `delete_timer.json`

---

## ⚠️ Vercel Compatibility Issues (PHP → Next.js Conversion Required)

| Issue | PHP | Next.js Solution |
|-------|-----|-----------------|
| File I/O | JSON file storage | Prisma + SQLite |
| File Upload | `$_FILES` + `move_uploaded_file` | Base64 in request body |
| Sessions | `$_SESSION` | JWT / stateless auth |
| PDF Generation | dompdf (server-side) | html2canvas + jsPDF (client-side) |
| DOCX | ZipArchive (server-side) | Client-side or API route |
| PHP Runtime | Apache/Nginx | Vercel Serverless Functions |

---

## 📋 Next.js Conversion Summary

### New Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Prisma ORM + SQLite
- **State:** Zustand
- **API:** Next.js API Routes (Serverless)
- **PDF/PNG:** html2canvas + jsPDF
- **Barcode:** Canvas-based PDF417

### Database Schema
```prisma
model NidCard {
  id, nameBn, nameEn, nid (unique), pin, father, mother,
  birthPlace, dob, blood, address, gender, 
  photoBase64, photoType, signBase64, signType,
  issueDate, createdAt, updatedAt
}
model AdminPassword { id, password }
```

### API Endpoints
- `POST /api/nid` — Create NID card
- `GET /api/nid?nid=xxx` — Search by NID
- `GET /api/nid?pin=xxx` — Search by PIN
- `GET /api/nid?all=true` — Get all cards
- `DELETE /api/nid?nid=xxx` — Delete card
- `DELETE /api/nid?all=true` — Delete all
- `POST /api/admin/login` — Admin login
