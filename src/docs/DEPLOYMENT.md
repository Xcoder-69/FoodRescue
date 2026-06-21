# Food Rescue App - Production Deployment Guide

## 1. Infrastructure Stack
- **Frontend:** Vercel (Automatic CI/CD from GitHub)
- **Backend API & Real-Time WebSockets:** Render
- **Database & Auth:** Firebase Firestore & Firebase Auth
- **Media Storage:** Cloudinary

## 2. Production Environment Variables
Configure these inside the **Render Dashboard**:

```env
NODE_ENV=production
PORT=10000
ALLOWED_ORIGINS=https://your-foodrescue-frontend.vercel.app

# Security Keys
JWT_ACCESS_SECRET=your_64_char_secret
JWT_REFRESH_SECRET=your_64_char_secret
SESSION_SECRET=your_64_char_secret
ADMIN_SECRET_CODE=FOOD_RESCUE_ADMIN_2026

# Email / Notifications
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Google & Firebase
GOOGLE_CLIENT_ID=your_client_id
FIREBASE_SERVICE_ACCOUNT_PATH=/etc/secrets/firebaseServiceAccount.json

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

## 3. Deployment Steps

### Backend (Render)
1. Push this codebase to a private GitHub repository.
2. In Render, click "New +" -> "Web Service".
3. Connect your GitHub repository.
4. Set the Start Command to: `npm start`
5. Set the Build Command to: `npm install`
6. Go to the "Secret Files" tab in Render and upload your `firebaseServiceAccount.json` to the path `/etc/secrets/firebaseServiceAccount.json`.
7. Add the Environment Variables listed above.
8. Click Deploy.

### Frontend (Vercel)
1. Push your frontend HTML/CSS/JS files to a GitHub repository.
2. Import the project into Vercel.
3. Vercel will automatically serve the static files via its Edge CDN.

## 4. Backup & Monitoring Strategy
- **Database Backups:** Configure a Google Cloud Scheduler job to run `gcloud firestore export` nightly to a secure GCS bucket.
- **Monitoring:** Monitor real-time logs directly in the Render dashboard. Use the built-in FoodRescue `Fraud Intelligence Center` API for application-level security monitoring.
