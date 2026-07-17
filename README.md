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

## 📂 File Layout

```
CUSTOMER/
├── pages/
│   ├── auth/index.html       - Login/Signup page
│   ├── main/home.html        - Main dashboard
│   ├── menu/menu.html        - Product catalog
│   ├── order/
│   │   ├── order.html       - Current order
│   │   ├── checkout.html    - Payment
│   │   └── confirmation.html - Order success
│   ├── company/
│   │   ├── about.html       - About Us
│   │   └── contact.html     - Contact
│   └── customer/
│       ├── feedback.html    - Leave feedback
│       └── location.html    - Find us
├── css/
│   ├── main.css             - Global styles
│   ├── menu.css            - Menu page styles
│   ├── order.css           - Order pages styles
│   ├── feedback.css        - Feedback page styles
│   ├── location.css        - Location page styles
│   ├── about.css           - About page styles
│   └── contact.css         - Contact page styles
├── js/
│   ├── app.js              - Main app logic
│   ├── auth/auth.js        - Authentication
│   ├── pages/
│   │   ├── home.js         - Home page
│   │   ├── menu.js         - Menu page
│   │   ├── order.js        - Order page
│   │   ├── checkout.js     - Checkout page
│   │   ├── confirmation.js - Confirmation page
│   │   ├── feedback.js     - Feedback page
│   │   └── location.js     - Location page
│   └── data/products.js    - Product data
└── README.md
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