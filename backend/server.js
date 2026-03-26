const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'portfolio_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Database Connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✓ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        return false;
    }
}

// Validate Contact Form Data
function validateContactForm(name, email, message) {
    if (!name || !name.trim()) {
        return { valid: false, error: 'Name is required' };
    }
    if (!email || !email.trim()) {
        return { valid: false, error: 'Email is required' };
    }
    if (!message || !message.trim()) {
        return { valid: false, error: 'Message is required' };
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Please provide a valid email address' };
    }
    
    return { valid: true };
}

// Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

// Contact Form Endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate input
        const validation = validateContactForm(name, email, message);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        // Get connection from pool
        const connection = await pool.getConnection();

        try {
            // Insert into database
            const query = 'INSERT INTO contacts (name, email, message, created_at) VALUES (?, ?, ?, NOW())';
            const [result] = await connection.execute(query, [
                name.trim(),
                email.trim(),
                message.trim()
            ]);

            res.status(201).json({
                success: true,
                message: 'Message saved successfully',
                id: result.insertId
            });

            console.log(`✓ New contact message saved - ID: ${result.insertId}, Email: ${email}`);

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('✗ Error saving contact message:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to save message. Please try again later.'
        });
    }
});

// Get all contacts (for admin purposes - optional)
app.get('/api/contacts', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const query = 'SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC';
            const [rows] = await connection.execute(query);

            res.json({
                success: true,
                count: rows.length,
                contacts: rows
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('✗ Error fetching contacts:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contacts'
        });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error Handler
app.use((error, req, res, next) => {
    console.error('✗ Server error:', error.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start Server
async function startServer() {
    try {
        // Test database connection first
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('Failed to connect to database. Make sure MySQL is running and credentials are correct.');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log(`\n╔════════════════════════════════════════╗`);
            console.log(`║  Server is running on port ${PORT}        ║`);
            console.log(`║  http://localhost:${PORT}                ║`);
            console.log(`╚════════════════════════════════════════╝\n`);
            console.log('Available endpoints:');
            console.log(`  GET  /api/health        - Server health check`);
            console.log(`  POST /api/contact       - Submit contact form`);
            console.log(`  GET  /api/contacts      - Get all contacts\n`);
        });

    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await pool.end();
    process.exit(0);
});
