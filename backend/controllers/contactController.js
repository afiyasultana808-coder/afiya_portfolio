const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const Joi = require('joi');

// Email transporter (optional)
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

// Validation schema
const contactSchema = Joi.object({
    name: Joi.string().trim().max(50).required().messages({
        'any.required': 'Name is required',
        'string.max': 'Name must be less than 50 characters',
    }),
    email: Joi.string().email().lowercase().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Please enter a valid email',
    }),
    message: Joi.string().trim().max(500).required().messages({
        'any.required': 'Message is required',
        'string.max': 'Message must be less than 500 characters',
    }),
});

// Send confirmation email (optional)
const sendEmail = async (contact) => {
    if (!transporter) return;

    try {
        await transporter.sendMail({
            from: `"Afiya Portfolio" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: contact.email,
            subject: `New Contact Form Submission from ${contact.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>New Message from ${contact.name}</h2>
                    <p><strong>Email:</strong> ${contact.email}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background: #f8f9fa; padding: 15px; border-left: 4px solid #6366f1;">${contact.message}</p>
                    <p><em>Submitted on: ${new Date(contact.createdAt).toLocaleString()}</em></p>
                </div>
            `,
        });
        console.log('📧 Confirmation email sent');
    } catch (error) {
        console.error('❌ Email error:', error.message);
    }
};

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
    try {
        // Validate input
        const { error, value } = contactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Check if recent submission from same email (spam prevention)
        const recentContact = await Contact.findOne({
            email: value.email,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours
        });
        if (recentContact) {
            return res.status(429).json({
                success: false,
                message: 'You have already submitted a message recently. Please wait 24 hours.'
            });
        }

        // Create and save contact
        const contact = new Contact(value);
        await contact.save();

        // Send email notification (optional)
        sendEmail(contact).catch(console.error);

        res.status(201).json({
            success: true,
            message: 'Thank you! Your message has been sent successfully. I will get back to you soon.',
            data: {
                id: contact._id,
                name: contact.name,
                submittedAt: contact.createdAt
            }
        });

    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// @desc    Get all contacts (admin only - no auth for demo)
// @route   GET /api/contact
// @access  Public (add auth in production)
exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 }).limit(50);
        res.json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts'
        });
    }
};

