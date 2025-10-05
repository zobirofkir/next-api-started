# 🏫 University Sports Booking API

A robust and scalable RESTful API for managing sports facility bookings at universities. Built with Next.js, MongoDB, and modern web technologies.

## ✨ Features

- **User Authentication** - Secure JWT-based authentication system
- **Role-Based Access Control** - Different access levels for students, staff, and administrators
- **Facility Management** - CRUD operations for sports facilities
- **Booking System** - Intuitive booking management with availability checks
- **Email Notifications** - Automated email confirmations and reminders
- **Rate Limiting** - Protection against abuse and DDoS attacks
- **RESTful API** - Clean and consistent API endpoints
- **MongoDB Integration** - Scalable NoSQL database solution
- **Firebase Admin** - For secure authentication and file storage

## 🚀 Tech Stack

- **Backend Framework**: Next.js 13+ (App Router)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Firebase Authentication
- **Email**: Nodemailer
- **Rate Limiting**: rate-limiter-flexible
- **API**: RESTful architecture
- **Containerization**: Docker support included

## 📦 Prerequisites

- Node.js 18.0.0 or later
- MongoDB 6.0 or later
- npm or yarn
- Firebase project (for authentication)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zobirofkir/next-api-started.git
   cd next-api-started
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   ```

4. Seed the database (optional):
   ```bash
   npm run seed
   ```

## 🚦 Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```

The API will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### Using Docker
```bash
docker-compose -f docker-compose.dev.yml up --build
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Reset password

### Facilities
- `GET /api/facilities` - Get all facilities
- `POST /api/facilities` - Create a new facility (Admin only)
- `GET /api/facilities/:id` - Get facility by ID
- `PUT /api/facilities/:id` - Update facility (Admin only)
- `DELETE /api/facilities/:id` - Delete facility (Admin only)

### Bookings
- `GET /api/bookings` - Get all bookings (filterable)
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## 🔒 Authentication

All protected routes require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer your.jwt.token.here
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- Next.js Team
- MongoDB
- Firebase
- All contributors

---

<div align="center">
  Made with ❤️ by Zobir Ofkir
</div>
