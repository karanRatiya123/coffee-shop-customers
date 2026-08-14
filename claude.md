# Complete Technical & System Architecture Documentation: `D:\CUSTOMER`

## 1. Executive Summary

This document provides a comprehensive overview of the architecture, file layout, backend implementation, and frontend integration for the **`CUSTOMER`** project (`D:\CUSTOMER`).

Per system specifications:
- **Backend**: Contains **ONLY the AI Backend (`AIServlet.java`)**. All non-AI backend endpoints/servlets/DAOs have been removed to isolate the AI proxy service.
- **Unused Components Removed**: Removed all unused TSX/React component files (`components/ui/*`) and redundant standalone demo pages (`ai-ui.html`).
- **Static Items & Featured Sections Removed**: Removed all static/mock fallback order and catalog items from `apiService.js` and hidden empty featured sections on the home/order pages.
- **AI Floating Chat Popup UI**: Built purely using **Vanilla HTML, CSS, and JavaScript** (`ai-ui.js` & `main.css`). No React or external frameworks are used.

---

## 2. Directory Structure & File Map

```
D:\CUSTOMER
├── claude.md                                   <-- System documentation (this file)
└── src
    └── main
        ├── java
        │   ├── config.properties               <-- System configuration & API keys (Gemini API key)
        │   └── com
        │       └── velvetroast
        │           └── servlet
        │               └── AIServlet.java      <-- Pure @WebServlet AI Backend Controller
        └── webapp
            ├── index.html                      <-- Customer portal landing & AI Widget UI container
            ├── css
            │   ├── main.css                    <-- Core styling, glassmorphism tokens & AI popup CSS
            │   ├── menu.css                    <-- Styling for product catalog
            │   ├── order.css                   <-- Styling for checkout & order history
            │   └── feedback.css                <-- Styling for guest reviews
            ├── js
            │   ├── app.js                      <-- App state & modal handlers
            │   ├── ai-ui.js                    <-- Vanilla JS AI Floating Popup Widget engine
            │   ├── services
            │   │   └── apiService.js           <-- Frontend API Client (empty fallbacks)
            │   ├── auth
            │   │   └── auth.js                 <-- Auth state & session helper
            │   ├── data
            │   │   └── products.js             <-- Client catalog data
            │   └── pages
            │       ├── menu.js                 <-- Menu catalog controller
            │       ├── order.js                <-- Cart & online ordering controller
            │       ├── home.js                 <-- Home page controller
            │       └── feedback.js             <-- Feedback form & review feed controller
            ├── pages
            │   ├── menu/menu.html              <-- Menu Page
            │   ├── order/order.html            <-- Online Order Page
            │   ├── customer/feedback.html      <-- Feedback Page
            │   ├── about.html                  <-- About Page
            │   ├── location.html               <-- Location Page
            │   └── contact.html                <-- Contact Page
            └── WEB-INF
                ├── web.xml                     <-- Clean annotation-driven deployment descriptor
                └── classes
                    └── com/velvetroast/servlet/
                        └── AIServlet.class     <-- Compiled AI Servlet byte-code
```

---

## 3. Component Details

### 3.1. Backend Architecture (`AIServlet.java`)
- **Location**: `src/main/java/com/velvetroast/servlet/AIServlet.java`
- **Mapping**: `@WebServlet(name = "AIServlet", urlPatterns = {"/AIServlet", "/api/chat"})`
- **Functionality**:
  - Securely reads Gemini API Key from `config.properties` or environment variables.
  - Handles POST requests containing prompt payloads `{ "prompt": "..." }`.
  - Proxies requests to Google Gemini REST API using `java.net.http.HttpClient`.
  - Formats responses as standard JSON `{ "reply": "..." }` or `{ "error": "..." }`.

---

### 3.2. Frontend AI Popup Widget (`HTML`, `CSS`, `js/ai-ui.js`)
- **Language**: Pure HTML, CSS, and Vanilla JavaScript (Zero framework dependencies).
- **Features**:
  - Floating Particle Button launcher with smooth glow effects.
  - Frosted glassmorphism chat popup window with dynamic message history.
  - Typing indicator dots animation.
  - Quick-select prompt suggestion chips.
  - Fully responsive for mobile and desktop screens.

---

## 4. Key Files & Locations

1. **AI Servlet Controller**: [AIServlet.java](file:///D:/CUSTOMER/src/main/java/com/velvetroast/servlet/AIServlet.java)
2. **API Configuration**: [config.properties](file:///D:/CUSTOMER/src/main/java/config.properties)
3. **AI Widget UI Logic (Vanilla JS)**: [ai-ui.js](file:///D:/CUSTOMER/src/main/webapp/js/ai-ui.js)
4. **AI Widget CSS Styles**: [main.css](file:///D:/CUSTOMER/src/main/webapp/css/main.css)
5. **Deployment Descriptor**: [web.xml](file:///D:/CUSTOMER/src/main/webapp/WEB-INF/web.xml)
