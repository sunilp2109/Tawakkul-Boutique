# Tawakkul Boutique Full-Stack Architecture

This repository now contains the full-stack architecture for the Tawakkul Boutique project, comprising a public frontend, a protected admin panel, and an Express.js backend.

## Project Structure
- `/` - The existing vanilla Vite/JS public frontend.
- `/admin` - The new React + Tailwind CSS Admin Dashboard (`admin@tawakkulboutique.com / Admin@1234`).
- `/backend` - The new Node.js + Express API and MongoDB database layer.

## Requirements
- **Node.js** v18+ 
- **MongoDB**: You must have a MongoDB instance running locally (port 27017) or update `backend/.env` with your MongoDB Atlas URI.

## How to Run

### 1. Start the Backend API
The backend handles database connections, API routes, authentications, and image uploads.
```bash
cd backend
npm install
npm run dev
```
*Note: The backend runs on `http://localhost:5000`.*
*On first startup, the default Admin account (`admin@tawakkulboutique.com` / `Admin@1234`) will be created automatically in your MongoDB.*

### 2. Start the Admin Panel
The admin panel is a React SPA built with Vite and Tailwind CSS.
```bash
cd admin
npm install
npm run dev
```
*Note: The admin panel runs on `http://localhost:5174` and proxies `/api` requests to the backend.*

### 3. Start the Public Storefront
Your original vanilla frontend project.
```bash
# In the root folder
npm install
npm run dev
```

## Features Implemented
- **Admin Dashboard:** Real-time stats, revenue charts, and recent orders.
- **Product Management:** Full CRUD operations with multiple local image uploads.
- **Orders & Customers:** Order status tracking, search filters, and customer history.
- **Banners Management:** Hero images with titles, customizable CTAs, and enable/disable toggles.
- **Security:** Fully protected REST API using JWT Tokens.

## Deployment Notes
- For production, `multer` image uploads should ideally be mapped to cloud storage like Cloudinary or AWS S3 instead of saving to local disk, specifically if hosting on platforms with ephemeral filesystems (like Vercel, Heroku or Render).
- Make sure to keep `JWT_SECRET` highly secure in production `.env`.
