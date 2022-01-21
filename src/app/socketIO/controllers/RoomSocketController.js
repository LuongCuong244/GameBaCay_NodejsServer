const RoomModel = require('../../models/Room');
const UserModle = require('../../models/User');
const moduleNewGame = require('../../logic.game/NewGame');
const startGame = require('../../logic.game/StartGame');
const PLAYER_KEYS = require('../../../variables').PLAYER_KEYS;
const showResult = require('../../logic.game/ShowResultWinOrLost').showResult;
const handelLeaveRoom = require('../../logic.game/HandleLeaveRoom').handelLeaveRoom;
const countdownOfNewGame = require('../../logic.game/NewGame').countdownOfNewGame;
const timeManagement = require('../../logic.game/TimeManagement/RunningGame_Manager').timeManagement;
const RoomManager_RunningGame = require('../../logic.game/TimeManagement/RunningGame_Manager');
const RoomManager_Ready = require('../../logic.game/TimeManagement/Ready_Manager');
const StartGameManager = require('../../logic.game/Manager/StartGameManager');
const FindOwnerCountdown = require('../../logic.game/TimeManagement/FindOwnerCountdown');

class RoomSocketController {

    _displayAllRooms(roomSocket) {
        RoomModel.find({})
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
                roomSocket.emit('send_AllRooms', {
                    allRooms: newArray,
                })
            })
    }

    _reloadRoom(roomSocket, socket, roomName, data) {

        // socket.rooms trả về 1 set

        if (!socket.rooms.has(roomName)) { // kiểm tra xem có trong phòng chưa
            socket.join(roomName);
        }
        roomSocket.in(roomName).emit('game_room_update', data);
    }

    _joinRoom(socket, roomName) {
        socket.join(roomName)
    }

    _leaveRoom(roomSocket, socket, roomName, userName) {
        socket.leave(roomName);
        handelLeaveRoom(roomSocket, roomName, userName, this._displayAllRooms);
    }

    _ready(roomSocket, roomName, userName) {
        RoomModel.find({ roomName: roomName })
            .then(async (rooms) => {
                if (rooms.length !== 1) {
                    return;
                }
                let room = rooms[0];
                for (let key of PLAYER_KEYS) {
                    if (room[key]) {
                        if (room[key].userName === userName) {
                            room[key].confirmBet = true;
                            await RoomModel.findOneAndUpdate({ roomName: roomName }, {
                                [key]: room[key],
                            })
                            break;
                        }
                    }
                }
                let count = 0;
                PLAYER_KEYS.forEach((key) => {
                    if (room[key]) {
                        if (room[key].confirmBet) {
                            count++;
                        }
                    }
                })
                if (count === room.playersInRoom.length) {
                    moduleNewGame.newGame(roomSocket, roomName);
                }
            })
    }

    _countdownOfNewGame(roomSocket, roomName) {
        roomSocket.in(roomName).emit('start_countdown_ofNewGame');
        moduleNewGame.countdownOfNewGame(roomSocket, roomName);
    }

    _startGame(roomSocket, roomName) { // được gọi khi kết thúc hiển thị thanh tổng cược.
        startGame(roomSocket, roomName, this._displayAllRooms);
    }

    _flipCard(roomSocket, roomName, oderOfCard, position) {
        let key;
        if (position === 10) {
            key = PLAYER_KEYS[9];
        } else {
            key = PLAYER_KEYS[position - 1];
        }
        RoomModel.find({ roomName: roomName })
            .then(async (rooms) => {
                if (rooms.length !== 1) {
                    console.log("Tên bàn không là duy nhất");
                    return;
                }
                let room = rooms[0];
                switch (oderOfCard) {
                    case 'First': {
                        room[key].flipCardFirst = true;
                        break;
                    }
                    case 'Second': {
                        room[key].flipCardSecond = true;
                        break;
                    }
                    case 'Third': {
                        room[key].flipCardThird = true;
                        break;
                    }
                    case 'All': {
                        room[key].flipCardFirst = true;
                        room[key].flipCardSecond = true;
                        room[key].flipCardThird = true;
                        break;
                    }
                    default: {
                        console.log("OderOfCard không khớp giá trị với client");
                        room[key].flipCardFirst = true;
                        room[key].flipCardSecond = true;
                        room[key].flipCardThird = true;
                        break;
                    }
                }
                await RoomModel.findOneAndUpdate({ roomName: roomName }, {
                    [key]: room[key]
                })
                roomSocket.in(roomName).emit('game_room_update', {
                    [key]: room[key]
                })

                if (room[key].flipCardFirst && room[key].flipCardSecond && room[key].flipCardThird) {  // nếu đúng thì kiểm tra xem endGame được chưa.
                    for (let keyItem of PLAYER_KEYS) {
                        if (room[keyItem] && room[keyItem].isWaiting === false) {
                            if (!room[keyItem].flipCardFirst || !room[keyItem].flipCardSecond || !room[keyItem].flipCardThird) {
                                return;
                            }
                        }
                    }
                    roomSocket.in(roomName).emit('hide_countdown');
                    showResult(roomSocket, roomName, this._displayAllRooms);
                }
            })
            .catch(err => console.log(err));
    }

    _setOwnerRoom(roomSocket, roomName, position) {
        RoomModel.find({ roomName: roomName })
            .then(async (rooms) => {
                if (rooms.length !== 1) {
                    console.log("Tên bàn không là duy nhất! -RoomSocketController.js");
                    return;
                }
                if (rooms[0].ownerOfRoom) {
                    console.log("Đã có chủ bàn");
                    return;
                }
                let room = rooms[0];
                let key = PLAYER_KEYS[position - 1];
                if (room[key]) {
                    room.ownerOfRoom = {
                        ...room[key]
                    };
                    room[key] = null;
                    await RoomModel.findOneAndUpdate({ roomName: roomName }, {
                        [key]: null,
                        ownerOfRoom: room.ownerOfRoom,
                    })
                    roomSocket.in(roomName).emit('set_position', room.ownerOfRoom.userName, 10);
                    roomSocket.in(roomName).emit('update_entire_room', room);
                    roomSocket.in(roomName).emit('hide_confirm_owner_room', room.ownerOfRoom.userName);
                    this._displayAllRooms(roomSocket);

                    console.log("Chủ bàn mới!");
                    if (room.playersInRoom.length > 1) {
                        roomSocket.in(roomName).emit('start_countdown_ofNewGame'); // đếm ngược ở client
                        countdownOfNewGame(roomSocket, roomName); // đếm ngược ở server
                        console.log("game mới");
                    }
                } else {
                    console.log("Vị trí không phù hợp -RoomSocketController-");
                }
            })
    }

    _updateChangeBet(roomSocket, roomName) {
        RoomModel.find({ roomName: roomName })
            .then((rooms) => {
                if (rooms.length !== 1) {
                    console.log("Tên bàn không là duy nhất! -RoomSocketController.js");
                    return;
                }
                roomSocket.in(roomName).emit('game_room_update', rooms[0]);
            })
    }

    async _updateState(roomSocket, socket, userName) {
        await UserModle.findOneAndUpdate({ userName: userName }, {
            connected: true,
        })
        //kiểm tra xem có đang trong phòng nào không, nếu có thì update,
        try {
            RoomModel.find({})
                .then((rooms) => {
                    let i;
                    let size = rooms.length;
                    for (i = 0; i < size; i++) {
                        if (rooms[i].playersInRoom.indexOf(userName) !== -1) {
                            let roomName = rooms[i].roomName;
                            console.log("Người chơi đang ở trong phòng:", roomName);
                            socket.join(roomName); // vào lại phòng
                            socket.emit('back_to_the_room', timeManagement.get(roomName).time);
                            roomSocket.in(roomName).emit('game_room_update', rooms[i]);
                            return;
                        }
                    }
                })
                .catch(err => console.log(err))
        } catch (error) {
            console.log(error);
        }
    }

    async _userDisconnect(roomSocket, userName) {
        await UserModle.findOneAndUpdate({ userName: userName }, {
            connected: false,
        })
        //kiểm tra xem có đang trong phòng nào không, nếu có thì update
        try {
            RoomModel.find({})
                .then(async (rooms) => {
                    let i;
                    let size = rooms.length;
                    for (i = 0; i < size; i++) {
                        if (rooms[i].playersInRoom.indexOf(userName) !== -1) {
                            let room = rooms[i];
                            const roomName = room.roomName;
                            console.log("Người chơi đang ở trong phòng:", roomName);
                            if (room.playersInRoom.length === 1) {

                                // xóa phòng
                                await RoomModel.findOneAndRemove({ roomName: roomName });
                                RoomManager_RunningGame.deleteItem(roomName); // xóa trình quản lý thời gian tại server
                                RoomManager_Ready.deleteItem(roomName);
                                StartGameManager.deleteItem(roomName);
                                FindOwnerCountdown.deleteItem(roomName);
                                console.log("Xóa phòng!");

                            } else if (room.isRunning === false) {
                                PLAYER_KEYS.forEach(async (key) => {
                                    if (room[key] && room[key].userName === userName) {
                                        room.playersInRoom.splice(room.playersInRoom.indexOf(room[key].userName), 1);
                                        room[key] = null;
                                        await RoomModel.findOneAndUpdate({ roomName: roomName }, {
                                            [key]: null,
                                            playersInRoom: room.playersInRoom,
                                        });
                                        if (room.ownerOfRoom) {
                                            roomSocket.in(roomName).emit('start_countdown_ofNewGame'); // restart ở client
                                            moduleNewGame.countdownOfNewGame(roomSocket, roomName); // restart ở server
                                        } else {
                                            moduleNewGame.cancelCountdown(roomSocket, roomName);
                                            console.log("Mất chủ bàn!");
                                            // tìm những người đủ điều kiện làm chủ bàn và gửi
                                            findANewOwner(roomSocket, room);
                                        }
                                        roomSocket.in(roomName).emit('set_user_null', key);
                                    }
                                })
                            }
                            this._displayAllRooms(roomSocket);
                            return;
                        }
                    }
                })
                .catch(err => console.log(err))
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new RoomSocketController();