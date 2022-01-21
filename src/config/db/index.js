const mongoose = require('mongoose');

async function connect(){
    try {
        await mongoose.connect('mongodb://localhost:27017/Game_Ba_Cay')
        console.log('Connect mongodb successfully!');
    } catch (error) {
        console.log('Connect mongodb failure!');
    }
}

module.exports = {connect};