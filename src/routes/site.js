const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

router.post('/logIn',siteController._logIn);

module.exports = router;