const siteRouter = require('./site');
const userRouter = require('./user')
const roomRouter = require('./room')

function route(app){
    app.use('/user',userRouter);
    app.use('/room',roomRouter);
    app.use('/',siteRouter);
}

module.exports = route;