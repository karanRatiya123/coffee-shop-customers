# Coffee Shop Customers App

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

## Importance of Key Files

* **`src/main/webapp/index.html`**: The main landing page and entry point of the frontend web application.
* **`coffee_shope_system (1).sql`**: The database dump file. This is crucial for setting up the local MySQL database with the correct schema and initial data.
* **`src/main/lib/mysql-connector-j-9.7.0.jar`**: The MySQL JDBC driver. This allows the Java backend to communicate with the MySQL database.
* **`src/main/webapp/js/services/apiService.js`**: Manages the API calls from the frontend to the backend, acting as the bridge for data exchange.
* **`src/main/webapp/js/app.js`**: Core frontend script managing global events, state, and initialization logic.
* **`src/main/webapp/css/main.css`**: The central stylesheet that defines the baseline look and feel of the entire application.
* **`.project` & `.classpath`**: Essential files for importing the project into Eclipse or similar Java IDEs, defining how the project is built and structured.
