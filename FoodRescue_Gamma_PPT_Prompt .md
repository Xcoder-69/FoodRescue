# 🎓 FoodRescue Internship PPT — Complete Gamma.app Prompt

## ✅ How to Use This Prompt
1. Go to [gamma.app](https://gamma.app)
2. Click **"New AI"** → **"Paste a prompt"**
3. Copy the entire prompt below into Gamma
4. Set slide count to **30 slides**
5. Choose a **dark/green tech theme** (e.g., "Midnight" or "Forest")
6. After Gamma generates the PPT, **export as PowerPoint (.pptx)**
7. For slides marked **[UPLOAD YOUR IMAGE HERE]** — after generation, click that slide in Gamma → Insert Image → upload your `.png` screenshot

### 📸 Image Upload Guide — Which Image Goes on Which Slide

| Slide | Image File to Upload |
|---|---|
| Slide 9 (Onboarding) | `1_splash_screen.png`, `2_role_selection.png`, `4_login_and_verification.png` |
| Slide 10 (Restaurant Reg) | `1_Restaurant_Registration_Step_1.png`, `3_Restaurant_Registration_Step_3.png` |
| Slide 11 (NGO & Volunteer) | `5_ngo_registration.png`, `6_volunteer_registration.png` |
| Slide 12 (Dashboards) | `7_restaurant_dashboard.png`, `9_volunteer_dashboard.png`, `10_ngo_dashboard.png` |
| Slide 14 (Create Donation) | `8_create_food_donation.png` |
| Slide 18 (Admin Center) | `31_mission_control_dashboard.png` (from admin_screens/) |
| Slide 19 (User Mgmt) | `15_verification_management.png` |
| Slide 20 (Notifications) | `11_notifications.png` |
| Slide 21 (Analytics) | `13_impact_analytics.png` |
| Slide 22 (CSR) | `18_csr_and_reporting.png` |
| Slide 23 (Profile/Chat) | `12_profile.png`, `14_chat_and_coordination.png`, `20_help_and_support.png` |

---

## 🚀 FULL GAMMA PROMPT — COPY EVERYTHING BELOW

---

```
Create a 30-slide professional internship project presentation for a web application called **FoodRescue** — a Food Rescue Distribution & Management System. This is built by a team of 8 interns.

**PRESENTATION FORMAT:**
- Slide size: Standard Widescreen 16:9 (1920 × 1080 px / 33.87 cm × 19.05 cm)
- Export format: PowerPoint (.pptx) compatible
- Orientation: Landscape

Design it as a premium, clean, modern tech presentation. Use green (#10b981) and dark (#0f172a) as primary colors. Use icons, visuals, infographics, and app screenshots where described. Keep text minimal — use bullet points, stats, and icons. NEVER put paragraphs of text. Every slide should feel like a polished product pitch deck. Leave clearly labeled image placeholder boxes (marked "[Insert App Screenshot Here]") on all slides that show app screens, so real screenshots can be dropped in after.

---

## SLIDE 1 — COVER / TITLE PAGE
**Title:** FoodRescue: Smart Food Rescue & Distribution System
**Subtitle:** Internship Project Presentation — 2026
**Team of 8 Members:**
- [Name 1] | EN No: [EN001]
- [Name 2] | EN No: [EN002]
- [Name 3] | EN No: [EN003]
- [Name 4] | EN No: [EN004]
- [Name 5] | EN No: [EN005]
- [Name 6] | EN No: [EN006]
- [Name 7] | EN No: [EN007]
- [Name 8] | EN No: [EN008]
Show a leaf + bowl icon. Green gradient background. Clean, elegant, minimal.

---

## SLIDE 2 — TABLE OF CONTENTS
Title: What We'll Cover Today
Show a visual numbered list of all major topics:
1. Problem Statement
2. Project Overview & Goals
3. System Architecture
4. Tech Stack
5. User Roles & Registration Flow
6. App Screens Walkthrough
7. Donation Lifecycle
8. Real-Time Features (Socket.io)
9. Security & Fraud Engine
10. Admin Command Center
11. Analytics & Reporting
12. Email Notification System
13. API Design
14. Database Structure (Firestore)
15. Testing & QA
16. Deployment Infrastructure
17. Challenges & Solutions
18. Impact & Statistics
19. Future Roadmap
20. Conclusion & Team Credits
Style: Clean numbered cards with icons. No paragraph text.

---

## SLIDE 3 — PROBLEM STATEMENT
Title: The Problem We're Solving
Show 3 big stats in cards:
- 🍱 40% of all food produced in India is wasted every year
- 😢 190 million people in India go to bed hungry daily
- 🏪 Restaurants, events & caterers discard tons of surplus food with no system to donate it

Visual: Split diagram — Left: Overflowing garbage bin with food. Right: Empty plate, hungry child silhouette.
Bottom tagline: "There is no organized bridge between surplus food and those who need it."

---

## SLIDE 4 — SOLUTION OVERVIEW
Title: Introducing FoodRescue
Tagline: "The Smart Bridge Between Surplus Food & People In Need"

Show 4 big feature cards:
- 🏪 **Restaurants** list surplus food donations instantly
- 🏢 **NGOs** claim & coordinate food collection
- 🚴 **Volunteers** pick up & deliver donations
- 🛡️ **Admins** monitor, verify & ensure fraud prevention

Add a simple flow diagram: Restaurant → Donation Created → NGO Claims → Volunteer Delivers → Impact Tracked

---

## SLIDE 5 — PROJECT GOALS & OBJECTIVES
Title: What We Set Out to Build
Show 6 objective cards with icons:
- ✅ Multi-role registration with document verification
- ✅ Real-time donation lifecycle management
- ✅ Live volunteer GPS tracking via WebSockets
- ✅ AI-assisted fraud detection engine
- ✅ Admin command center with 2FA security
- ✅ Automated analytics & nightly data aggregation
- ✅ Email notification system for all lifecycle events
- ✅ CSR & compliance reporting for corporate donors

---

## SLIDE 6 — SYSTEM ARCHITECTURE DIAGRAM
Title: System Architecture
Show a layered architecture diagram with these components:

**Frontend Layer:**
- HTML5 / CSS3 / JavaScript
- Tailwind CSS
- Socket.io Client
- Hosted on: Vercel (Edge CDN)

**Backend Layer (Node.js + Express):**
- REST API (13 route modules)
- JWT Auth + Session Management
- Socket.io Server (Real-time)
- Fraud Engine
- Cron Jobs (Nightly Analytics)
- Hosted on: Render

**Database & Services Layer:**
- Firebase Firestore (NoSQL DB)
- Firebase Auth (Google OAuth)
- Cloudinary (Image/Document Storage)
- AWS S3 (optional media)
- Nodemailer + Resend (Email)

Use arrows to show request flow: Client → API → Firebase + Cloudinary
Color the architecture blocks in green/dark theme.

---

## SLIDE 7 — TECH STACK
Title: Technologies Used
Show a tech stack grid with logo-style cards:

**Backend:**
- Node.js v18+
- Express.js 4.x
- Socket.io 4.x
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- node-cron (scheduled jobs)
- Joi + express-validator (validation)
- Helmet + CORS + XSS-Clean (security)
- Multer + Streamifier (file uploads)
- Handlebars (email templates)
- otplib + qrcode (2FA)

**Frontend:**
- HTML5, CSS3, JavaScript
- Tailwind CSS
- Google Fonts (Inter)
- Material Symbols Icons

**Database & Cloud:**
- Firebase Firestore
- Firebase Auth
- Cloudinary
- Vercel (Frontend Hosting)
- Render (Backend Hosting)

**Testing & DevOps:**
- Playwright (E2E testing)
- ESLint (code quality)
- nodemon (dev server)
- Git + GitHub

---

## SLIDE 8 — USER ROLES
Title: 4 User Roles in the System
Show a role-card layout with icons and brief descriptions:

🏪 **Restaurant**
- Register with FSSAI license, PAN, GST
- Create food donations
- Monitor donation status
- View CSR reports

🏢 **NGO**
- Register with NGO certificate & 80G docs
- Browse & claim available donations
- Coordinate with volunteers
- Track pickups in real time

🚴 **Volunteer**
- Register with Aadhar & background check
- Accept delivery assignments
- Share live GPS location
- Mark deliveries complete

🛡️ **Admin / Superadmin**
- Full platform oversight
- Approve/ban/suspend users
- Monitor fraud reports
- Access audit logs & analytics
- Requires 2FA for every session

---

## SLIDE 9 — APP SCREENS: ONBOARDING
Title: App Screens — Onboarding & Registration
Layout: 3 equal-width image cards side by side, centered on slide.

**Card 1 — Splash Screen**
[Insert App Screenshot Here — file: 1_splash_screen.png]
Label below: "Splash Screen"
Description: FoodRescue logo + tagline, green gradient, Get Started button

**Card 2 — Role Selection**
[Insert App Screenshot Here — file: 2_role_selection.png]
Label below: "Role Selection"
Description: Choose Restaurant / NGO / Volunteer role

**Card 3 — Login & Verification**
[Insert App Screenshot Here — file: 4_login_and_verification.png]
Label below: "Login & OTP Verification"
Description: Email/password + Google OAuth + OTP login

Bottom caption: "Smooth onboarding with multi-path authentication"

---

## SLIDE 10 — APP SCREENS: RESTAURANT REGISTRATION (5-STEP WIZARD)
Title: Restaurant Registration — 5-Step Verification Wizard

Top: Show a horizontal step progress bar: ① Basic Info → ② Business Details → ③ Documents → ④ Bank Details → ⑤ Declaration ✓

Layout: Step labels on top, 2 large screenshot cards in center of slide.

**Screenshot Card 1:**
[Insert App Screenshot Here — file: 1_Restaurant_Registration_Step_1.png]
Label: "Step 1 — Basic Information"

**Screenshot Card 2:**
[Insert App Screenshot Here — file: 3_Restaurant_Registration_Step_3.png]
Label: "Step 3 — Document Upload"

Below cards — step summary chips:
- Step 1: Name, contact, address
- Step 2: FSSAI, PAN, GST numbers
- Step 3: Certificate uploads → Cloudinary
- Step 4: Bank account & IFSC
- Step 5: Food safety declaration & consent

Bottom caption: "Multi-step wizard with real-time validation & secure document upload"

---

## SLIDE 11 — APP SCREENS: NGO & VOLUNTEER REGISTRATION
Title: NGO & Volunteer Registration Flows
Layout: 2 columns. Left = NGO. Right = Volunteer.

**Left Column — NGO Registration:**
[Insert App Screenshot Here — file: 5_ngo_registration.png]
Label: "NGO Registration"
Bullets below image:
- Organisation name, type, contact
- Reg No., 12A / 80G certificate numbers
- Document uploads → Cloudinary
- Bank account details
- Declaration & consent

**Right Column — Volunteer Registration:**
[Insert App Screenshot Here — file: 6_volunteer_registration.png]
Label: "Volunteer Registration"
Bullets below image:
- Personal info + Aadhar number
- Emergency contact
- Vehicle type (Bike / Cycle / Walk / Car)
- Background check consent
- Profile photo upload

Bottom caption: "Document-verified registration builds a trusted, verified community"

---

## SLIDE 12 — APP SCREENS: DASHBOARDS
Title: Role-Based Dashboards
Layout: 3 equal-width screenshot cards side by side.

**Card 1 — Restaurant Dashboard:**
[Insert App Screenshot Here — file: 7_restaurant_dashboard.png]
Label: "🏪 Restaurant Dashboard"
Key features below: Donation stats · Create Donation CTA · CSR meter

**Card 2 — Volunteer Dashboard:**
[Insert App Screenshot Here — file: 9_volunteer_dashboard.png]
Label: "🚴 Volunteer Dashboard"
Key features below: Assigned deliveries · Live tracking · Pickup map

**Card 3 — NGO Dashboard:**
[Insert App Screenshot Here — file: 10_ngo_dashboard.png]
Label: "🏢 NGO Dashboard"
Key features below: Live donation feed · Claim donations · Volunteer assignment

Bottom caption: "Tailored dashboards for each role — built for speed and clarity"

---

## SLIDE 13 — DONATION LIFECYCLE FLOW
Title: The Donation Lifecycle
Show a beautiful horizontal flow diagram with status badges:

[AVAILABLE] → [CLAIMED] → [ASSIGNED] → [IN_TRANSIT] → [DELIVERED]

With arrows and brief descriptions at each stage:
- **AVAILABLE:** Restaurant creates donation (food type, qty in kg, expiry time, pickup address)
- **CLAIMED:** NGO claims the donation from the feed
- **ASSIGNED:** NGO assigns a volunteer for pickup
- **IN_TRANSIT:** Volunteer picks up, shares live GPS location
- **DELIVERED:** Volunteer marks delivered, all parties notified

Also show: [CANCELLED] and [EXPIRED] as edge states.

Add a stat: "Every donation is immutably tracked via Firestore with full timestamps"

---

## SLIDE 14 — APP SCREENS: CREATE DONATION & FOOD DETAILS
Title: Creating a Food Donation
Layout: Large screenshot on left (60%), feature list on right (40%).

**Left — Screenshot:**
[Insert App Screenshot Here — file: 8_create_food_donation.png]
Label: "Create Donation Form"

**Right — Features list:**
- 🍛 Food name, type (Cooked / Raw / Packaged)
- ⚖️ Quantity in KG
- 👥 Estimated servings
- ⏰ Expiry date & time
- 📍 Pickup address + map picker
- 📝 Special handling notes
- 📷 Food photo upload

**Security Badge (highlight box):**
🔒 Firestore rules: `allow update: if false`
All donation status changes go through the secure Node.js API only.

Bottom caption: "Restaurants list surplus food donations in under 2 minutes"

---

## SLIDE 15 — REAL-TIME FEATURES (SOCKET.IO)
Title: Real-Time Tracking with Socket.io
Show a diagram of the WebSocket event flow:

**Events:**
- `volunteer:updateLocation` — Volunteer sends GPS every 2 seconds
- `track:joinDelivery` — NGO/Restaurant joins tracking room
- `delivery:locationUpdate` — Server broadcasts location to delivery room
- `track:leaveDelivery` — User leaves tracking room

Show a map mockup with a moving pin icon.

**Technical Details:**
- JWT authentication on socket handshake
- Room-based event isolation per delivery
- GeoPoint persisted to Firestore on each update
- Rate limited: 30 location updates/minute

Caption: "Live volunteer GPS tracking visible to NGOs and Restaurants"

---

## SLIDE 16 — SECURITY ARCHITECTURE
Title: Multi-Layer Security System
Show a layered security pyramid or shield diagram:

**Layer 1 — Transport Security:**
- HTTPS only in production
- CORS whitelist (allowed origins only)
- Helmet.js (HTTP security headers)
- XSS-Clean (sanitizes all input)

**Layer 2 — Authentication:**
- JWT Access Token (short-lived) + Refresh Token
- Session validation against Firestore on every request
- Google OAuth 2.0 support
- OTP-based email login

**Layer 3 — Authorization:**
- Role-based access control (RBAC): restaurant / ngo / volunteer / admin
- Route-level `requireRole()` middleware
- Firestore Security Rules (server-side enforcement)

**Layer 4 — Admin Security:**
- Mandatory 2FA (TOTP via otplib + QR code) for ALL admin routes
- Secret security key for admin registration

**Layer 5 — Rate Limiting:**
- General API: 100 req / 15 min / IP
- Auth endpoints: 5 req / 15 min / IP
- Uploads: 20 files / hour
- Location: 30 updates / min

---

## SLIDE 17 — FRAUD DETECTION ENGINE
Title: AI-Assisted Fraud Detection Engine
Show a flowchart of the FraudEngine system:

**FraudEngine.js — 3 Analysis Types:**

🔍 **Registration Analysis:**
- IP velocity check (3+ registrations in 10 min = HIGH_VELOCITY_SPAM_RING)
- Device ID fingerprinting
- Duplicate phone number detection
- Risk Score ≥ 100 → Auto-block registration
- Risk Score 80–99 → Flag for admin review

📄 **Document Hash Check:**
- SHA hash of every uploaded document
- Detect reused FSSAI / PAN / NGO certificates
- Flag DUPLICATE_DOCUMENT_HASH → Risk Score: 85

🚫 **Behavioral Analysis:**
- Track cancellation count per user
- Each cancellation +20 risk score
- Risk Score ≥ 80 → Auto-suspend account + Revoke all sessions

Show risk score meter graphic. Caption: "Zero-trust approach — every action is scored"

---

## SLIDE 18 — ADMIN COMMAND CENTER
Title: Admin Command Center
Layout: 2×2 screenshot grid.

**Top Left — Mission Control Dashboard:**
[Insert App Screenshot Here — file: 31_mission_control_dashboard.png]
Label: "Mission Control"
Features: Total users · Donations · Active sessions · Approvals queue

**Top Right — Security Operations Center:**
[Insert App Screenshot Here — file: 32_security_operations_center.png]
Label: "Security Operations"
Features: Fraud report list · Risk scores · Resolve / escalate

**Bottom Left — Fraud Intelligence Center:**
[Insert App Screenshot Here — file: 33_fraud_intelligence_center.png]
Label: "Fraud Intelligence"
Features: Entity type · Reason · Risk score · One-click resolve

**Bottom Right — Immutable Audit Ledger:**
[Insert App Screenshot Here — file: 34_immutable_audit_ledger.png]
Label: "Audit Ledger"
Features: Admin UID · Action type · Timestamp · Immutable log

Bottom security badge: 🔐 All admin routes: JWT + Role=admin + 2FA verified

---

## SLIDE 19 — USER MANAGEMENT & VERIFICATION
Title: User Management & Verification Workflow
Layout: Screenshot on right (50%), status flow diagram on left (50%).

**Left — Status Flow Diagram:**
[PENDING_REVIEW] → [APPROVED] → ✅ Active
                → [REJECTED] → 🔄 Re-apply
                → [SUSPENDED] → ⚠️ Appeal
                → [BANNED] → ❌ Permanent

**Left — Admin Actions list:**
- 📄 View docs (FSSAI, PAN, Aadhar, 80G)
- ✅ Approve with one click
- ❌ Reject with reason message
- ⏸️ Suspend temporarily
- 🚫 Ban permanently
- 🔑 Revoke all sessions for any user

**Right — Screenshot:**
[Insert App Screenshot Here — file: 15_verification_management.png]
Label: "Verification Management Panel"

Bottom caption: "Manual document review + automated fraud scoring = trusted community"

---

## SLIDE 20 — NOTIFICATIONS & EMAIL SYSTEM
Title: Notification & Email System
Layout: Screenshot card on left (40%), notification flow diagram on right (60%).

**Left — Screenshot:**
[Insert App Screenshot Here — file: 11_notifications.png]
Label: "In-App Notification Center"

**Right — Two-part flow:**

🔔 In-App Notifications (Firestore real-time):
- New donation available → NGOs
- Donation claimed → Restaurant
- Volunteer assigned → Volunteer
- Delivery completed → All parties
- Account approved/rejected → User

📧 Email Notifications (Nodemailer + Resend):
6 Handlebars HTML templates:
- Welcome (Restaurant variant)
- Welcome (NGO variant)
- Welcome (Volunteer variant)
- OTP Verification
- Application Status Update
- Donation Completed

Bottom caption: "Real-time in-app + transactional email for every lifecycle event"

---

## SLIDE 21 — ANALYTICS & REPORTING
Title: Analytics & Impact Reporting
Layout: Screenshot on left (45%), data pipeline diagram on right (55%).

**Left — Screenshot:**
[Insert App Screenshot Here — file: 13_impact_analytics.png]
Label: "Impact Analytics Dashboard"

**Right — Analytics Pipeline:**
⏰ Nightly Cron Job (runs at 00:00 daily):
- Count DELIVERED donations of previous day
- Sum total food donated (KG)
- Count new registered users
- Write to Firestore: `analytics/platform_daily/trends/{date}`
- Update global lifetime counters via Firestore transaction

📊 Available to Admin via API:
- `GET /api/analytics/global` → Lifetime totals
- `GET /api/analytics/trends` → Daily trend data

📈 Visualizations:
- Bar chart: Daily donations over 30 days
- Pie chart: Donation status breakdown
- Line chart: User registrations over time

Bottom caption: "Pre-aggregated nightly = instant analytics at any scale"

---

## SLIDE 22 — CSR & COMPLIANCE REPORTING
Title: CSR & Corporate Social Responsibility Reporting
Layout: Screenshot on right (45%), info cards on left (55%).

**Right — Screenshot:**
[Insert App Screenshot Here — file: 18_csr_and_reporting.png]
Label: "CSR & Reporting Center"

**Left — Two columns of cards:**

🏪 For Restaurant Partners:
- Monthly food donated (KG + meals served)
- CO2 emissions saved estimate
- 80G tax benefit summary
- Downloadable PDF report

🏢 For NGO Partners:
- Beneficiary count by month
- Donation source breakdown
- Volunteer performance stats
- Compliance audit trail

Bottom caption: "FoodRescue makes CSR reporting automatic — helping restaurants claim tax benefits"

---

## SLIDE 23 — APP SCREENS: PROFILE, CHAT & SUPPORT
Title: Additional App Screens
Layout: 3 equal screenshot cards side by side.

**Card 1 — Profile Screen:**
[Insert App Screenshot Here — file: 12_profile.png]
Label: "User Profile"
Features below: Edit info · Re-upload docs · Change password · Enable 2FA

**Card 2 — Chat & Coordination:**
[Insert App Screenshot Here — file: 14_chat_and_coordination.png]
Label: "Chat & Coordination"
Features below: NGO ↔ Volunteer messaging · Real-time pickup coordination

**Card 3 — Help & Support:**
[Insert App Screenshot Here — file: 20_help_and_support.png]
Label: "Help & Support"
Features below: FAQ · Support ticket · Complaint · Terms & Privacy links

Bottom caption: "Complete user experience — from onboarding to support"

---

## SLIDE 24 — DATABASE STRUCTURE (FIRESTORE COLLECTIONS)
Title: Database Design — Firestore Collections
Show a clean collection schema table or diagram:

| Collection | Key Fields |
|---|---|
| `users` | uid, role, email, status, isSuspended, is2FAVerified, riskScore, cancelCount |
| `restaurants` | uid, name, FSSAI, PAN, GST, bankDetails, status, documents |
| `ngos` | uid, orgName, regNo, 80GCert, status, documents |
| `volunteers` | uid, name, Aadhar, vehicleType, currentLocation (GeoPoint) |
| `donations` | restaurantId, status, foodDetails, ngoId, volunteerId, timestamps |
| `sessions` | userId, ipAddress, deviceId, createdAt, isRevoked |
| `notifications` | recipientId, type, message, read, createdAt |
| `reports` | reporterId, reason, status, createdAt |
| `analytics` | platform_global (stats), platform_daily/trends/{date} |
| `security/logs/fraudReports` | entityId, entityType, reason, riskScore, status |
| `documents` | hash, uploadedBy, timestamp |

Caption: "Firestore Security Rules enforce role-based data access at the database level"

---

## SLIDE 25 — API DESIGN
Title: RESTful API Design — 13 Modules
Show a clean API module table:

| Module | Base Route | Key Endpoints |
|---|---|---|
| Auth | `/api/auth` | register, login, google, OTP, 2FA, sessions |
| Restaurant | `/api/restaurant` | profile, dashboard |
| NGO | `/api/ngo` | profile, dashboard, claim |
| Volunteer | `/api/volunteer` | profile, dashboard |
| Donations | `/api/donations` | create, list, getById, claim, cancel |
| Location | `/api/location` | update, get |
| Notifications | `/api/notifications` | list, markRead |
| Admin | `/api/admin` | approvals, userStatus, fraudReports, auditLogs, sessions |
| Analytics | `/api/analytics` | global, trends |
| Complaints | `/api/complaints` | create, list, updateStatus |
| Delivery | `/api/delivery` | create, update |
| Email | `/api/email` | send templates |
| Support | `/api/support` | tickets |

Caption: "All routes protected by JWT middleware. Admin routes additionally require 2FA."

---

## SLIDE 26 — TESTING & QA
Title: Testing & Quality Assurance
Show a QA process flow diagram:

**Playwright End-to-End Tests:**
- Registration flow test (Restaurant, NGO, Volunteer)
- Login with email/password
- OTP flow validation
- Donation creation & status update
- Admin approval workflow

**Rate Limiter Tests:**
- Verify auth lockout after 5 failed attempts
- Verify IP-based blocking behavior

**Security Tests:**
- XSS input validation
- JWT tamper detection
- Session revocation verification
- Firestore rules enforcement

**Code Quality:**
- ESLint with custom rules (src/ directory)
- Consistent error handler middleware
- Async error boundary (express-async-errors)

Show a test pass/fail summary table.

---

## SLIDE 27 — DEPLOYMENT INFRASTRUCTURE
Title: Production Deployment Infrastructure
Show a cloud architecture diagram:

**Frontend → Vercel**
- Static HTML/CSS/JS
- Auto-deploy from GitHub
- Edge CDN (global low latency)
- Zero configuration CI/CD

**Backend API → Render**
- Node.js Web Service
- Start: `npm start`
- Auto-deploy on git push
- Secret files: Firebase Service Account JSON

**Database → Firebase**
- Firestore (NoSQL, real-time)
- Firebase Auth (Google OAuth)
- Firestore Security Rules

**Media → Cloudinary**
- Document uploads (FSSAI, PAN, NGO certs)
- Food photos
- Profile pictures
- CDN delivery

**Backup Strategy:**
- Google Cloud Scheduler → nightly Firestore export to GCS bucket
- Render dashboard logs for real-time monitoring

Caption: "Fully managed, serverless-first infrastructure with automatic scaling"

---

## SLIDE 28 — CHALLENGES & SOLUTIONS
Title: Key Challenges & How We Solved Them
Show a challenge → solution card layout (3 cards):

**Challenge 1: Horizontal Privilege Escalation**
Problem: NGOs could manipulate donation status directly via Firestore SDK
Solution: Firestore rules set `allow update: if false` on donations collection. All status changes MUST go through the Node.js API with role verification.

**Challenge 2: Fraud Prevention at Scale**
Problem: Bad actors creating fake restaurants/NGOs to claim food without delivery
Solution: Built FraudEngine with IP velocity checks, document hash deduplication, and behavioral scoring. Auto-suspend on risk score ≥ 80.

**Challenge 3: Real-Time Location Without Overloading**
Problem: Volunteers sending GPS updates every second would overwhelm Firestore
Solution: Socket.io event `volunteer:updateLocation` rate-limited to 30/min. Location broadcast to delivery-specific rooms only. GeoPoint stored with debouncing.

---

## SLIDE 29 — IMPACT & FUTURE ROADMAP
Title: Impact & Future Vision

**Current Impact (Demo Data):**
Show 4 big impact counters:
- 🍱 2,400+ KG Food Rescued
- 🏪 85+ Restaurant Partners
- 🏢 30+ NGO Partners
- 🚴 120+ Active Volunteers

**Future Roadmap — v2.0:**
Show a timeline / roadmap visual:
- 📱 Native Mobile App (React Native)
- 🤖 ML-based demand prediction (predict which areas need food most)
- 🗺️ Smart routing algorithm for volunteers (optimize delivery paths)
- 💳 UPI payment integration for CSR donations
- 🔔 WhatsApp/SMS notification support
- 🌍 Multi-city, multi-language support
- 📊 Advanced BI dashboard with Power BI integration
- 🌐 Partner API for corporate canteens & caterers

---

## SLIDE 30 — CONCLUSION & THANK YOU
Title: Thank You!
Tagline: "FoodRescue — Rescuing Food. Restoring Hope. One Delivery at a Time."

Show the full team grid (2×4) with names and EN numbers:
- [Name 1] — EN No: [EN001]
- [Name 2] — EN No: [EN002]
- [Name 3] — EN No: [EN003]
- [Name 4] — EN No: [EN004]
- [Name 5] — EN No: [EN005]
- [Name 6] — EN No: [EN006]
- [Name 7] — EN No: [EN007]
- [Name 8] — EN No: [EN008]

**Project Links:**
- GitHub: github.com/Xcoder-69/FoodRescue
- Tech Stack: Node.js · Firebase · Socket.io · Vercel · Render

**Guided by:** [Mentor/Professor Name]
**Institution:** [College Name] | [Year]

Large green leaf icon + "Thank You" centered. Elegant, premium closing slide.
```

---

## 📝 FILL IN BEFORE USING:
Replace these placeholders in the prompt before pasting into Gamma:

| Placeholder | Fill With |
|---|---|
| `[Name 1–8]` | Actual team member names |
| `[EN001–EN008]` | Actual enrollment numbers |
| `[Mentor/Professor Name]` | Your guide's name |
| `[College Name]` | Your institution name |
| `[Year]` | 2025–26 or current academic year |

---

## 🎨 RECOMMENDED GAMMA SETTINGS:
- **Theme:** Midnight or Dark Forest (dark bg with green accent)
- **Font:** Inter or Plus Jakarta Sans
- **Accent Color:** #10b981 (emerald green)
- **Slide count:** 30
- **Slide Size:** Widescreen **16:9** — `1920 × 1080 px` (standard PPT size)
  - In Gamma: Settings → Slide Size → Widescreen (16:9)
  - In PowerPoint after export: Design → Slide Size → Widescreen (16:9)
- **Export:** Download as `.pptx` for editing in PowerPoint / Google Slides
