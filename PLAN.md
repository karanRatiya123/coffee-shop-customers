# Page Organization Plan

## Current Structure

**HTML Pages (10):**
- `index.html` - Login/Signup (Authentication)
- `home.html` - Main dashboard/home
- `menu.html` - Online customer menu with search
- `order.html` - Order page
- `checkout.html` - Checkout page
- `confirmation.html` - Order confirmation
- `location.html` - Location with Google Map
- `feedback.html` - Feedback form
- `about.html` - About Us page
- `contact.html` - Contact/Creator Showcase

**CSS Files (7):**
- `styles.css` - Main/global styles
- `menu-styles.css`, `feedback.css`, `location.css`, `about.css`, `contact.css`, `order-styles.css`

**JS Files (10):**
- `app.js`, `home.js`, `auth.js`, `menu.js`, `order.js`, `checkout.js`, `confirmation.js`, `feedback.js`, `location.js`, `products.js`

---

## Recommended Organization

### 1. Create a `pages/` folder
Move all HTML pages into a organized subfolder structure:

```
pages/
├── auth/
│   └── index.html          (Login/Signup)
├── main/
│   └── home.html           (Main dashboard)
├── menu/
│   └── menu.html          (Product catalog)
├── order/
│   ├── order.html         (Current order)
│   ├── checkout.html     (Payment)
│   └── confirmation.html (Success)
├── company/
│   ├── about.html        (About Us)
│   └── contact.html     (Contact)
└── customer/
    ├── location.html     (Find us)
    └── feedback.html    (Leave feedback)
```

### 2. Create a `css/` folder
Move all CSS into one folder:
```
css/
├── main.css         (styles.css → main.css)
├── menu.css         (menu-styles.css → menu.css)
├── order.css        (order-styles.css → order.css)
├── feedback.css
├── location.css
├── about.css
└── contact.css
```

### 3. Create a `js/` folder
Group JavaScript files:
```
js/
├── auth/
│   └── auth.js
├── pages/
│   ├── home.js
│   ├── menu.js
│   ├── order.js
│   ├── checkout.js
│   ├── confirmation.js
│   ├── feedback.js
│   └── location.js
└── data/
    └── products.js
```

### 4. Update HTML references
Each HTML file needs updated paths, e.g.:
```html
<!-- Before -->
<link rel="stylesheet" href="styles.css">
<script src="app.js"></script>

<!-- After -->
<link rel="stylesheet" href="css/main.css">
<script src="js/auth/auth.js"></script>
```

---

## Implementation Steps

1. **Create folder structure** - `pages/`, `css/`, `js/`
2. **Move HTML files** into `pages/` subfolders
3. **Move CSS files** into `css/`
4. **Move JS files** into `js/` (group by function)
5. **Update all HTML references** to new paths
6. **Update all JS imports** if any relative paths exist

---

## Benefits

- **Scalable** - Easy to add new pages
- **Maintainable** - Related files grouped together
- **Clear navigation** - User flow is obvious from folder structure
- **Team-friendly** - Developers can find files quickly