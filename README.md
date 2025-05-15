# EstateHub

🔗 [Live Demo](https://your-deployed-site.com)

**EstateHub** is a modern web-based platform designed to streamline real estate listings, search, and user communication between buyers, agents, and administrators. The system provides a fully functional listing engine with support for subscriptions, notifications (email & Telegram), user management, and an admin interface.

---

## Features

* **Authentication & Roles**

  * Supports role-based access: `User`, `Makler` (Agent), and `Admin`
  * Secure registration, login, verification, and password reset using JWT and email codes

* **Real Estate Listings**

  * CRUD operations on property listings with images, location, pricing, type, area, and status
  * Tagging and categorization system
  * Agent vs. private owner listings

* **Favorites**

  * Users can add or remove favorite listings
  * Uniqueness enforced (one user can favorite a listing once)

* **Subscriptions & Filters**

  * Users can create filtered subscriptions (by category, location, price, area, etc.)
  * Each subscription can use email or Telegram as a transport

* **Notifications**

  * Automatic notification delivery when listings match user subscriptions
  * Notification tracking by status: SENT, DELIVERED, FAILED

* **Admin Panel**

  * Administrative interface for managing users, listings, categories, tags, subscriptions, and notifications
  * Data table interface with editing capabilities

* **Telegram Bot Integration**

  * Telegram linking via chat ID and username
  * Direct message sending using `node-telegram-bot-api`

* **Email Integration**

  * Email notifications via Mailjet
  * Verification and password reset flow via email codes

* **Map Integration**

  * Frontend includes Leaflet/OpenStreetMap component for property location display

---

## Technologies Used

### Backend

* **Runtime**: Node.js with TypeScript
* **Framework**: Fastify
* **Database**: PostgreSQL (via Prisma ORM)
* **Messaging**: Mailjet, Telegram Bot
* **Security**: JWT, bcrypt
* **Task Scheduling**: node-cron for cleaning expired codes

### Frontend

* **Framework**: Vue 3 with Composition API
* **UI Kit**: Naive UI
* **Styling**: SCSS (modular)
* **Routing**: Vue Router
* **State Management**: Pinia
* **Build Tool**: Vite

---

## Project Structure

```plaintext
backend/
  ├─ prisma/
  ├─ src/
      ├─ controllers/
      ├─ services/
      ├─ schemas/
      ├─ routes/
      ├─ middleware/
      ├─ utils/
      └─ index.ts

frontend/
  ├─ src/
      ├─ components/
      ├─ views/
      ├─ services/
      ├─ stores/
      ├─ router/
      ├─ types/
      ├─ styles/
      └─ main.ts

  ├─ public/
  ├─ index.html
  └─ vite.config.ts
```

---

## Getting Started

### Prerequisites

* Node.js ≥ 18.x
* PostgreSQL ≥ 14
* Telegram Bot API token
* Mailjet API credentials

### Backend Setup

```bash
cd backend
npm install
cp .env
npx prisma migrate dev --name init
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env
npm run dev
```

### Environment Variables (Backend)

Create a `.env` file inside the `backend/` folder with the following values:

```env
APP_URL=https://yourdomain.com
BASE_URL=https://example.onrender.com
DATABASE_URL=postgresql://user:password@localhost:5432/estatehub
JWT_SECRET=your_jwt_secret
MAILJET_API_KEY=your_mailjet_key
MAILJET_API_SECRET=your_mailjet_secret
TELEGRAM_BOT_TOKEN=your_telegram_token
```

Create a `.env` file inside the `frontend/` folder as well:

```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

---

## API Overview

The backend exposes a RESTful API:

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/verify`
* `GET /listings`, `POST`, `PUT`, `DELETE`
* `GET /users`, `PUT`, `DELETE`
* `GET /favorites`, `POST`, `DELETE`
* `GET /subscriptions`, `POST`, `DELETE`
* `GET /notifications`, `POST`, `PUT`, `DELETE`
* `GET /tags`, `POST`, `PUT`, `DELETE`
* `GET /categories`, `POST`, `PUT`, `DELETE`
* `GET /admin/*` endpoints for administrative control

---

## Admin Interface

* Accessible via `/admin` (frontend)
* Includes:

  * Listings Panel
  * Users Panel
  * Categories and Tags
  * Subscriptions & Notifications Management

---

## Deployment

* **Backend**:

  * Built with (`npm run build`)
  * Run migrations with Prisma CLI
  * Deploy via Render or Heroku
* **Frontend**:

  * Built with Vite (`npm run build`)
  * Deploy via Vercel or Netlify

---

## License

This project is licensed under the **MIT License**.
See the `LICENSE` file for full details.
