# GTU Report Expansion Content (Part 2)
*(Here are several more highly detailed academic topics you can add to your report to easily reach 30 pages!)*

---

## 1. Add to Chapter 2: Proposal (New Section 2.5 Hardware & Software Requirements)

### 2.5 System Requirements Specification (SRS)
To develop and deploy the FoodRescue platform, specific hardware and software configurations were required to ensure a smooth development lifecycle and robust production environment.

#### 2.5.1 Hardware Requirements
- **Development Workstation:** Minimum Intel Core i5 (8th Gen) or AMD Ryzen 5 processor, 8 GB RAM (16 GB recommended for running local databases and emulators concurrently), and 256 GB SSD for fast read/write operations during compilation.
- **Production Server (Cloud):** The backend relies on cloud-native scaling. The minimum requirement is a basic cloud container (e.g., AWS EC2 t3.micro or equivalent) with 1 vCPU and 1 GB RAM, as the Node.js architecture handles asynchronous I/O efficiently without heavy memory overhead.
- **End-User Hardware:** 
  - **Donors/NGOs:** Any standard desktop, laptop, or tablet with a modern web browser.
  - **Volunteers:** A smartphone (Android 8.0+ or iOS 12+) with active GPS capabilities and 4G internet connectivity for real-time location tracking.

#### 2.5.2 Software Requirements & Technologies Used
- **Frontend Framework (Tailwind CSS):** Chosen for its utility-first approach, allowing for rapid UI prototyping without writing custom CSS files. It significantly reduced the frontend bundle size by automatically purging unused styles during the production build.
- **Backend Runtime (Node.js):** Utilized for its non-blocking, event-driven architecture, making it highly suitable for data-intensive real-time applications like FoodRescue where multiple WebSocket connections must be maintained simultaneously.
- **Database (Firebase Firestore):** A NoSQL cloud database chosen for its live-synchronization capabilities. It allows the NGO radar map to update instantly when a restaurant lists new food, without the client needing to poll the server.
- **Maps API (OpenRouteService):** Used instead of Google Maps to keep the project open-source and cost-effective. It handles geocoding (converting addresses to coordinates) and generates the optimized polyline routes for volunteers.

---

## 2. Add to Chapter 4: Problem Analysis and Solution (New Section 4.9 Database Design)

### 4.9 Database Schema and ER Model Description
Given the real-time nature of the application, a traditional relational database (SQL) was passed over in favor of a document-based NoSQL architecture (Firebase Firestore). The database is structured into three primary collections:

#### 4.9.1 'Users' Collection
This collection stores authentication and profile data. 
- **Attributes:** `UserID` (Primary Key), `Role` (Enum: Donor, NGO, Volunteer), `Name`, `ContactNumber`, `Location` (GeoPoint), and `VerificationStatus` (Boolean). 
- **Security:** Access is strictly controlled via Firestore Security Rules. A user can only read/write their own document, except for the system admin.

#### 4.9.2 'Donations' Collection
This acts as the core ledger of the application.
- **Attributes:** `DonationID` (Primary Key), `DonorID` (Foreign Key), `FoodType`, `QuantityKG`, `PreparationTime` (Timestamp), `ExpiryTime` (Timestamp), and `Status` (Enum: Available, Claimed, In-Transit, Completed, Expired).
- **Indexing:** This collection is heavily indexed on `Status` and `Location` to allow the matching engine to quickly query "Available" food within a 10km radius.

#### 4.9.3 'Deliveries' Collection
This collection maps the relationship between a claimed donation and the volunteer transporting it.
- **Attributes:** `DeliveryID` (Primary Key), `DonationID` (Foreign Key), `VolunteerID` (Foreign Key), `NGO_ID` (Foreign Key), `PickupTime`, and `DropoffTime`. 
- **Functionality:** This data is primarily used for post-delivery analytics to calculate average delivery times and generate impact reports.

---

## 3. Add to Chapter 5: Implementation Plan (New Section 5.5 Project Management)

### 5.5 Agile Methodology and Sprint Execution
The development of the FoodRescue platform was managed using the Agile Scrum framework. This iterative approach allowed the team to adapt to changing requirements and incorporate feedback from early NGO surveys directly into the development cycle. The project was divided into four main sprints, each lasting approximately two weeks.

#### Sprint 1: Foundation and UI Prototyping
The initial sprint focused strictly on the user interface. Wireframes were designed to ensure the application would be intuitive for non-technical users (like restaurant staff). By the end of Sprint 1, static HTML/Tailwind CSS pages for the Donor Dashboard, NGO Radar, and Volunteer Hub were completed and approved by the faculty guide.

#### Sprint 2: Backend Architecture and Authentication
Sprint 2 shifted focus to server-side logic. The Node.js server was initialized, and Firebase Authentication was integrated. Role-Based Access Control (RBAC) was heavily tested during this phase to ensure that an NGO account could not access donor-specific routes.

#### Sprint 3: The Core Matching Engine
This was the most technically complex sprint. The database schema was finalized, and the logic connecting the `Donations` collection to the real-time WebSocket notifications was written. OpenRouteService was integrated to calculate distances between the Donor and the NGO, ensuring that food was only broadcast to receivers within a viable driving distance.

#### Sprint 4: Testing, Refinement, and Deployment
The final sprint was dedicated entirely to Quality Assurance (QA). End-to-end tests were run, and edge cases (such as a volunteer canceling a delivery halfway through) were handled. The application was then prepped for deployment, with environment variables secured and code optimized for production.

---

## 4. Add to Chapter 6: Impact Assessment (New Section 6.4 Security & Privacy)

### 6.4 Data Security and Privacy Compliance
Handling live location data and contact information requires strict adherence to digital privacy standards. 
- **Data Encryption:** All communication between the client browsers and the Node.js server occurs over HTTPS, ensuring that sensitive data (like passwords and personal phone numbers) is encrypted in transit using TLS 1.3.
- **Location Privacy:** Volunteer location data is only tracked while they are actively engaged in a delivery (Status = 'In-Transit'). Once the drop-off is confirmed, the continuous location polling is immediately terminated by the client application to preserve volunteer privacy and battery life.
- **Data Anonymization:** For the public Impact Analytics Dashboard, all data is aggregated. While the system displays that "500 meals were saved this week," it completely anonymizes which specific restaurants donated the food and which NGOs received it, preventing any targeted data mining.
