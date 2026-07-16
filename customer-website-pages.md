# BrewOS Customer Website - Page Structure

> Customer-facing website that connects to the existing Employee POS System

---

## 📱 First Page (Landing)

### 1. Home Page (`index.html`)

- **Purpose**: Landing page to attract customers
- **Content**:
  - Hero section with coffee image
  - Shop name & tagline
  - "Order Now" CTA button → leads to Online Order page
  - Featured drinks section
  - Location & hours preview
  - Quick links to Menu, About, Contact
- **Navigation Flow**:
  ```
  Home → Online Order (main action)
  Home → Menu → Product Detail
  Home → About Us
  Home → Contact / Location
  ```

---



## 📄 All Website Pages



### 2. Menu Page (`menu.html`)

- **Purpose**: Browse full drink & food menu
- **Content**:
  - Category tabs (Coffee, Tea, Cold Drinks, Food, Desserts)
  - Product grid with images, names, prices
  - Filter by: Veg, Vegan, Dairy-Free
  - Click product → opens Product Detail modal
- **Navigation Flow**:
  ```
  Menu → Product Detail (modal) → Add to Cart
  Menu → Search → Filtered Results
  ```



### 3. Online Order Page (`order.html`)

- **Purpose**: Main ordering flow for customers
- **Content**:
  - Full menu with "Add" buttons
  - Live cart sidebar (shows items, quantities, total)
  - Customizations (size, milk type, extras)
  - Apply coupon code
  - Select pickup time
  - Checkout button
- **Navigation Flow**:
  ```
  Online Order → Add Items to Cart
  Online Order → Cart Sidebar → Checkout
  Checkout → Order Confirmation
  ```



### 4. Checkout Page (`checkout.html`)

- **Purpose**: Complete the order
- **Content**:
  - Cart summary (items, quantities, prices)
  - Customizations summary
  - Customer name & phone input
  - Pickup time selection
  - Payment method (Cash, Card, UPI)
  - Place Order button
- **Navigation Flow**:
  ```
  Checkout → Order Placed → Order Confirmation
  Checkout → Edit Order (back to cart)
  ```



### 5. Order Confirmation (`confirmation.html`)

- **Purpose**: Show order success details
- **Content**:
  - Order number (generated)
  - Order details summary
  - Estimated pickup time
  - "Track Order" button
  - "Leave Feedback" button
- **Navigation Flow**:
  ```
  Confirmation → Track Order
  Confirmation → Leave Feedback
  Confirmation → Home
  ```



### 7. About Us Page (`about.html`)

- **Purpose**: Share shop story
- **Content**:
  - Shop history & story
  - Our team / baristas
  - Values (quality, sustainability)
  - Photos gallery
- **Navigation Flow**:
  ```
  About → Home
  About → Menu
  ```



### 9. Contact Page (`contact.html`)

- **Purpose**: General inquiries
- **Content**:
  - Contact form (name, email, message)
  - Phone number
  - Social media links
- **Navigation Flow**:
  ```
  Contact → Submit Form → Success Message
  Contact → Social Media Links
  ```



### 10. Feedback Page (`feedback.html`)

- **Purpose**: Customer reviews (reuses employee feedback system)
- **Content**:
  - Star rating (1-5)
  - Category selection (Food, Service, Ambiance)
  - Comment box
  - Submit button
  - Recent reviews display
- **Navigation Flow**:
  ```
  Feedback → Submit Review → Success
  Feedback → View Recent Reviews
  ```

---



## 🔀 Page Navigation Diagram

```
                        ┌──────────────┐
                        │    Home      │ ◄── First Page
                        │  (index)     │
                        └──────┬───────┘
                               │
         ┌─────────┬───────────┼───────────┬─────────┐
         │         │           │           │         │
         ▼         ▼           ▼           ▼         ▼
    ┌─────────┐┌────────┐┌──────────┐┌─────────┐┌─────────┐
    │  Menu   ││ Online ││  About   ││Location ││ Contact│
    │         ││ Order  ││    Us    ││         ││         │
    └────┬────┘└───┬────┘└──────────┘└─────────┘└─────────┘
         │         │
         ▼         ▼
   ┌──────────┐┌────────────┐
   │ Product ││  Checkout  │
   │ Detail  ││            │
   └────┬─────┘└─────┬─────┘
        │            │
        │            ▼
        │     ┌──────────────┐
        │     │Confirmation │
        │     └──────┬───────┘
        │            │
        ▼            ▼
   ┌─────────┐┌────────────┐
   │  Cart  ││ Track Order│
   └────┬────┘└────────────┘
        │
        ▼
   ┌──────────┐
   │Checkout │
   └──────────┘
```

---



## 🔗 Integration with Employee POS


| Customer Page           | Connects To | Employee Sees                  |
| ----------------------- | ----------- | ------------------------------ |
| Online Order → Checkout | →           | New order appears in Dashboard |
| Track Order             | →           | Employee updates status        |
| Feedback                | →           | Shows in Employee Feedback tab |
| Loyalty                 | →           | Staff redeems in POS           |


---



## 📋 Page Priority Order


| Priority | Page         | Reason            |
| -------- | ------------ | ----------------- |
| 1️⃣      | Home         | First impression  |
| 2️⃣      | Menu         | Core content      |
| 3️⃣      | Online Order | Revenue driver    |
| 4️⃣      | Checkout     | Complete ordering |
| 5️⃣      | Confirmation | Order closure     |
| 6️⃣      |              |                   |
| 7️⃣      | About Us     | Trust building    |
| 8️⃣      | Location     | Convenience       |
|          |              |                   |
|          |              |                   |
|          |              |                   |
|          |              |                   |


---

*Last Updated: 2026-07-16*