# Coffee Shop Customers App

## Project Overview

**"The Velvet Roast"** — a customer-facing web application for an artisan coffee shop. Customers can browse the menu, customize and order drinks, apply coupons, track their order status, submit feedback, and manage their account.

The project is a static frontend (vanilla HTML/CSS/JS) that is **prepared for** a Java Servlet + MySQL backend integration. The frontend communicates with the backend through a resilient API service layer (`apiService.js`), but the Java servlets themselves are **not yet included in this repository** (see [Current Status](#current-status--known-limitations)).

## Folder Structure & File Descriptions

```text
.
├── .settings/                  # Eclipse/IDE configuration files
├── build/                      # Compiled Java classes and build artifacts
├── src/                        # Source code directory
│   └── main/                   
│       ├── java/               # Java source code for backend (Servlets, Models, DAOs)
│       ├── lib/                # Library dependencies
│       │   └── mysql-connector-j-9.7.0.jar # MySQL JDBC driver for database connectivity
│       └── webapp/             # Web application root (Frontend & JSP/HTML files)
│           ├── index.html      # Main entry point of the web application
│           ├── README.md       # Frontend specific documentation
│           ├── assets/         # Static media assets (Images, icons, etc.)
│           │   ├── about_barista.jpg, about_interior.jpg, about_roasting.jpg # Images for the About page
│           │   └── coffee_shop_login_banner.jpg # Banner for the login page
│           ├── css/            # Stylesheets for the application
│           │   ├── main.css    # Global stylesheet
│           │   └── about.css, contact.css, feedback.css, location.css, menu.css, order.css # Page-specific styles
│           ├── js/             # JavaScript files for frontend logic
│           │   ├── app.js      # Global application logic
│           │   ├── auth/auth.js # Authentication logic (Login/Registration)
│           │   ├── data/products.js # Mock data or product definitions
│           │   ├── pages/      # Page-specific scripts (checkout, home, menu, order, etc.)
│           │   └── services/apiService.js # API communication service
│           ├── pages/          # HTML pages grouped by feature
│           │   ├── auth/       # Authentication pages (login, index)
│           │   ├── company/    # Company information pages (about, contact)
│           │   ├── customer/   # Customer-facing pages (feedback, location)
│           │   ├── main/       # Main navigation pages (home)
│           │   ├── menu/       # Menu display page
│           │   └── order/      # Ordering system pages (checkout, confirmation, order)
│           ├── META-INF/       # Application meta-information
│           │   └── MANIFEST.MF # Manifest file
│           └── WEB-INF/        # Secure web directory (Configuration & protected resources)
│               └── lib/        # Additional libraries
├── coffee_shope_system (1).sql # Database SQL dump for schema creation and seeding
├── .classpath                  # Eclipse classpath configuration
└── .project                    # Eclipse project configuration
```

## Tech Stack

| Component | Technology |
|---|---|
| Backend | Java 21, Jakarta Servlet 6.0 |
| Application Server | Apache Tomcat v10.1 |
| Database | MySQL / MariaDB (via `mysql-connector-j-9.7.0.jar`) |
| Frontend | Vanilla HTML, CSS, JavaScript (no framework) |
| Fonts | Google Fonts — Playfair Display, Outfit |
| IDE / Build | Eclipse WTP Dynamic Web Project (no Maven/Gradle) |
| Deploy / Context Root | `Custoners_website` |

## Features

### Authentication (`pages/auth/`, `js/app.js`)
- Login / signup tabs with time-adaptive greetings (Morning / Afternoon / Evening)
- Multi-step signup: details → 6-digit email verification → completion
- Password strength meter with live feedback (8+ chars, upper, lower, number, special char)
- Password reset flow and "remember me" (localStorage cookie)
- Session guard redirecting unauthenticated users

### Menu (`pages/menu/`, `js/pages/menu.js`)
- Category tabs, search, and interactive product detail modals
- Dietary indicators (vegetarian / vegan / dairy-free) and out-of-stock states
- Prices in ₹ (INR)

### Ordering (`pages/order/`, `js/pages/order.js`)
- Direct catalog ordering with add-to-cart
- Customizer modal: size (Regular / Large +₹30) and milk choice (Oat / Almond +₹40)
- Coupon codes validated against the backend offer service
- Cart with quantity controls, 5% tax, and discount rows
- Order history toggle view

### Checkout & Tracking (`pages/order/`, `js/pages/checkout.js`, `js/pages/confirmation.js`)
- Pre-fills customer name from session, phone validation regex
- 2-step live status tracker ("Placed" → "Brewing Completed"), polls the backend every 3s

### Feedback (`pages/customer/feedback.html`, `js/pages/feedback.js`)
- 5-star rating with descriptions, category chips, and anonymous posting (500-char limit)
- Rating distribution bar chart and review feed with filters

### Company Pages
- **About** — brand story, barista, roasting, and interior imagery
- **Contact** — contact form/details
- **Location** — outlet finder with map
- **Home** — featured drinks, location/hours cards

## Database

The database dump `coffee_shope_system (1).sql` creates the `coffee_shope_system` database with the following tables:

| Table | Purpose |
|---|---|
| `customers` | Customer accounts (name, phone, email, password) |
| `users` | Staff/admin login accounts (username, email, 4-char PIN, role) |
| `staff` | Employee details (salary, joining date, address) |
| `categories` | Menu categories |
| `menu_items` | Products (name, description, price, availability, image) |
| `inventory` | Stock tracking (quantity, minimum stock, supplier) |
| `offers` | Discount offers and coupon campaigns (active/inactive) |
| `cafe_tables` | Restaurant table management (available/occupied/reserved) |
| `orders` | Customer orders (status, subtotal, discount, total) |
| `order_details` | Line items per order (menu item, quantity, unit price) |
| `billing` | Billing and payments (payment method, payment status) |
| `feedback` | Customer feedback tied to orders |
| `reports` | Generated sales/order reports |

> **Note:** The SQL dump is **schema-only** — no seed data is inserted. You will need to add initial menu items, categories, and offers yourself.

## API Endpoints

Defined in `src/main/webapp/js/services/apiService.js`, the frontend expects the following servlet endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `MenuServlet` | GET | Fetch menu items (params: `category`, `search`) |
| `CategoryServlet` | GET | Fetch menu categories |
| `OfferServlet` | GET | Fetch active offers; coupon code validation |
| `FeedbackServlet` | GET / POST | Fetch feedback / submit feedback (rating, comment, name, category) |
| `OrderServlet` | GET / POST | Fetch order history / place an order (status, subtotal, discount, totalAmount) |

The API client probes candidate URLs (Tomcat `8080` context paths) and falls back gracefully when the backend is unavailable.

## Setup & Run Instructions

### Prerequisites
- **JDK 21**
- **Eclipse IDE** with WTP (Web Tools Platform)
- **Apache Tomcat v10.1** configured in Eclipse
- **MySQL** or **MariaDB** server
- A browser (Chrome / Firefox / Edge recommended)

### 1. Set Up the Database
1. Create the database schema by importing the dump:
   - `mysql -u root -p < "coffee_shope_system (1).sql"`
   - (or import via phpMyAdmin / MySQL Workbench)
2. Verify the `coffee_shope_system` database was created.

### 2. Import the Project into Eclipse
1. **File → Import → Existing Projects into Workspace**
2. Select this directory (`D:\CUSTOMER`) and click **Finish**.
3. The project name appears as `Custoners_website` (requires the Tomcat v10.1 runtime and JavaSE-21).

### 3. Deploy & Run
1. Right-click the project → **Run As → Run on Server** (choose Tomcat v10.1).
2. The app is served at `http://localhost:8080/Custoners_website/`.

### 4. Frontend-Only Run (no backend)
Open `src/main/webapp/pages/auth/index.html` directly in a browser to explore the UI flow. Data-driven features will fall back to empty states since the servlets are not running.

## Current Status / Known Limitations

- **Backend not in this repo:** `src/main/java` is empty. The Java servlets (`MenuServlet`, `CategoryServlet`, `OfferServlet`, `OrderServlet`, `FeedbackServlet`) referenced by the frontend are **not yet included** — the app currently runs fully client-side.
- **No build system:** No `pom.xml` / `build.xml` / `web.xml`. Building requires Eclipse WTP; the compiled output goes to `build/classes`.
- **No seed data:** The SQL dump contains only the schema (tables, PKs, FKs, constraints).
- **Notable TODOs in code:** `CartServlet` and `ReviewServlet` integrations in `order.js` and `feedback.js` are planned but not yet wired up.

## Deployment

The frontend has been deployed to **Vercel** (see git history, commit `f6eccdb`). The static pages are hosted with root `index.html` entry point. Note that Vercel static hosting does **not** run the Java servlets — backend integration requires the Tomcat deployment described above.

## Importance of Key Files

* **`src/main/webapp/index.html`**: The main landing page and entry point of the frontend web application.
* **`coffee_shope_system (1).sql`**: The database dump file. This is crucial for setting up the local MySQL database with the correct schema and initial data.
* **`src/main/lib/mysql-connector-j-9.7.0.jar`**: The MySQL JDBC driver. This allows the Java backend to communicate with the MySQL database.
* **`src/main/webapp/js/services/apiService.js`**: Manages the API calls from the frontend to the backend, acting as the bridge for data exchange.
* **`src/main/webapp/js/app.js`**: Core frontend script managing global events, state, and initialization logic.
* **`src/main/webapp/css/main.css`**: The central stylesheet that defines the baseline look and feel of the entire application.
* **`.project` & `.classpath`**: Essential files for importing the project into Eclipse or similar Java IDEs, defining how the project is built and structured.
