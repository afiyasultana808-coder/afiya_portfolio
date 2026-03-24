const express = require('express');
const { submitContact, getContacts } = require('../controllers/contactController');

const router = express.Router();

router
    .route('/')
    .post(submitContact)
    .get(getContacts);

module.exports = router;
