const Room = require('../models/Room');
const User = require('../models/User');
const PLAYER_KEYS = require('../../variables').PLAYER_KEYS;
const handleJoinRoom = require('../logic.game/HandleJoinRoom');
const RoomManager_RunningGame = require('../logic.game/TimeManagement/RunningGame_Manager');
const RoomManager_Ready = require('../logic.game/TimeManagement/Ready_Manager');
const StartGameManager = require('../logic.game/Manager/StartGameManager');
const FindOwnerCountdown = require('../logic.game/TimeManagement/FindOwnerCountdown');

class RoomController {
    _createRoom(req, res) {
        if (!req.body) {
            res.json({ error: 'Server không nhận được dữ liệu!' });
            return;
        }
        let ownerOfRoom = req.body.userName;
        let roomName = req.body.roomName;
        let roomPassword = req.body.roomPassword;
        let minBet = req.body.minBet;
        Room.find({ roomName: roomName })
            .then((rooms) => {
                if (rooms.length > 0) {
                    res.json({ error: 'Tên bàn đã tồn tại!' });
                    return;
                }
                User.find({ userName: ownerOfRoom })
                    .then((user) => {
                        if (user.length !== 1) {
                            res.json({ error: 'Server không nhận được dữ liệu!' });
                            return;
                        }
                        let newRoom = {
                            roomName: roomName,
                            roomPassword: roomPassword,
                            minBet: minBet,
                            ownerOfRoom: {
                                userName: ownerOfRoom,
                                avatar: user[0].avatar,
                                coin: user[0].coin,
                                bet: 1000,
                                newBet: 1000,
                                cardFirst: null,
                                cardSecond: null,
                                cardThird: null,
                                flipCardFirst: false,
                                flipCardSecond: false,
                                flipCardThird: false,
                                confirmBet: false,
                                isWaiting: false,
                                stillInTheRoom: true,
                                status: 'No',
                            },
                            firstPlayer: null,
                            secondPlayer: null,
                            thirdPlayer: null,
                            fourthPlayer: null,
                            fifthPlayer: null,
                            sixthPlayer: null,
                            seventhPlayer: null,
                            eighthPlayer: null,
                            ninthPlayer: null,
                            playersInRoom: [ownerOfRoom],
                            viewersInRoom: [],
                            isRunning: false,
                        }
                        Room.create(newRoom, (error) => {
                            if (error) console.log(error);
                        })

                        RoomManager_RunningGame.createItem(roomName); // tạo trình quản lý thời gian
                        RoomManager_Ready.createItem(roomName);
                        StartGameManager.createItem(roomName);
                        FindOwnerCountdown.createItem(roomName);

                        res.json({
                            ownerOfRoom: newRoom.ownerOfRoom,
                            position: 10,
                        });
                    })
                    .catch(error => console.log(error))
            }).catch((error) => {
                console.log(error);
            })
    }

    _joinRoom(req,res){
        if (!req.body) {
            res.json({ error: 'Server không nhận được dữ liệu!' });
            return;
        }
        Room.find({roomName: req.body.roomName})
            .then((listRooms) =>{
                if(listRooms.length !== 1){
                    res.json({ error: 'Lỗi khi lấy dữ liệu từ server!' });
                    return;
                }
                User.find({userName: req.body.userName})
                    .then((listUsers) =>{
                        if(listUsers.length !== 1){
                            res.json({ error: 'Lỗi khi lấy dữ liệu từ server!' });
                            return;
                        }
                        handleJoinRoom(listRooms[0],listUsers[0],req.body,res);
                    })
                    .catch(error => console.log(error))
            })
            .catch(error => console.log(error))
    }

    _getAllRooms(req, res) {
        Room.find({})
            .then((rooms) => {
                let newArray = rooms.map(item => {
                    return {
                        roomName: item.roomName,
                        havePassword: item.roomPassword != '' ? 'Yes' : 'No',
                        playersInRoom: item.playersInRoom,
                        viewersInRoom: item.viewersInRoom,
                        ownerOfRoom: item.ownerOfRoom,
                    }
                })
                res.json({
                    allRooms: newArray,
                })
            })
            .catch(error => console.log(error))
    }

    _getDataOfPlayerInRoom(req,res){
        if (!req.body) {
            res.json({ error: 'Server không nhận được dữ liệu!' });
            return;
        }
        Room.find({roomName: req.body.roomName})
            .then((rooms) =>{
                if(rooms.length !== 1){
                    console.log("Tên bàn không là duy nhất! -_getDataOfPlayerInRoom");
                    res.json({ error: 'Lỗi khi lấy dữ liệu từ server!' });
                    return;
                }
                res.json(rooms[0]);
            })
            .catch(error => console.log(error))
    }

    _changeBet(req,res){
        if (!req.body) {
            res.json({ error: 'Server không nhận được dữ liệu!' });
            return;
        }
        Room.find({roomName: req.body.roomName})
            .then( async (rooms) =>{
                if(rooms.length !== 1){
                    console.log("Tên bàn không là duy nhất! -_ChangeBet");
                    res.json({ error: 'Lỗi khi đọc dữ liệu từ server!' });
                    return;
                }
                let room = rooms[0];
                for(let key of PLAYER_KEYS){
                    if(room[key] && room[key].userName === req.body.userName){
                        console.log('chạy: ',room.isRunning);
                        if(room.isRunning){
                            room[key].newBet = req.body.newBet;
                            await Room.findOneAndUpdate({roomName: req.body.roomName},{
                                [key]: room[key],
                            })
                            res.json({status: 'Successfully'});
                        }else{
                            room[key].newBet = req.body.newBet;
                            room[key].bet = req.body.newBet;
                            await Room.findOneAndUpdate({roomName: req.body.roomName},{
                                [key]: room[key],
                            })
                            res.json({
                                status: 'Successfully',
                                updateBet: 'Yes',
                            });
                        }
                        
                        return;
                    }
                }
            })
            .catch(error => console.log(error))
    }
}

module.exports = new RoomController();