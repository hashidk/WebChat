const socketio = require('socket.io')
const middlewares = require('./middlewares')
const controllers = require('./controllers')
const { allow_cors } = require('../Utils')

const config_cors = {
  origin: allow_cors,
  credentials: true
}

function setUpWS(server) {
    
    const io = socketio(server, {
      cors: config_cors, 
      path: "/ws/socket.io"  
    })

    const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

    // console.log(io);
    io
    .use(middlewares.authentication)
    .on('connection',controllers.handleConn )

    return io
}

module.exports = {
    setUpWS
}