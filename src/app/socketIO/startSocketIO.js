const runRoomNamespace = require('./namespace/Room')

const startSocketIO = (io) => {

    runRoomNamespace(io);

}

module.exports = startSocketIO