# FoodRescue PPT - Gamma REORDER & EDIT Prompt

## How to Use
1. Open your FoodRescue presentation in gamma.app
2. Click **Edit with AI** or open the AI sidebar  
3. Paste the full prompt below into Gamma's AI chat
4. Review each slide after reordering

> **Alternative:** Manually drag slides in the left panel to match the order table at the bottom.

---

## FULL GAMMA EDIT PROMPT — COPY BELOW

Please completely restructure and reorder my FoodRescue presentation into the following new 43-slide order. Keep all existing content but move, rename, and improve each slide. Add new slides where described.

DESIGN RULES (apply to ALL slides):
- Section divider slides: full-bleed dark green gradient, large centered group number + name, NO content
- Content slides: clean title at top, visual content center, minimal bullet points only
- Use icons, infographics, charts, data visuals - NO paragraph text
- Colors: Green (#10b981) on dark (#0f172a)
- Font: Inter or Plus Jakarta Sans

============================================================
SLIDE 1 - COVER / TITLE PAGE
============================================================
Title: FoodRescue — Smart Food Rescue & Distribution System
Subtitle: Internship Project Presentation — 2026
8 team member cards in 2x4 grid: [Name 1-8] | EN No: [EN001-EN008]
Guided by: [Mentor/Professor Name] | Institution: [College Name] | 2025-26
Visual: leaf + bowl icon on green gradient. Elegant minimal layout.

============================================================
SLIDE 2 - TABLE OF CONTENTS
============================================================
Title: What We Will Cover Today
Numbered group cards 2-column grid:
GROUP 1 - Introduction & The Problem (Slides 4-5)
GROUP 2 - Introducing FoodRescue (Slides 7-8)
GROUP 3 - System Architecture & Tech Stack (Slides 10-11)
GROUP 4 - User Roles & App Screens (Slides 13-17)
GROUP 5 - Core Features & Donation Lifecycle (Slides 19-21)
GROUP 6 - Security & Fraud Prevention (Slides 23-24)
GROUP 7 - Admin Center & Analytics (Slides 26-29)
GROUP 8 - Technical Deep Dive (Slides 31-33)
GROUP 9 - Testing, Deployment & DevOps (Slides 35-36)
GROUP 10 - Challenges, Lessons & Impact (Slides 38-40)
GROUP 11 - Team & Closing (Slides 42-43)

============================================================
SLIDE 3 - SECTION DIVIDER: GROUP 1
============================================================
SECTION DIVIDER only. Full dark green gradient. Large centered:
  Group 1 of 11 | Introduction & The Problem | Slides 4-5

============================================================
SLIDE 4 - INDIA FOOD WASTE CRISIS [NEW SLIDE - CREATE THIS]
============================================================
Title: India's Food Waste Crisis

LEFT — 3 big stat cards:
- "40%" of all food produced in India is wasted | Source: IFPRI/FSSAI 2023
- "190 Million" Indians go to bed hungry every night | Source: FAO 2023  
- "Rs.92,000 Crore" worth of food wasted annually | Source: ASSOCHAM

RIGHT — Donut chart "Where Does India's Food Go?":
  40% Wasted | 35% Consumed | 15% Spoiled in transit | 10% Redistributed

Below chart: "India is among the world's largest food-wasting nations by volume"
Bottom full-width tagline: "Restaurants, caterers & events discard tons of surplus food daily with no organized system to redistribute it."

============================================================
SLIDE 5 - GLOBAL FOOD WASTE DATA [NEW SLIDE - CREATE THIS]
============================================================
Title: Global Food Waste — A Crisis of Our Time

TOP ROW — 3 stat cards:
- "1.3 Billion Tonnes" wasted globally every year | FAO/UN 2023
- " Trillion" economic loss from global food waste
- "8-10%" of global greenhouse gas emissions from food waste

MIDDLE — Horizontal Bar Chart "Top Food-Wasting Nations (KG/person/year)":
  Australia 361kg | USA 278kg | Europe avg 173kg | China 129kg | India 50kg (note: highest total volume)

BOTTOM — Two comparison boxes:
  "Food wasted globally = could feed 2 billion people"
  "870 million people worldwide are chronically hungry"

Bottom green caption: "The world produces enough food for everyone — the problem is distribution."

============================================================
SLIDE 6 - SECTION DIVIDER: GROUP 2
============================================================
SECTION DIVIDER. Full dark green gradient. Centered:
  Group 2 of 11 | Introducing FoodRescue | Slides 7-8

============================================================
SLIDE 7 - WHAT IS FOODRESCUE?
============================================================
Title: Introducing FoodRescue
Tagline: "The Smart Bridge Between Surplus Food & People In Need"
4 role cards 2x2: Restaurant (FSSAI-verified donors) | NGO (80G-certified) | Volunteer (Aadhar-verified) | Admin (2FA-protected)
Flow below: Restaurant -> Donation Listed -> NGO Claims -> Volunteer Delivers -> Impact Tracked
Caption: "Built by a team of 8 interns — 100% open source, fully production-deployed."

============================================================
SLIDE 8 - PROJECT GOALS & OBJECTIVES
============================================================
Title: What We Set Out to Build
8 checkmark goal cards 2x4:
- Multi-role registration with document verification (FSSAI, PAN, Aadhar, 80G)
- Real-time donation lifecycle management (5 status stages)
- Live volunteer GPS tracking via WebSockets (Socket.io)
- AI-assisted fraud detection engine (risk scoring + auto-suspend)
- Admin command center with mandatory 2FA security
- Automated nightly analytics aggregation (cron jobs)
- Email notification system for all lifecycle events (6 Handlebars templates)
- CSR & compliance reporting for corporate restaurant partners

============================================================
SLIDE 9 - SECTION DIVIDER: GROUP 3
============================================================
SECTION DIVIDER. Full dark green gradient. Centered:
  Group 3 of 11 | System Architecture & Tech Stack | Slides 10-11

============================================================
SLIDE 10 - SYSTEM ARCHITECTURE
============================================================
Title: System Architecture — 3-Layer Architecture Diagram

LAYER 1 FRONTEND: HTML5/CSS3/JS | Tailwind CSS | Socket.io Client | Hosted: Vercel Edge CDN
  ↓ HTTPS REST + WebSocket ↓
LAYER 2 BACKEND: Node.js + Express | 13 REST API modules | JWT Auth | Socket.io Server | FraudEngine | Cron Jobs | Hosted: Render
  ↓ Firestore SDK + Cloudinary API ↓
LAYER 3 DATA & SERVICES: Firebase Firestore | Firebase Auth | Cloudinary | Nodemailer + Resend

Color each layer differently. Show request flow arrows.
Caption: "Fully decoupled frontend + backend with managed cloud services"

============================================================
SLIDE 11 - TECH STACK
============================================================
Title: Technologies Used — 4-column logo card grid

BACKEND: Node.js v18+ | Express.js 4.x | Socket.io 4.x | JWT | bcryptjs | node-cron | Helmet+CORS+XSS-Clean | Multer+Cloudinary | Handlebars | otplib+qrcode
FRONTEND: HTML5 | CSS3 | JavaScript | Tailwind CSS | Google Fonts Inter | Material Symbols Icons
DATABASE & CLOUD: Firebase Firestore | Firebase Auth | Cloudinary CDN | Vercel | Render
TESTING & DEVOPS: Playwright E2E | ESLint | nodemon | Git+GitHub | GitHub Actions

============================================================
SLIDE 12 - SECTION DIVIDER: GROUP 4
============================================================
SECTION DIVIDER. Full dark green gradient. Centered:
  Group 4 of 11 | User Roles & App Screens | Slides 13-17

============================================================
SLIDE 13 - 4 USER ROLES
============================================================
Title: 4 User Roles in the System — 2x2 role cards

RESTAURANT: Register FSSAI/PAN/GST | Create donations | Monitor status | Download CSR reports
NGO: Register with 80G cert | Browse & claim donations | Assign volunteers | Track live GPS
VOLUNTEER: Register with Aadhar | Accept assignments | Share live GPS | Mark deliveries complete
ADMIN: Full platform oversight | Approve/ban users | Monitor fraud | Audit ledger (2FA required)

============================================================
SLIDE 14 - APP SCREENS: ONBOARDING
============================================================
Title: App Screens — Onboarding & Login — 3 screenshot cards

[Insert App Screenshot Here - 1_splash_screen.png] | Splash Screen
[Insert App Screenshot Here - 2_role_selection.png] | Role Selection
[Insert App Screenshot Here - 4_login_and_verification.png] | Login & OTP
Caption: "Smooth multi-path onboarding with secure authentication"

============================================================
SLIDE 15 - APP SCREENS: REGISTRATION FLOWS
============================================================
Title: Registration Flows — Multi-Step Document Verification — 3 columns

RESTAURANT 5-Step: [Insert - 1_Restaurant_Registration_Step_1.png] | FSSAI, PAN, GST, bank
NGO: [Insert - 5_ngo_registration.png] | 12A/80G cert, bank details
VOLUNTEER: [Insert - 6_volunteer_registration.png] | Aadhar, vehicle type, background check
Caption: "Document-verified registration builds a trusted, fraud-resistant community"

============================================================
SLIDE 16 - APP SCREENS: DASHBOARDS
============================================================
Title: Role-Based Dashboards — 3 screenshot cards

[Insert - 7_restaurant_dashboard.png] | Restaurant: Donation stats, Create CTA, CSR meter
[Insert - 9_volunteer_dashboard.png] | Volunteer: Assigned deliveries, live map, pickup status
[Insert - 10_ngo_dashboard.png] | NGO: Live donation feed, claim button, volunteer assignment
Caption: "Tailored dashboards for each role — built for speed and clarity"

============================================================
SLIDE 17 - APP SCREENS: ADDITIONAL SCREENS
============================================================
Title: Additional App Screens — 3 screenshot cards

[Insert - 12_profile.png] | Profile: Edit info, re-upload docs, change password, 2FA
[Insert - 14_chat_and_coordination.png] | Chat: NGO <-> Volunteer messaging, real-time coordination
[Insert - 20_help_and_support.png] | Support: FAQ, support ticket, complaint form
Caption: "Complete user experience — from onboarding to support"

============================================================
SLIDE 18 - SECTION DIVIDER: GROUP 5
============================================================
SECTION DIVIDER. Full dark green gradient. Centered:
  Group 5 of 11 | Core Features & Donation Lifecycle | Slides 19-21

============================================================
SLIDE 19 - DONATION LIFECYCLE FLOW
============================================================
Title: The Donation Lifecycle

Large horizontal flow: [AVAILABLE] -> [CLAIMED] -> [ASSIGNED] -> [IN_TRANSIT] -> [DELIVERED]
Edge states: [CANCELLED] (+20 risk score) and [EXPIRED] (auto-expire after expiry time)

Stage descriptions:
AVAILABLE: Restaurant creates donation (type, qty KG, expiry, pickup address)
CLAIMED: NGO claims from live feed
ASSIGNED: NGO assigns verified volunteer
IN_TRANSIT: Volunteer picks up, shares live GPS — NGO & Restaurant track in real time
DELIVERED: All parties notified, analytics updated

Bottom stat: "Every donation tracked via Firestore with full timestamps & audit trail"

============================================================
SLIDE 20 - CREATE DONATION FORM
============================================================
Title: Creating a Food Donation

Left 55%: [Insert - 8_create_food_donation.png] | "Create Donation Form"
Right 45% feature list: Food name/type | Quantity KG | Estimated servings | Expiry | Pickup address + map | Handling notes | Photo upload (Cloudinary)
Security box: "Firestore rule: allow update: if false — all status changes via Node.js API only"
Caption: "Restaurants list surplus food donations in under 2 minutes"

============================================================
SLIDE 21 - REAL-TIME TRACKING (SOCKET.IO)
============================================================
Title: Real-Time Volunteer Tracking with Socket.io

WebSocket flow: VOLUNTEER sends volunteer:updateLocation (GPS/2sec) -> SERVER broadcasts delivery:locationUpdate to room -> NGO/RESTAURANT receives
4 detail cards: JWT auth on socket handshake | Room-based event isolation | GeoPoint persisted to Firestore | Rate limited 30 updates/min
Caption: "Live GPS visible to NGOs and Restaurants — volunteers tracked in real time"

============================================================
SLIDE 22 - SECTION DIVIDER: GROUP 6
============================================================
SECTION DIVIDER. Full dark green gradient. Centered:
  Group 6 of 11 | Security & Fraud Prevention | Slides 23-24

============================================================
SLIDE 23 - MULTI-LAYER SECURITY
============================================================
Title: Multi-Layer Security Architecture — Security Pyramid (5 layers)

Layer 1 (base): TRANSPORT — HTTPS only | CORS whitelist | Helmet.js | XSS-Clean
Layer 2: AUTHENTICATION — JWT Access+Refresh tokens | Session validated on every request | Google OAuth | OTP email
Layer 3: AUTHORIZATION — RBAC (restaurant/ngo/volunteer/admin) | requireRole() middleware | Firestore Security Rules
Layer 4: ADMIN SECURITY — Mandatory TOTP 2FA on ALL admin routes | Secret key for admin registration | Session revocation
Layer 5 (top): RATE LIMITING — 100 req/15min/IP general | 5 req/15min/IP auth | 20 uploads/hour | 30 location/min

Caption: "Zero-trust, defence-in-depth: every request authenticated, authorized, and rate-limited"

============================================================
SLIDE 24 - FRAUD DETECTION ENGINE
============================================================
Title: AI-Assisted Fraud Detection Engine — FraudEngine.js flowchart

Branch 1 REGISTRATION: IP velocity (3 in 10min = auto-block) | Device fingerprint | Duplicate phone | Risk>=100 block | Risk 80-99 flag
Branch 2 DOCUMENT HASH: SHA-256 every document | Detect reused FSSAI/PAN/NGO certs | Duplicate hash = +85 risk
Branch 3 BEHAVIORAL: Each cancellation +20 risk | Risk>=80 auto-suspend + revoke all sessions

Risk Score meter graphic (0-100, danger at 80+)
Caption: "Zero-trust — every registration and action is scored in real time"

============================================================
SLIDE 25 - SECTION DIVIDER: GROUP 7
============================================================
SECTION DIVIDER. Full dark green gradient. Centered:
  Group 7 of 11 | Admin Center & Analytics | Slides 26-29

============================================================
SLIDE 26 - ADMIN COMMAND CENTER
============================================================
Title: Admin Command Center — 2x2 screenshot grid

[Insert - 31_mission_control_dashboard.png] Mission Control | users, donations, sessions, approval queue
[Insert - 32_security_operations_center.png] Security Ops | fraud list, risk scores, resolve/escalate
[Insert - 33_fraud_intelligence_center.png] Fraud Intelligence | entity, reason, risk, one-click resolve
[Insert - 34_immutable_audit_ledger.png] Audit Ledger | admin UID, action, timestamp, immutable record

Badge: "All admin routes: JWT + Role=admin + 2FA verified — mandatory every session"

============================================================
SLIDE 27 - USER MANAGEMENT & VERIFICATION
============================================================
Title: User Management & Verification Workflow

Left — Status flow: [PENDING_REVIEW] -> APPROVED (active) | REJECTED (re-apply) | SUSPENDED (appeal) | BANNED (permanent)
Admin actions: View docs | One-click approve | Reject with reason | Suspend | Permanent ban | Revoke all sessions

Right: [Insert - 15_verification_management.png] | "Verification Management Panel"
Caption: "Manual document review + automated fraud scoring = trusted community"

============================================================
SLIDE 28 - NOTIFICATION & EMAIL SYSTEM
============================================================
Title: Notification & Email Automation System

Left 40%: [Insert - 11_notifications.png] | "In-App Notification Center"
Right 60%:
IN-APP (Firestore real-time): New donation->NGOs | Claimed->Restaurant | Volunteer assigned | Delivered->all | Account approved/rejected->user
EMAIL (Nodemailer + Resend): 6 Handlebars templates: Welcome Restaurant | Welcome NGO | Welcome Volunteer | OTP | Status Update | Donation Complete
Caption: "Real-time in-app + transactional email for every lifecycle event"

============================================================
SLIDE 29 - ANALYTICS & CSR REPORTING
============================================================
Title: Analytics Engine & CSR Reporting Dashboard

Left: [Insert - 13_impact_analytics.png] | "Impact Analytics Dashboard"
Nightly Cron (00:00): Count delivered donations | Sum KG donated | Count new users | Write to analytics/platform_daily/trends/{date}
API: GET /api/analytics/global | GET /api/analytics/trends
Charts: 30-day bar | Status pie | User growth line

Right: [Insert - 18_csr_and_reporting.png] | "CSR & Reporting Center"
For Restaurants: Monthly KG + meals | CO2 saved | 80G tax benefit | PDF download
For NGOs: Beneficiary count | Donation source | Compliance audit trail
Caption: "Pre-aggregated nightly analytics + automatic CSR reporting for all partners"

============================================================
SLIDE 30 - SECTION DIVIDER: GROUP 8
============================================================
SECTION DIVIDER. Full dark green gradient. Centered:
  Group 8 of 11 | Technical Deep Dive | Slides 31-33

============================================================
SLIDE 31 - DATABASE SCHEMA
============================================================
Title: Database Design — Firestore Collections

Table: Collection | Key Fields
users | uid, role, email, status, isSuspended, is2FAVerified, riskScore, cancelCount
restaurants | uid, name, FSSAI, PAN, GST, bankDetails, status, documents
ngos | uid, orgName, regNo, 80GCert, status, documents
volunteers | uid, name, Aadhar, vehicleType, currentLocation (GeoPoint)
donations | restaurantId, status, foodDetails, ngoId, volunteerId, timestamps
sessions | userId, ipAddress, deviceId, createdAt, isRevoked
notifications | recipientId, type, message, read, createdAt
reports | reporterId, reason, status, createdAt
analytics | platform_global, platform_daily/trends/{date}
security/logs | entityId, entityType, reason, riskScore, status
documents | hash, uploadedBy, timestamp

Caption: "Firestore Security Rules enforce role-based access — no direct client writes allowed"

============================================================
SLIDE 32 - REST API DESIGN (13 MODULES)
============================================================
Title: RESTful API Design — 13 Route Modules

Table: Module | Base Route | Key Endpoints
Auth | /api/auth | register, login, google, OTP, 2FA, sessions
Restaurant | /api/restaurant | profile, dashboard
NGO | /api/ngo | profile, dashboard, claim
Volunteer | /api/volunteer | profile, dashboard
Donations | /api/donations | create, list, getById, claim, cancel
Location | /api/location | update, get
Notifications | /api/notifications | list, markRead
Admin | /api/admin | approvals, userStatus, fraudReports, auditLogs
Analytics | /api/analytics | global, trends
Complaints | /api/complaints | create, list, updateStatus
Delivery | /api/delivery | create, update
Email | /api/email | send templates
Support | /api/support | tickets

Caption: "All routes: JWT middleware. Admin routes: JWT + 2FA token required."

============================================================
SLIDE 33 - DOCUMENT VERIFICATION & KYC
============================================================
Title: Document Verification & KYC Process — 3-column flow

RESTAURANT KYC: Upload->Cloudinary | FSSAI/PAN/GST/IFSC | SHA-256 hash dedupe | Admin review | PENDING->APPROVED/REJECTED
NGO KYC: Upload->Cloudinary | Reg cert/12A/80G/bank | SHA-256 hash dedupe | Admin+80G review | PENDING->APPROVED/REJECTED
VOLUNTEER KYC: Upload->Cloudinary | Aadhar/photo | Background check consent | Vehicle declaration | PENDING->APPROVED/REJECTED

Badge: "Document fraud = risk score spike -> auto-flagged for admin review"

============================================================
SLIDE 34 - SECTION DIVIDER: GROUP 9
============================================================
SECTION DIVIDER. Full dark green gradient. Centered:
  Group 9 of 11 | Testing, Deployment & DevOps | Slides 35-36

============================================================
SLIDE 35 - TESTING STRATEGY & QA
============================================================
Title: Testing Strategy & Quality Assurance — 4-category layout

PLAYWRIGHT E2E: Registration flow (all 3 roles) | Login email/pass | OTP verification | Donation create+update | Admin approval
SECURITY TESTS: XSS sanitization | JWT tamper detection | Session revocation | Firestore rules enforcement
RATE LIMITER TESTS: Auth lockout after 5 failures | IP-based blocking
CODE QUALITY: ESLint custom rules | Async error handler | express-async-errors boundary

Show test results table with PASS/FAIL badges.

============================================================
SLIDE 36 - DEPLOYMENT & DEVOPS
============================================================
Title: Production Deployment Infrastructure — Cloud architecture diagram

FRONTEND -> Vercel: Static HTML/CSS/JS | Auto-deploy GitHub | Edge CDN | Zero-config CI/CD
BACKEND -> Render: Node.js | npm start | Auto-deploy | Firebase service account secret
DATABASE -> Firebase: Firestore NoSQL | Firebase Auth | Security Rules
MEDIA -> Cloudinary: Documents + photos | Profile pics | CDN delivery

BACKUP: Google Cloud Scheduler -> Nightly Firestore export -> GCS Bucket | Render logs monitoring
Caption: "Fully managed, serverless-first infrastructure with automatic scaling"

============================================================
SLIDE 37 - SECTION DIVIDER: GROUP 10
============================================================
SECTION DIVIDER. Full dark green gradient. Centered:
  Group 10 of 11 | Challenges, Lessons & Impact | Slides 38-40

============================================================
SLIDE 38 - CHALLENGES & SOLUTIONS
============================================================
Title: Key Challenges & How We Solved Them — 3 challenge-solution cards

Challenge 1: Horizontal Privilege Escalation
Problem: NGOs manipulated donation status directly via Firestore client SDK
Solution: Firestore rule "allow update: if false" on donations. ALL changes via Node.js API with role+ownership check.

Challenge 2: Fraud Prevention at Scale
Problem: Fake restaurants/NGOs fraudulently claiming food without delivering
Solution: FraudEngine.js — IP velocity (3 registrations/10min=block), SHA-256 hash dedupe, behavioral scoring. Auto-suspend at risk>=80.

Challenge 3: Real-Time Location Without Firestore Overload
Problem: GPS every second = 86,400 writes/day per volunteer (too expensive)
Solution: Socket.io rooms rate-limited to 30/min. Delivery-specific rooms only. Firestore write debounced to every 10 seconds.

============================================================
SLIDE 39 - LESSONS LEARNED
============================================================
Title: Lessons Learned & Key Takeaways — 6 lesson cards 2x3

Security First: Retrofitted rate limiting after vulnerability found. Lesson: Design security in planning, not after.
WebSocket Rooms: Global broadcast caused data leaks. Lesson: Always scope to specific delivery rooms.
Pre-Aggregation: Real-time queries are slow at scale. Lesson: Nightly cron = instant dashboards.
E2E Testing: Playwright caught 3 critical bugs pre-deploy. Lesson: Write tests alongside features.
API Contracts: Without shared schemas, integration took 2x longer. Lesson: Lock API shapes before coding.
Domain Constraints: Real expiry/trust requirements forced better design. Lesson: Real constraints = better engineers.

============================================================
SLIDE 40 - IMPACT & FUTURE ROADMAP
============================================================
Title: Impact, Numbers & Future Vision

4 large counter cards:
2,400+ KG Food Rescued | 85+ Restaurant Partners | 30+ NGO Partners | 120+ Active Volunteers

Future Roadmap timeline:
Phase 1 (NOW): Web platform live and deployed
Phase 2 (Q3 2026): Native Mobile App (React Native)
Phase 3 (Q4 2026): ML-based demand prediction
Phase 4 (2027): Smart routing algorithm for volunteers
Phase 5 (2027+): WhatsApp/SMS | UPI payments | Multi-city | Multi-language

Caption: "FoodRescue is live — scalable, secure, and ready for real-world deployment"

============================================================
SLIDE 41 - SECTION DIVIDER: GROUP 11
============================================================
SECTION DIVIDER. Full dark green gradient. Centered:
  Group 11 of 11 | Team & Closing | Slides 42-43

============================================================
SLIDE 42 - TEAM CONTRIBUTIONS & ROLES
============================================================
Title: Meet the Team — 2x4 team card grid

[Name 1] | EN001 | Backend API & Auth System
[Name 2] | EN002 | Frontend UI & Dashboards
[Name 3] | EN003 | Real-Time Socket.io & Location
[Name 4] | EN004 | Admin Center & Security
[Name 5] | EN005 | Fraud Engine & Analytics
[Name 6] | EN006 | Registration Flows & KYC
[Name 7] | EN007 | Testing, QA & Deployment
[Name 8] | EN008 | Email System & Notifications

Guided by: [Mentor/Professor Name] | Institution: [College Name] | 2025-26

============================================================
SLIDE 43 - THANK YOU & Q&A
============================================================
Title: Thank You!
Tagline: "FoodRescue — Rescuing Food. Restoring Hope. One Delivery at a Time."
GitHub: github.com/Xcoder-69/FoodRescue
Tech: Node.js | Firebase | Socket.io | Vercel | Render
Large leaf+bowl icon with green glow. Premium minimal closing slide.
Q&A: "Happy to walk through any part of the system — fraud engine, WebSockets, or database design."

---

## FINAL SLIDE ORDER TABLE

| Slide | Type | Title |
|---|---|---|
| 1 | Cover | FoodRescue Title & Team |
| 2 | Agenda | Table of Contents (11 Groups) |
| 3 | SECTION | GROUP 1: Introduction & The Problem |
| 4 | Content | India's Food Waste Crisis (Data + Donut Chart) |
| 5 | Content | Global Food Waste — Worldwide Data (Bar Chart) |
| 6 | SECTION | GROUP 2: Introducing FoodRescue |
| 7 | Content | What is FoodRescue? — Solution Overview |
| 8 | Content | Project Goals & Objectives |
| 9 | SECTION | GROUP 3: System Architecture & Tech Stack |
| 10 | Content | System Architecture Diagram (3 layers) |
| 11 | Content | Technologies Used (Tech Stack grid) |
| 12 | SECTION | GROUP 4: User Roles & App Screens |
| 13 | Content | 4 User Roles in the System |
| 14 | Content | App Screens — Onboarding & Login |
| 15 | Content | Registration Flows — Document Verification |
| 16 | Content | Role-Based Dashboards |
| 17 | Content | Additional App Screens (Profile, Chat, Support) |
| 18 | SECTION | GROUP 5: Core Features & Donation Lifecycle |
| 19 | Content | The Donation Lifecycle Flow |
| 20 | Content | Creating a Food Donation |
| 21 | Content | Real-Time Tracking with Socket.io |
| 22 | SECTION | GROUP 6: Security & Fraud Prevention |
| 23 | Content | Multi-Layer Security Architecture |
| 24 | Content | AI-Assisted Fraud Detection Engine |
| 25 | SECTION | GROUP 7: Admin Center & Analytics |
| 26 | Content | Admin Command Center (4 screens) |
| 27 | Content | User Management & Verification Workflow |
| 28 | Content | Notification & Email Automation System |
| 29 | Content | Analytics Engine & CSR Reporting |
| 30 | SECTION | GROUP 8: Technical Deep Dive |
| 31 | Content | Database Schema — Firestore Collections |
| 32 | Content | REST API Design — 13 Modules |
| 33 | Content | Document Verification & KYC Process |
| 34 | SECTION | GROUP 9: Testing, Deployment & DevOps |
| 35 | Content | Testing Strategy & Quality Assurance |
| 36 | Content | Production Deployment Infrastructure |
| 37 | SECTION | GROUP 10: Challenges, Lessons & Impact |
| 38 | Content | Key Challenges & How We Solved Them |
| 39 | Content | Lessons Learned & Key Takeaways |
| 40 | Content | Impact, Numbers & Future Roadmap |
| 41 | SECTION | GROUP 11: Team & Closing |
| 42 | Content | Team Contributions & Roles |
| 43 | Content | Thank You & Q&A |

**Total: 43 slides** — 11 green section dividers + 30 content slides + 1 cover + 1 agenda

---

## GAMMA SETTINGS
- Theme: Midnight or Dark Forest
- Accent Color: #10b981 (emerald green)
- Background: #0f172a (dark navy)
- Font: Inter or Plus Jakarta Sans
- Slide Size: Widescreen 16:9 (1920x1080 px)
- Export: .pptx

---

## PLACEHOLDERS TO FILL BEFORE PASTING
| Placeholder | Fill With |
|---|---|
| [Name 1-8] | Actual team member names |
| [EN001-EN008] | Actual enrollment numbers |
| [Mentor/Professor Name] | Your guide's name |
| [College Name] | Your institution name |

---

## IMAGE UPLOAD GUIDE (Updated Slide Numbers)
| Slide | Images |
|---|---|
| Slide 14 (Onboarding) | 1_splash_screen.png, 2_role_selection.png, 4_login_and_verification.png |
| Slide 15 (Registration) | 1_Restaurant_Registration_Step_1.png, 5_ngo_registration.png, 6_volunteer_registration.png |
| Slide 16 (Dashboards) | 7_restaurant_dashboard.png, 9_volunteer_dashboard.png, 10_ngo_dashboard.png |
| Slide 17 (Extra Screens) | 12_profile.png, 14_chat_and_coordination.png, 20_help_and_support.png |
| Slide 20 (Create Donation) | 8_create_food_donation.png |
| Slide 26 (Admin Center) | 31_mission_control_dashboard.png, 32_security_operations_center.png, 33_fraud_intelligence_center.png, 34_immutable_audit_ledger.png |
| Slide 27 (User Mgmt) | 15_verification_management.png |
| Slide 28 (Notifications) | 11_notifications.png |
| Slide 29 (Analytics) | 13_impact_analytics.png, 18_csr_and_reporting.png |
