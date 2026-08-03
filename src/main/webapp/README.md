# Velvet Roast Coffee Shop

A premium, highly interactive customer authentication interface for **The Velvet Roast** artisan coffee shop. Built using high-fidelity dark coffee aesthetics, vanilla web standards, and rich transitions.

## 🌟 Key Features

*   **Cozy Dark Aesthetics**: Leverages modern typography (`Playfair Display` & `Outfit`), glassmorphic styling, and soft amber/espresso color tokens.
*   **Time-Adaptive Greetings**: Greeting headers change dynamically according to the customer's time of day (Morning, Afternoon, Evening).
*   **Multi-Step Authentication Flow**:
    *   **Login**: Clean username/password, remember me cookie support, and social login hooks.
    *   **Registration**: Full details registration, real-time password strength score charting, and optional fields.
    *   **Email Verification**: Simulated 6-digit verification code screen.
    *   **Completion Screen**: A premium success state checkmark card.
    *   **Password Reset**: Recover account credentials page redirecting back to login.
*   **Interactive Micro-Animations**: Glowing cursor clicks, floating aroma steam particles, button sweeping reflections, validation indicators, and form-shaking errors.
*   **Direct Catalog Ordering**: Quickly add any beverage or food directly to your cart without tedious size, milk, or extras prompts.
*   **Simplified Checkout**: Streamlined checkout flow with preconfigured location details and no manual pickup time selections required.
*   **2-Step Live Tracker**: Real-time progress tracker on order confirmation dynamically animates from "Placed" to "Brewing Completed" in 6 seconds.

## 📂 File Layout

```
CUSTOMER/
├── assets/                  - Theme and gallery images
│   ├── about_barista.jpg
│   ├── about_interior.jpg
│   ├── about_roasting.jpg
│   └── coffee_shop_login_banner.jpg
├── pages/
│   ├── auth/
│   │   ├── index.html       - Login/Signup portal
│   │   └── auth.html        - Password recovery / auxiliary auth
│   ├── main/home.html        - Main dashboard page
│   ├── menu/menu.html        - Product catalog
│   ├── order/
│   │   ├── order.html       - Cart and express ordering
│   │   ├── checkout.html    - Billing and payment
│   │   └── confirmation.html - Order progress and live status tracker
│   ├── company/
│   │   ├── about.html       - About Us
│   │   └── contact.html     - Contact Us
│   └── customer/
│       ├── feedback.html    - Feedback form
│       └── location.html    - Outlet finder map
├── css/
│   ├── main.css             - Core variables & layouts
│   ├── menu.css            - Menu catalog page styles
│   ├── order.css           - Order & checkout pages styles
│   ├── feedback.css        - Feedback page styling
│   ├── location.css        - Location finder page styling
│   ├── about.css           - About page styling
│   └── contact.css         - Contact page styling
├── js/
│   ├── app.js              - Main app logic
│   ├── auth/auth.js        - Session guard and path fixer utility
│   ├── pages/
│   │   ├── home.js         - Home/landing page logic
│   │   ├── menu.js         - Menu detail modal and catalog views
│   │   ├── order.js        - Cart, coupon and direct order logic
│   │   ├── checkout.js     - Checkout forms and processing
│   │   ├── confirmation.js - Simulated tracker updates
│   │   ├── feedback.js     - Feedback form verification
│   │   └── location.js     - Location map updates
│   └── data/products.js    - Product data structures
├── index.html               - Root landing page
└── README.md                - Documentation
```

## 🚀 Getting Started

1.  Open `pages/auth/index.html` in a browser to start the app
2.  Navigate through the user flow: Login → Home → Menu → Order → Checkout → Confirmation

## 📱 Pages Overview

| Page | Path | Description |
|------|------|-------------|
| Login/Signup | `pages/auth/index.html` | Authentication |
| Home | `pages/main/home.html` | Main dashboard |
| Menu | `pages/menu/menu.html` | Browse products |
| Order | `pages/order/order.html` | Current order |
| Checkout | `pages/order/checkout.html` | Payment |
| Confirmation | `pages/order/confirmation.html` | Order success |
| About | `pages/company/about.html` | About Us |
| Contact | `pages/company/contact.html` | Contact |
| Feedback | `pages/customer/feedback.html` | Leave feedback |
| Location | `pages/customer/location.html` | Find us |