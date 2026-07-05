# FoodRescue — Gamma REARRANGE Prompt (for existing 27 slides)

## How to Use in Gamma
1. Open your FoodRescue presentation in gamma.app
2. Open the **AI sidebar** (click the sparkle/AI icon)
3. Type or paste the prompt below into the AI chat
4. Click Send and let Gamma rearrange the slides

---

## GAMMA AI PROMPT — PASTE THIS:

---

I have 27 existing slides in this FoodRescue presentation. Please REARRANGE them into the following order. Do NOT add new slides, do NOT delete any slides. Just reorder them so the final sequence matches the list below exactly. Here is the new order I want:

**POSITION 1** → The slide titled: "FoodRescue: Smart Food Rescue & Distribution System" (Cover / Title Page)

**POSITION 2** → The slide titled: "What We'll Cover Today" (Table of Contents)

**POSITION 3** → The slide titled: "The Problem We're Solving" (Problem Statement with India food waste stats — 40% wasted, 190 million hungry)

**POSITION 4** → The slide titled: "Introducing FoodRescue" (Solution overview with 4 role cards: Restaurant, NGO, Volunteer, Admin — and the flow arrow)

**POSITION 5** → The slide titled: "What We Set Out to Build" (Project Goals & Objectives — 8 checkmark cards)

**POSITION 6** → The slide titled: "System Architecture" (3-layer architecture diagram: Frontend → Backend → Data layer)

**POSITION 7** → The slide titled: "Technologies Used" (Tech Stack grid: Backend, Frontend, Database, Testing)

**POSITION 8** → The slide titled: "4 User Roles in the System" (Role cards: Restaurant, NGO, Volunteer, Admin)

**POSITION 9** → The slide titled: "App Screens — Onboarding & Registration" (3 screenshot cards: Splash, Role Selection, Login)

**POSITION 10** → The slide titled: "Restaurant Registration — 5-Step Verification Wizard" (Step progress bar + 2 screenshot cards)

**POSITION 11** → The slide titled: "NGO & Volunteer Registration Flows" (2-column: NGO left, Volunteer right)

**POSITION 12** → The slide titled: "Role-Based Dashboards" (3 screenshots: Restaurant, Volunteer, NGO dashboards)

**POSITION 13** → The slide titled: "The Donation Lifecycle" (Horizontal flow: AVAILABLE → CLAIMED → ASSIGNED → IN_TRANSIT → DELIVERED)

**POSITION 14** → The slide titled: "Creating a Food Donation" (Large screenshot left + feature list right)

**POSITION 15** → The slide titled: "Real-Time Tracking with Socket.io" (WebSocket event flow diagram + technical details)

**POSITION 16** → The slide titled: "Multi-Layer Security System" (Security pyramid or layered shield diagram)

**POSITION 17** → The slide titled: "AI-Assisted Fraud Detection Engine" (FraudEngine.js flowchart with 3 branches)

**POSITION 18** → The slide titled: "Admin Command Center" (2x2 screenshot grid of admin screens)

**POSITION 19** → The slide titled: "User Management & Verification Workflow" (Status flow diagram + verification panel screenshot)

**POSITION 20** → The slide titled: "Notification & Email System" (In-app notifications + 6 email templates)

**POSITION 21** → The slide titled: "Analytics & Impact Reporting" (Impact analytics dashboard + nightly cron pipeline)

**POSITION 22** → The slide titled: "CSR & Corporate Social Responsibility Reporting" (CSR report center screenshot + info cards)

**POSITION 23** → The slide titled: "Additional App Screens" (3 screenshots: Profile, Chat & Coordination, Help & Support)

**POSITION 24** → The slide titled: "Database Design — Firestore Collections" (Collection schema table)

**POSITION 25** → The slide titled: "RESTful API Design — 13 Modules" (API module table)

**POSITION 26** → The slide titled: "Testing & Quality Assurance" (Playwright E2E, Security tests, Rate limiter tests, Code quality)

**POSITION 27** → The slide titled: "Production Deployment Infrastructure" (Cloud diagram: Vercel, Render, Firebase, Cloudinary)

After rearranging, please also update the **Table of Contents** slide (Position 2) to reflect this new order with the following topics in sequence:
1. The Problem We're Solving
2. Introducing FoodRescue
3. Project Goals & Objectives
4. System Architecture
5. Technologies Used
6. 4 User Roles
7. App Screens — Onboarding
8. Registration Flows
9. Role-Based Dashboards
10. Donation Lifecycle
11. Creating a Donation
12. Real-Time Tracking (Socket.io)
13. Multi-Layer Security
14. Fraud Detection Engine
15. Admin Command Center
16. User Management & Verification
17. Notification & Email System
18. Analytics & Reporting
19. CSR Reporting
20. Additional App Screens
21. Database Schema (Firestore)
22. API Design (13 Modules)
23. Testing & QA
24. Deployment Infrastructure

---

## MANUAL DRAG ORDER (if AI doesn't rearrange correctly)

Use this as a reference to manually drag slides in Gamma's left panel:

| Final Position | Slide Title to Move There |
|---|---|
| 1 | FoodRescue: Smart Food Rescue & Distribution System (COVER) |
| 2 | What We'll Cover Today (TABLE OF CONTENTS) |
| 3 | The Problem We're Solving |
| 4 | Introducing FoodRescue |
| 5 | What We Set Out to Build |
| 6 | System Architecture |
| 7 | Technologies Used |
| 8 | 4 User Roles in the System |
| 9 | App Screens — Onboarding & Registration |
| 10 | Restaurant Registration — 5-Step Verification Wizard |
| 11 | NGO & Volunteer Registration Flows |
| 12 | Role-Based Dashboards |
| 13 | The Donation Lifecycle |
| 14 | Creating a Food Donation |
| 15 | Real-Time Tracking with Socket.io |
| 16 | Multi-Layer Security System |
| 17 | AI-Assisted Fraud Detection Engine |
| 18 | Admin Command Center |
| 19 | User Management & Verification Workflow |
| 20 | Notification & Email System |
| 21 | Analytics & Impact Reporting |
| 22 | CSR & Corporate Social Responsibility Reporting |
| 23 | Additional App Screens |
| 24 | Database Design — Firestore Collections |
| 25 | RESTful API Design — 13 Modules |
| 26 | Testing & Quality Assurance |
| 27 | Production Deployment Infrastructure |

---

## NOTE: Missing Slides from Original 30-Slide Prompt

If Gamma only generated 27 slides (instead of 30), the following 3 slides may be missing.
You can ask Gamma to add them after rearranging:

| Missing Slide | Content | Where to Insert |
|---|---|---|
| Challenges & Solutions | 3 challenge-solution cards (Privilege Escalation, Fraud, Real-Time Location) | After slide 24 (Deployment) |
| Impact & Future Roadmap | 4 counter cards + roadmap timeline | After Challenges slide |
| Thank You & Team Credits | Full team grid + project links + closing tagline | Last slide (slide 30) |

### Gamma prompt to ADD the missing 3 slides at the end:

Please add 3 new slides at the END of this presentation (after the Deployment Infrastructure slide):

SLIDE A — Key Challenges & How We Solved Them:
Show 3 challenge-solution cards:
1. Horizontal Privilege Escalation: NGOs bypassing Firestore rules -> Fixed with "allow update: if false" + all changes via Node.js API
2. Fraud at Scale: Fake accounts -> Fixed with FraudEngine IP velocity, document hash dedupe, behavioral scoring, auto-suspend at risk>=80
3. Real-Time Location Overload: GPS every second = 86,400 writes/day -> Fixed with Socket.io rooms, rate limit 30/min, Firestore write debounced every 10sec

SLIDE B — Impact & Future Vision:
4 large counter cards: 2,400+ KG Food Rescued | 85+ Restaurant Partners | 30+ NGO Partners | 120+ Active Volunteers
Future roadmap timeline: Phase 1 Web (live) -> Phase 2 Mobile App (Q3 2026) -> Phase 3 ML Prediction (Q4 2026) -> Phase 4 Smart Routing (2027) -> Phase 5 WhatsApp/UPI/Multi-city (2027+)

SLIDE C — Thank You & Team Credits:
Title: Thank You!
Tagline: "FoodRescue — Rescuing Food. Restoring Hope. One Delivery at a Time."
2x4 team grid: [Name 1-8] | [EN001-EN008]
GitHub: github.com/Xcoder-69/FoodRescue
Tech: Node.js | Firebase | Socket.io | Vercel | Render
Large leaf+bowl icon with green glow. Premium minimal closing.
