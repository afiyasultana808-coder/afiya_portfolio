# Afiya Portfolio Backend 🚀

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or [Atlas](https://mongodb.com/atlas))
- (Optional) Gmail App Password for emails

### 2. Setup
```bash
cd afiya_portfolio/backend
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

**MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolioDB
```

**Gmail (optional):**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Run Server
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

Server runs on `http://localhost:5000`

### 5. Test API
**Health Check:**
`GET http://localhost:5000`

**Contact Form:**
```
POST http://localhost:5000/api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello! Love your portfolio."
}
```

**View Contacts:**
`GET http://localhost:5000/api/contact`

### 6. Frontend Integration
Update `script.js` API_URL to your backend:
```javascript
const API_URL = 'http://localhost:5000/api/contact';
```

### 7. MongoDB
Database: `portfolioDB`
Collection: `contacts`

### 8. Postman Collection
[Download Postman collection](postman-collection.json) (create manually)

### Security Features
- ✅ Helmet (security headers)
- ✅ CORS
- ✅ Rate limiting (100 req/15min)
- ✅ Input validation (Joi)
- ✅ Email spam protection
- ✅ MongoDB sanitization

### Production Deployment
```bash
npm install --production
npm start
```

**Heroku/Render/Vercel:** Set env vars in dashboard.

---
*Built with ❤️ by BLACKBOXAI for Afiya Sultana's Portfolio*

