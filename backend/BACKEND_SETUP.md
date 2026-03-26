# Backend Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server (running on localhost)
- npm or yarn

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Database & Table
Open MySQL client and run the SQL file:
```bash
mysql -u root -p < database.sql
```

Or manually execute the SQL queries in database.sql in your MySQL GUI tool.

**SQL Commands:**
```sql
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Verify MySQL Credentials
The server.js file uses these default credentials:
- Host: `localhost`
- User: `root`
- Password: `password`
- Database: `portfolio_db`

**Update server.js if your MySQL credentials are different:**
```javascript
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'portfolio_db',
    ...
});
```

### 4. Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

---

## API Endpoints

### 1. Health Check
**GET** `/api/health`
```bash
curl http://localhost:5000/api/health
```
Response:
```json
{
    "status": "Server is running",
    "timestamp": "2026-03-26T10:30:00.000Z"
}
```

### 2. Submit Contact Form
**POST** `/api/contact`

Request Body:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello, I'd like to get in touch!"
}
```

Success Response (201):
```json
{
    "success": true,
    "message": "Message saved successfully",
    "id": 1
}
```

Error Response (400/500):
```json
{
    "success": false,
    "message": "Error description"
}
```

### 3. Get All Contacts (Admin)
**GET** `/api/contacts`
```bash
curl http://localhost:5000/api/contacts
```
Response:
```json
{
    "success": true,
    "count": 5,
    "contacts": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "message": "Hello!",
            "created_at": "2026-03-25T14:30:00.000Z"
        }
    ]
}
```

---

## Frontend Integration

### JavaScript Example
```javascript
async function submitContactForm(name, email, message) {
    try {
        const response = await fetch('http://localhost:5000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Message sent successfully!');
            // Reset form
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to send message');
    }
}

// Usage
submitContactForm('John Doe', 'john@example.com', 'Hello there!');
```

### HTML Form Example
```html
<form id="contactForm">
    <input type="text" id="name" placeholder="Your Name" required>
    <input type="email" id="email" placeholder="Your Email" required>
    <textarea id="message" placeholder="Your Message" required></textarea>
    <button type="submit">Send Message</button>
</form>

<script>
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
    });
    
    const data = await response.json();
    alert(data.message);
    
    if (data.success) {
        document.getElementById('contactForm').reset();
    }
});
</script>
```

---

## Validation Rules

- **Name**: Required, minimum 1 character
- **Email**: Required, valid email format
- **Message**: Required, minimum 1 character

---

## Error Handling

The server includes comprehensive error handling:
- Database connection failures are logged and reported
- Missing required fields return `400` status
- Database errors return `500` status
- All errors include descriptive messages

---

## File Structure
```
afiya_portfolio/
├── server.js           # Express server and API endpoints
├── package.json        # Node.js dependencies
├── database.sql        # SQL queries to setup database
├── .env.example        # Environment variables template
├── README.md           # This file
├── index.html          # Frontend HTML
├── script.js           # Frontend JavaScript
└── style.css           # Frontend styles
```

---

## Troubleshooting

### "Database connection failed"
- Ensure MySQL is running
- Check MySQL credentials in server.js
- Verify the database `portfolio_db` exists

### "EADDRINUSE: address already in use :::5000"
- Port 5000 is already in use
- Change the PORT in server.js or kill the process using that port

### "Cannot find module 'express'"
- Run `npm install` to install dependencies

### CORS Issues
CORS is already enabled for all origins. If frontend is on a different domain, it should work.

---

## Production Deployment

For production:
1. Use environment variables from `.env` file
2. Enable HTTPS
3. Add rate limiting to `/api/contact`
4. Add authentication for `/api/contacts`
5. Use a connection pool (already implemented)
6. Set up proper logging

---

## License
ISC
