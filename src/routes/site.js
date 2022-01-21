const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

router.post('/logIn',siteController._logIn);
router.get('/get-data-for-leader-boards',siteController._getDataForLeaderBoards);

module.exports = router;