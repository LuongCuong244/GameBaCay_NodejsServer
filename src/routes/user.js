const express = require('express');
const router = express.Router();

const userController = require('../app/controllers/UserController');

router.post('/get-Public-Information',userController._getPublicInformation);
router.post('/get-Statistical-And-Information',userController._getStatisticalAndInformation);
router.post('/user-Connected',userController._userConnected);

module.exports = router;