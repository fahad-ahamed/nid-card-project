# 🚀 NID Card Project - Setup & Run Commands

---

## 📦 Original PHP Project (Local Development)

### Requirements
```
PHP >= 7.4
PHP Extensions: json, session, fileinfo, zip, gd, mbstring, xml, openssl
Composer >= 2.0
Apache/Nginx web server
```

### Install Commands
```bash
# Clone the repository
git clone https://github.com/fahad-ahamed/nid-card-project.git
cd nid-card-project

# Install PHP dependencies
composer install

# Set permissions for data directory
chmod 755 Nid-Data/
chmod 666 Nid-Data/*.json
```

### Run Command (Local PHP Server)
```bash
# Start PHP built-in server on port 8000
php -S localhost:8000

# Or use Apache/Nginx with document root pointing to the project folder
```

### Access
```
http://localhost:8000
```

---

## 🟢 Next.js Project (Vercel-Ready)

### Requirements (package.json)
```json
{
  "dependencies": {
    "next": "^16.1.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^6.11.1",
    "prisma": "^6.11.1",
    "zustand": "^5.0.6",
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1",
    "tailwindcss": "^4",
    "sonner": "^2.0.6",
    "zod": "^4.0.2",
    "lucide-react": "^0.525.0",
    "@radix-ui/react-*": "various",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1"
  }
}
```

### requirements.txt (Python-style equivalent for Node.js)
```
next@^16.1.1
react@^19.0.0
react-dom@^19.0.0
@prisma/client@^6.11.1
prisma@^6.11.1
zustand@^5.0.6
html2canvas@^1.4.1
jspdf@^2.5.1
tailwindcss@^4
sonner@^2.0.6
zod@^4.0.2
lucide-react@^0.525.0
typescript@^5
bun-types@^1.3.4
```

### Install Command
```bash
# Using bun (recommended)
bun install

# Using npm
npm install

# Using yarn
yarn install
```

### Database Setup
```bash
# Push schema to SQLite database
bun run db:push

# Generate Prisma client
bun run db:generate
```

### Run Command (Local Development)
```bash
# Development server (port 3000)
bun run dev

# Or with npm
npm run dev
```

### Build Command (Production)
```bash
# Build for production
bun run build

# Start production server
bun run start
```

### Access
```
http://localhost:3000
```

---

## ☁️ Vercel Deployment

### Deploy Command
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

### Vercel Configuration (vercel.json)
```json
{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

### Environment Variables (Vercel Dashboard)
```
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=your-secret-key
```

### Important Notes for Vercel
1. SQLite database is **ephemeral** on Vercel (resets on each deploy)
2. For production, use **Vercel Postgres** or **PlanetScale** instead
3. Photo/signature stored as base64 in DB works fine on Vercel
4. File uploads handled as base64 in request body (no file system needed)

---

## 🔑 Default Credentials
- Admin Password: `fahad`
- Password Reset Code: `32423` (original PHP version)
