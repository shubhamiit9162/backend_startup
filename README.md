
# Souveno Hub Backend API

This is the backend API for the Souveno Hub website, built with Node.js, Express.js, and MongoDB.

## Features

- Contact form submissions with email notifications
- Appointment scheduling system
- Email confirmations for users and admins
- Rate limiting and security middleware
- MongoDB data persistence
- RESTful API endpoints

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Gmail account (for email notifications)

### Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/souveno-hub

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password  # Use App Password, not regular password
ADMIN_EMAIL=hello@souvenohub.com

# Other settings
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS`

### MongoDB Setup

#### Option 1: Local MongoDB
```bash
# Install MongoDB locally and start the service
mongod
```

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create a cluster
3. Get connection string and replace in `MONGODB_URI`

### Running the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Contact Form
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (admin)
- `PATCH /api/contact/:id/status` - Update contact status

### Scheduling
- `POST /api/schedule` - Schedule appointment
- `GET /api/schedule` - Get all appointments (admin)
- `GET /api/schedule/slots?date=YYYY-MM-DD` - Get available time slots
- `PATCH /api/schedule/:id/status` - Update appointment status

### Health Check
- `GET /api/health` - Server health status

## Frontend Integration

Make sure to set the API URL in your frontend:

### For development:
```bash
# In your frontend .env file
REACT_APP_API_URL=http://localhost:5000/api
```

### For production:
```bash
# In your frontend .env file
REACT_APP_API_URL=https://your-domain.com/api
```

## Deployment

### Heroku
1. Create Heroku app
2. Set environment variables in Heroku dashboard
3. Connect MongoDB Atlas
4. Deploy

### Digital Ocean/AWS/Other
1. Set up server with Node.js
2. Configure environment variables
3. Set up MongoDB
4. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name "souveno-hub-api"
```

## Security Features

- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation
- Email sanitization

## Database Models

### Contact
- firstName, lastName, email, subject, message
- status (new, in-progress, resolved)
- timestamps, IP tracking

### Schedule
- name, email, phone, company, serviceType
- preferredDate, preferredTime, message
- status (pending, confirmed, cancelled, completed)
- timestamps, IP tracking

## Email Templates

The system sends HTML emails for:
- Contact form confirmations
- Appointment confirmations
- Status updates
- Admin notifications

## Testing

Run tests (when implemented):
```bash
npm test
```

## Support

For support, contact: hello@souvenohub.com
```
