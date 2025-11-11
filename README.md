# Dora – The Hand That Helps

**Local services in Albania — with maps, ratings, and secure verification.**

---

## Features

- **Map Search** (Leaflet + OpenStreetMap)
- **Auto Distance** (km)
- **Availability Calendar** (like Airbnb)
- **Phone Verification** (SMS via Twilio)
- **ID Verification** (admin approval)
- **Secure Messaging** (flags WhatsApp/email)
- **Premium Sorting** (paid professionals first)
- **Admin Panel** (categories, bans, flagged messages)

---

## Tech Stack

| Part | Tech |
|------|------|
| Backend | Node.js, Express, MongoDB |
| Frontend | React, Vite, Tailwind |
| Admin | React |
| Maps | Leaflet |
| SMS | Twilio |
| Images | Cloudinary |
| Deploy | Render, Vercel |

---

## Local Setup

```bash
git clone https://github.com/Dora11112025/dora-app
cd dora-app

# Copy env
cp .env.example .env
# Add your keys in .env

# Install
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install

# Run all
npm run dev
