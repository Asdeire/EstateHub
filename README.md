# Real Estate Platform

Welcome to the Real Estate Platform! This project is designed to connect real estate agents, property owners, and potential buyers by offering a user-friendly platform for listing, browsing, and managing property advertisements.

## 🌟 Features

### For Users
- **Registration & Authentication**: Secure login and signup using JWT authentication.
- **Property Listings**: Browse through property listings with filtering and sorting options.
- **Favorites**: Save interesting properties to your favorites.
- **Subscriptions**: Subscribe to new property notifications based on your criteria.
- **Interactive Maps**: View property locations using Google Maps or Leaflet integrations.

### For Agents
- **Manage Listings**: Create, edit, and delete property listings.
- **Profile Management**: Update personal details and manage contact information.

### Admin Panel
- **User Management**: Admins can manage users, agents, and their roles.
- **Content Moderation**: Ensure listings comply with platform rules.

## 🏗️ Tech Stack

### Backend
- **Programming Language**: TypeScript (Node.js)
- **Framework**: Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT / OAuth 2.0

### Frontend
- **Framework**: Vue.js 3
- **Styling**: SCSS, responsive design
- **State Management**: Pinia
- **Routing**: Vue Router

### Integrations
- **Maps**: OpenStreetMap (Leaflet)
- **Notifications**: Email and Telegram bot for subscription updates

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
- Node.js (v18+)
- PostgreSQL (v14+)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/real-estate-platform.git
   cd real-estate-platform/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file and add the following:
   ```plaintext
   DATABASE_URL=postgresql://username:password@localhost:5432/realestate
   JWT_SECRET=your_jwt_secret
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## 🧪 Testing

To run tests for the backend:
```bash
npm run test
```

## 📦 Deployment

For production builds, follow these steps:

### Backend
```bash
npm run build
npm run start
```

### Frontend
```bash
npm run build
```
The built files will be in the `dist` folder, ready for deployment.

