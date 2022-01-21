const roomSocketController = require('../controllers/RoomSocketController')

const runRoomNamespace = (io) => {

    const roomSocket = io.of('/room');

    roomSocket.on('connection', (socket) => {
        let userID;

        socket.emit('get_user_name'); // sau đó client gửi socket.emit('newPlayer);

        socket.on('new_Player', (userName) => {
            console.log(userName, "đã kết nối!");
            userID = userName;
            roomSocketController._updateState(roomSocket, socket, userName);
        })

        socket.on('update_Rooms', () => {  // update hiển thị tất cả phòng
            roomSocketController._displayAllRooms(roomSocket);
        });

        socket.on('reload_Room', (roomName, data) => { // update trạng thái của 1 phòng
            roomSocketController._reloadRoom(roomSocket, socket, roomName, data);
        })

        socket.on('ready', (roomName, userName) => { // khi người dùng nhấn nút sẵn sàng vô game
            roomSocketController._ready(roomSocket, roomName, userName);
        })

        socket.on('countdown_Of_New_Game', (roomName) => { // khi bắt đầu đếm ngược sẵn sàng
            roomSocketController._countdownOfNewGame(roomSocket, roomName);
        })

        socket.on('join_Room', (roomName) => {
            roomSocketController._joinRoom(socket, roomName);
        })

        socket.on('leave_Room', (roomName, userName) => {
            roomSocketController._leaveRoom(roomSocket, socket, roomName, userName);
        })

        socket.on('start_Game', (roomName) => {
            roomSocketController._startGame(roomSocket, roomName);
        })

        socket.on('flip_Card', (roomName, oderOfCard, position) => {  // oderOfCard nhận các giá trị ( 'First','Second','Third','All' )
            roomSocketController._flipCard(roomSocket, roomName, oderOfCard, position);
        })

        socket.on('set_Owner_Room', (roomName, position) => {
            roomSocketController._setOwnerRoom(roomSocket, roomName, position);
        })

        socket.on('update_Change_Bet', (roomName) => {
            roomSocketController._updateChangeBet(roomSocket, roomName);
        })

        socket.on('get_messages_world_chat', () => {
            roomSocketController._getMessagesWorldChat(socket);
        })

        socket.on('sending_message_to_world_chat', (message) => {
            roomSocketController._sendingMessageToWorldChat(roomSocket, message);
        })

        socket.on('get_messages', (roomName) => {
            roomSocketController._getMessages(socket, roomName);
        })

        socket.on('sending_message_to_room', (message, roomName) => {
            roomSocketController._sendingMessageToRoom(roomSocket, message, roomName);
        })

        socket.on('req_update_coin',(userName) =>{
            roomSocketController._updateCoin(socket, userName)
        })

        socket.on("disconnect", (reason) => {
            console.log('Reason: ', reason);
            console.log(userID, "đã ngắt kết nối!");
            roomSocketController._userDisconnect(roomSocket, userID);
        });
    })
}

module.exports = runRoomNamespace