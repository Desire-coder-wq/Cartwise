# Grocery Buddy - Rebuilt Application

A modern grocery shopping list application built with Vue.js + Vite frontend and Express + PostgreSQL backend.

## Features

- ✅ User registration and authentication
- ✅ Shopping list management (add, edit, delete, toggle)
- ✅ Item categories (Produce, Dairy, Meat, Bakery, Frozen, Beverages, Snacks, Other)
- ✅ Price tracking
- ✅ Shopping history
- ✅ Profile management
- ✅ Responsive design
- ✅ Swagger API documentation

## Tech Stack

### Frontend
- Vue.js 3
- Vite
- Vue Router
- Pinia (State Management)
- Axios

### Backend
- Node.js
- Express.js
- PostgreSQL (Neon Database)
- bcryptjs (Password hashing)
- express-session (Session management)
- Multer (File uploads)
- Swagger (API documentation)

## Project Structure

```
grocery-buddy-new/
├── frontend/                 # Vue.js + Vite frontend
│   ├── src/
│   │   ├── components/      # Vue components
│   │   ├── views/           # Page components
│   │   ├── router/          # Vue Router configuration
│   │   ├── stores/          # Pinia stores
│   │   ├── App.vue          # Root component
│   │   └── main.js          # Entry point
│   ├── Dockerfile           # Frontend Docker configuration
│   ├── nginx.conf           # Nginx configuration
│   └── package.json
├── backend/                  # Express + PostgreSQL backend
│   ├── config/
│   │   ├── database.js      # PostgreSQL connection
│   │   └── migrate.js       # Database migrations
│   ├── routes/
│   │   ├── authRoutes.js    # Authentication routes
│   │   ├── itemRoutes.js    # Item CRUD routes
│   │   ├── dashboardRoutes.js # Dashboard routes
│   │   └── historyRoutes.js # History routes
│   ├── middleware/           # Custom middleware
│   ├── uploads/             # User uploads
│   ├── Dockerfile           # Backend Docker configuration
│   ├── server.js            # Main server file
│   └── package.json
├── docker-compose.yml        # Docker Compose configuration
├── .env.example             # Environment variables template
└── README.md                # This file
```

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (or use Docker)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp ../.env.example .env
```

4. Update the `.env` file with your Neon Database credentials:
```
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Docker Setup

### Using Docker Compose (Recommended)

1. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration.

3. Build and start all services:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: `http://localhost`
- Backend API: `http://localhost:3000`
- API Documentation: `http://localhost:3000/api-docs`

### Manual Docker Build

#### Backend
```bash
cd backend
docker build -t grocery-buddy-backend .
docker run -p 3000:3000 --env-file .env grocery-buddy-backend
```

#### Frontend
```bash
cd frontend
docker build -t grocery-buddy-frontend .
docker run -p 80:80 grocery-buddy-frontend
```

## Deployment to Render

### Backend Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `grocery-buddy-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add environment variables:
   - `DATABASE_URL`: Your Neon Database connection string
   - `SESSION_SECRET`: A strong random secret
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your frontend URL (e.g., `https://grocery-buddy-frontend.onrender.com`)

5. Create a PostgreSQL database on Neon:
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string
   - Add it to Render environment variables

6. Deploy the service

### Frontend Deployment

1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Configure the site:
   - **Name**: `grocery-buddy-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: Free

4. Add environment variables:
   - `VITE_API_URL`: Your backend URL (e.g., `https://grocery-buddy-backend.onrender.com`)

5. Deploy the site

### Database Setup (Neon)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string
4. Add it to your backend environment variables as `DATABASE_URL`
5. Run migrations after deployment:
```bash
npm run migrate
```

## API Documentation

Once the backend is running, access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/check-auth` - Check authentication status
- `POST /auth/logout` - Logout user

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get a single item
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an item
- `PATCH /api/items/:id/toggle` - Toggle item completion
- `DELETE /api/items/:id` - Delete an item
- `DELETE /api/items/completed/clear` - Clear completed items
- `GET /api/items/stats` - Get item statistics

### Dashboard
- `POST /dashboard/update-status` - Update user status
- `POST /dashboard/profile/upload-image` - Upload profile image
- `POST /dashboard/profile/password` - Change password
- `DELETE /dashboard/profile/delete` - Delete account

### History
- `GET /history/api` - Get shopping history
- `DELETE /history/clear-all` - Clear all history
- `POST /history/save-completed` - Move completed items to history
- `DELETE /history/clear-shopping-list` - Clear shopping list
- `GET /history/stats` - Get history statistics

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string (Neon Database)
- `SESSION_SECRET`: Secret key for session encryption
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

### Frontend
- `VITE_API_URL`: Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@grocerybuddy.com or create an issue in the repository.
