require('dotenv').config()
const jwt = require("jsonwebtoken");
const { chatDB } = require('../../data')
const { updateSocketId } = require('../controllers')

const SECRET_KEY = process.env.SECRET_KEY

function authentication(socket, next){
  // console.log(socket);

  // if (socket.handshake.query && socket.handshake.query.is4WS==='sol') {
    if (socket.handshake.auth && socket.handshake.auth.token){
      var token = socket.handshake.auth.token
      jwt.verify(token, SECRET_KEY, async function(err, decoded) {
        
        if (err) next(new Error('Error al autenticarle, asegúrese de iniciar sesión'));
        if (!decoded) next(new Error('Error al decodificar'))
        else {
          const { nickname, id } = decoded
          const query = { nickname: nickname, user_id: id };
    
          chatDB.db.collection("users").findOne(query).then( resp => {
            if (resp === null) next(new Error('No se pudo autenticarle, vuelva a intentar'))
            else{
              if (resp.chat_id !== "") {
                updateSocketId(id, '')
                next(new Error('Sesion ya iniciada'))
              }
              else {
                socket.decoded = decoded;
                next();
              }
            }
          }).catch(err => next(new Error('Ocurrió un error al acceder a los datos')))
        }
  
      })
    // }else {
    //   next(new Error('Error al autenticarle, asegúrese de iniciar sesión'));
    // }   
  }
  // console.log(socket.request.url);

   

}

module.exports = {
    authentication
}