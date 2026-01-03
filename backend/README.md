# Dayflow HRMS - Backend

Node.js + Express backend for Human Resource Management System with MongoDB and JWT authentication.

## Features

- ✅ Express.js server setup
- ✅ MongoDB with Mongoose ODM
- ✅ JWT authentication
- ✅ User registration and login
- ✅ Password hashing with bcrypt
- ✅ CORS enabled
- ✅ Environment variables with dotenv
- ✅ Role-based authorization (employee, manager, hr, admin)
- ✅ Protected routes middleware

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── models/
│   │   └── User.js               # User model with schema
│   ├── controllers/
│   │   └── authController.js     # Authentication logic
│   ├── routes/
│   │   └── authRoutes.js         # Authentication routes
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & authorization
│   └── utils/
│       └── generateToken.js      # JWT token generation
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies and scripts
└── server.js                     # Main application entry point
```

## Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `PORT`: Server port (default: 5000)

3. **Start MongoDB:**
   - Local: Make sure MongoDB is running on your system
   - Cloud: Use MongoDB Atlas connection string

4. **Run the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes

#### Attendance Routes

- Check-in (Employee)
```
POST /api/attendance/checkin
Authorization: Bearer <token>
```

- Check-out (Employee)
```
POST /api/attendance/checkout
Authorization: Bearer <token>
```

- View my attendance (daily)
```
GET /api/attendance/me?date=YYYY-MM-DD
Authorization: Bearer <token>
```

- View my attendance (range/weekly)
```
GET /api/attendance/me?start=YYYY-MM-DD&end=YYYY-MM-DD
Authorization: Bearer <token>
```

- Admin/HR/Manager: Mark leave for a user
```
POST /api/attendance/:userId/leave
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "date": "2026-01-04",
  "notes": "Sick leave"
}
```

- Admin/HR/Manager: View user attendance (range)
```
GET /api/attendance/users/:userId?start=YYYY-MM-DD&end=YYYY-MM-DD
Authorization: Bearer <admin-token>
```

#### Curl examples (smoke test)

- Employee: check-in
```
curl -X POST http://localhost:5000/api/attendance/checkin \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

- Employee: check-out
```
curl -X POST http://localhost:5000/api/attendance/checkout \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

- Employee: view today
```
curl "http://localhost:5000/api/attendance/me?date=2026-01-03" \
  -H "Authorization: Bearer <token>"
```

- Employee: view week range
```
curl "http://localhost:5000/api/attendance/me?start=2026-01-01&end=2026-01-07" \
  -H "Authorization: Bearer <token>"
```

- Admin: mark leave for user
```
curl -X POST http://localhost:5000/api/attendance/<userId>/leave \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-01-04","notes":"Sick"}'
```

- Admin: view user attendance
```
curl "http://localhost:5000/api/attendance/users/<userId>?start=2026-01-01&end=2026-01-07" \
  -H "Authorization: Bearer <admin-token>"
```


### Authentication Routes

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee",
  "department": "Engineering",
  "position": "Software Developer"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User (Protected)
```
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile (Protected — Employee)
```
PUT /api/auth/me
Authorization: Bearer <token>
Content-Type: application/json

# Allowed fields for employees: `firstName`, `lastName`, `phoneNumber`, `dateOfBirth`, `password`

{
  "firstName": "John",
  "phoneNumber": "+1234567890"
}
```

#### Admin: Get / Update user by ID (Protected — Admin)
```
GET /api/auth/users/:id
Authorization: Bearer <admin-token>
```

```
PUT /api/auth/users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

# Example (admin can update any profile field):
{
  "firstName": "Jane",
  "role": "manager",
  "department": "Sales",
  "isActive": false
}
```

### Health Check
```
GET /api/health
```

## User Roles

- **employee**: Basic user access
- **manager**: Manager-level access
- **hr**: HR department access
- **admin**: Full system access

## Technologies Used

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable management
- **express-validator**: Request validation

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes middleware
- Role-based authorization
- Input validation
- CORS configuration

## Development

The server runs on `http://localhost:5000` by default.

For development with auto-restart:
```bash
npm run dev
```

## Next Steps

You can extend this backend with:
- Employee management routes
- Leave management system
- Attendance tracking
- Payroll management
- Performance reviews
- Document management
- Notification system
- Reporting features

## License

ISC
