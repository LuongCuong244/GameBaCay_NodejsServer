const express = require('express');
const router = express.Router();

const roomController = require('../app/controllers/RoomController');

router.post('/create-room',roomController._createRoom);
router.post('/join-room',roomController._joinRoom);
router.get('/get-all-rooms',roomController._getAllRooms);
router.post('/get-data',roomController._getDataOfPlayerInRoom);
router.post('/change-bet',roomController._changeBet);

module.exports = router;