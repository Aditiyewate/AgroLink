# AgroLink: Smart Agriculture Marketplace & Logistics Platform

AgroLink is a premium, state-of-the-art Web Application designed to bridge the gap between Farmers, Buyers, and Cold Storage Operators. The platform streamlines agricultural trade, provides real-time logistics (cold storage slot leasing), integrates APMC Mandi rates, and offers interactive dispute resolution and multi-language support.

---

## 🚀 Key Modules & Capabilities

1. **Farmer Module**: 
   * List and manage crops (variety, volume in quintals, price per quintal, location).
   * Approve/reject incoming orders with automated stock updates.
   * Search and book cold storage slot leases.
   * Dynamic earnings ledger logs and analytical statistics.
2. **Buyer Module**:
   * Browse a live crop marketplace with dynamic search filters (variety, location).
   * Manage an interactive shopping cart.
   * Simulated secure Razorpay payment gateway checkout.
   * Real-time shipment milestone and order tracking.
3. **Cold Storage Module**:
   * Facility configuration dashboard (capacity, pricing per ton/day, name, description).
   * Booking reservation approval queues with mandatory rejection reasons.
   * Real-time circular gauge metrics indicating active capacity usage.
4. **Admin Module**:
   * Global platform summary metrics and statistics.
   * Registered user account control (block/unblock user toggle).
   * Catalog moderator tools (delete listed crop items).
   * Dispute Resolution Desk to review and resolve user grievances.
   * APMC Mandi price desk to configure live crop rates.
5. **Real-time Live Ticker & Weather widgets**:
   * Ticker cycling dynamic APMC crop rates with manual refresh action.
   * Live local meteorological measurements (humidity, temperature, rain chance).
6. **Multi-language Support**:
   * Local context dictionary translations (English, Hindi, Marathi) programmatically synchronized with an integrated Google Translate header widget for site-wide translation.
7. **Real-time Alerts (WebSockets)**:
   * Target-delivered notifications sent directly to corresponding users (e.g., order confirmations, storage booking status, user registration, dispute status).

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Vanilla CSS, Tailwind CSS (for dashboard styling), Lucide Icons.
* **Backend**: Spring Boot 3.x, Spring Security (JWT Token authentication), Spring WebSocket.
* **Database**: MySQL 8.x, Spring Data JPA (Hibernate).
* **Payment Gateway**: Razorpay (Java SDK & Web Checkout Integration).

---

## 📂 Project Directory Structure & File Explanation

```
AgroLink/
├── backend/                              # Spring Boot REST API
│   ├── src/main/java/com/rtech/agrolink/
│   │   ├── config/                       # Security & Communication configurations
│   │   │   ├── SecurityConfig.java       # JWT Filters, role-based path permissions, password encoders
│   │   │   ├── CorsConfig.java           # Cross-Origin Resource Sharing (CORS) policy mapping
│   │   │   └── WebSocketConfig.java      # Real-time WebSocket endpoint registers and broker relays
│   │   ├── controller/                   # REST API Endpoints (receives HTTP requests)
│   │   │   ├── AuthController.java       # User signup, login, JWT token dispatching
│   │   │   ├── ProductController.java    # Crop crop listings, inventory updates
│   │   │   ├── OrderController.java      # Shopping checkout, state transitions, Razorpay verifications
│   │   │   ├── ColdStorageController.java# Facility registers, slot lease requests, metrics
│   │   │   ├── ComplaintController.java  # Disputes creation and administrative resolution
│   │   │   ├── MandiController.java      # Live APMC Mandi price configurations
│   │   │   └── WeatherController.java     # Local meteorological forecasts
│   │   ├── dto/                          # Data Transfer Objects (removes entity exposure)
│   │   ├── entity/                       # JPA Database Entities (mapped to MySQL tables)
│   │   ├── repository/                   # Spring Data JPA repositories (DB Query logic)
│   │   ├── service/                      # Core business services containing logic
│   │   │   └── RazorpayService.java      # Creates transaction orders using Razorpay SDK
│   │   └── AgroLinkApplication.java      # Main entry point bootstrapping Spring Boot
│   │   
│   ├── src/main/resources/
│   │   └── application.properties        # Database connections, server ports, JWT keys, and Razorpay API credentials
│   └── pom.xml                           # Maven dependencies (Spring, Security, MySQL Connector, Razorpay SDK)
│
├── frontend/                             # React Client Application
│   ├── public/                           # Static assets, fallback profile photos, banners
│   ├── src/
│   │   ├── components/                   # Reusable UI widgets
│   │   ├── context/                      # State providers (Auth, Language contexts)
│   │   ├── pages/                        # Main page views (Dashboards, Schemes, Cart)
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx             # Client router with private route guards
│   │   ├── services/
│   │   │   └── api.js                    # Axios central instance calling http://localhost:8080
│   │   ├── App.jsx                       # Main App wrapper binding routing and context
│   │   ├── main.jsx                      # DOM bootstrapper for React
│   │   └── index.css                     # Global stylesheets, custom scrollbars, styling
│   ├── package.json                      # npm project build scripts and packages list
│   └── tailwind.config.js                # Design framework themes
│
├── database/                             # Database SQL initializers
│   ├── schema.sql                        # Table constraints, columns, indices setup
│   └── data.sql                          # Essential seed data (mock users, products, mandi rates)
│

---

## 🗄️ Database Setup & Seeding

AgroLink relies on two database scripts in the `database/` directory:
1. **`schema.sql`**: Generates the complete database structure. It creates the 10 relational tables (`users`, `farmers`, `buyers`, `products`, `orders`, `cold_storage`, `storage_bookings`, `complaints`, `mandi_prices`, and `weather`) along with fields, foreign key constraints, and performance indexes.
2. **`data.sql`**: **This file is required to operate the application.** It seeds the database with mock accounts, crop products, mandi prices, weather stations, and cold storage locations. Without this seed data, the application database would be completely empty, meaning you would not be able to log in with evaluated profiles, see mock products, or verify features out-of-the-box.

---

## 💳 Razorpay Payments: Test Mode vs. Live Mode

The application integrates Razorpay's secure checkout. It is configured to run in **Test Mode** (Sandbox) rather than **Live Mode**. 

### Why we use Test Mode (Sandbox):
* **No Financial Liability:** Test Mode allows us to verify transaction lifecycles, test credit cards, and simulate payment success/failure hooks without charging actual money to real bank accounts.
* **No Compliance Barriers:** Running in Live Mode requires a registered business, verified banking accounts, GSTIN registration, and an approved Razorpay KYC process. Local development, university projects, and demos do not qualify for live merchant accounts.
* **Sandbox Verification:** We can test the platform using mock card credentials (provided in the payment popup) to check whether orders translate to `APPROVED` in the database once the mock payment resolves.

---

## ⚙️ Exhaustive Step-by-Step Installation Guide

Follow these instructions to set up the software environment, start the services, and launch the platform manually.

---

### Step 1: Install and Configure Prerequisites (Environment Path Setup)

You must ensure that **Java JDK (17 or higher)**, **Apache Maven**, **MySQL Server**, and **Node.js (v18+)** are installed on your machine and mapped to your system environment variables.

#### 1. How to add directories to system Environment Variables on Windows:
If any command line check (e.g. `java`, `mvn`, `mysql`, `node`) is not recognized, you must add it to the system `Path`:
1. Press the **Windows Key + R**, type `sysdm.cpl`, and press **Enter** (or search for "Edit the system environment variables" in the Windows Search Bar).
2. Go to the **Advanced** tab and click on the **Environment Variables** button at the bottom.
3. Under the **System Variables** list, find the variable named **Path**, select it, and click **Edit**.
4. Click **New** on the right side, and type/paste the absolute path to the `bin` directory of your tool (see folder defaults below).
5. Click **OK** to close each of the windows and apply the changes.
6. **Important:** Open a fresh Command Prompt window for the path updates to take effect.

#### 2. Configure Java JDK:
* **Download:** Download Java JDK 17 or higher (such as Eclipse Temurin from [Adoptium](https://adoptium.net/) or Oracle JDK).
* **PATH Entry:** Typically installed at `C:\Program Files\Java\jdk-17` or similar. Add its `bin` folder to the Path:
  `C:\Program Files\Java\jdk-17\bin`
* **JAVA_HOME Entry:** In Environment Variables, click **New** under System Variables. Set variable name to `JAVA_HOME` and value to `C:\Program Files\Java\jdk-17` (without `bin`).
* **Verification:** Open Command Prompt and type:
  ```cmd
  java -version
  ```

#### 3. Configure Apache Maven:
* **Download:** Download the binary zip file from [Maven's Website](https://maven.apache.org/download.cgi) and extract it (e.g. to `C:\maven`).
* **PATH Entry:** Add the `bin` directory to your environment Path:
  `C:\maven\bin` (or your custom extracted folder path).
* **M2_HOME Entry:** Click **New** under System Variables. Set variable name to `M2_HOME` and value to `C:\maven`.
* **Verification:** Open Command Prompt and type:
  ```cmd
  mvn -version
  ```

#### 4. Configure Node.js & NPM:
* **Download:** Download the LTS installer from [Node.js Website](https://nodejs.org/).
* **PATH Entry:** The installer automatically configures Node. Node is usually located at:
  `C:\Program Files\nodejs`
  Ensure this path is listed in your environment Path variable.
* **Verification:** Open Command Prompt and type:
  ```cmd
  node -version
  npm -version
  ```

---

### Step 2: Start and Setup the MySQL Database Server

You must start the MySQL Database Server and load the database structure and test records.

#### 1. How to start the MySQL Service on Windows:
* **Method A (GUI):**
  1. Press **Windows Key + R**, type `services.msc`, and press **Enter**.
  2. Scroll down to locate the service named **MySQL** or **MySQL80**.
  3. Right-click the service and click **Start** (or click **Restart** if it is already running but unresponsive).
* **Method B (Command Prompt):**
  1. Open a Command Prompt as **Administrator** (search for cmd, right-click, select Run as Administrator).
  2. Execute the start command:
     ```cmd
     net start MySQL80
     ```
     *(Note: replace MySQL80 with your custom service name if different, such as MySQL).*

#### 2. Configure MySQL Environment Path:
To run database commands in your terminal, add the MySQL installation directory to your Path variable:
* **Default Directory:** `C:\Program Files\MySQL\MySQL Server 8.0\bin`

#### 3. Create the Database:
1. Open Command Prompt and log into your MySQL monitor (replace `root` with your username if different):
   ```cmd
   mysql -u root -p
   ```
2. Enter your MySQL password when prompted.
3. Once logged in, execute the database creation query:
   ```sql
   CREATE DATABASE agrolink_db;
   ```
4. Type `exit` and press Enter to log out of the MySQL monitor.

#### 4. Import the Database Schema & Seed Data:
Run these commands from the root of the extracted `AgroLink` folder to construct tables and load mock accounts:
1. **Import the Table Schema:**
   ```cmd
   mysql -u root -p agrolink_db < database\schema.sql
   ```
2. **Import the Seed Records:**
   ```cmd
   mysql -u root -p agrolink_db < database\data.sql
   ```
   *Enter your MySQL password for each command.*

---

### Step 3: Configure and Start the Java Backend

1. Navigate to the database configuration properties file:
   [application.properties](file:///d:/AgroLink/backend/src/main/resources/application.properties)
2. Locate the database properties block and verify/update your local MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/agrolink_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=YOUR_LOCAL_MYSQL_PASSWORD
   ```
3. Open a Command Prompt in the `backend` folder:
   ```cmd
   cd backend
   ```
4. Clean and compile the Maven project:
   ```cmd
   mvn clean compile
   ```
5. Launch the Spring Boot application:
   ```cmd
   mvn spring-boot:run
   ```
   *The backend server will launch and run at `http://localhost:8080`.*

---

### Step 4: Install and Start the React Frontend

1. Open a new Command Prompt window and navigate to the `frontend` folder:
   ```cmd
   cd frontend
   ```
2. Install the Node package dependencies:
   ```cmd
   npm install
   ```
3. Boot up the Vite local development server:
   ```cmd
   npm run dev
   ```
4. Open your web browser and navigate to the application address:
   `http://localhost:5173`

---

## 🔑 Default Evaluation Credentials

All accounts are seeded via `data.sql` and use the password **`password123`** (BCrypt encrypted):

| Account Role | Username / Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@agrolink.com` | `password123` | Listing crops, looking up cold storage slots, viewing earnings ledger |
| **Buyer** | `buyer@agrolink.com` | `password123` | Browsing listings, buying crops, processing mock Razorpay checkout |
| **Cold Storage Manager** | `storage@agrolink.com` | `password123` | Managing warehouse slot approvals, setting pricing, looking up storage statistics |
| **Administrator** | `admin@agrolink.com` | `password123` | Moderating platform catalog, blocking/unblocking users, resolving disputes, updating APMC prices |

---

*Developed by R Tech Solutions.*
