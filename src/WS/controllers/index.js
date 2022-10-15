const data = require('../../data')

function updateSocketId(user_id, id) {
    const query = { user_id: user_id };
    const update = {
        $set: {
            chat_id: id
        }
    };
    data.chatDB.db
      .collection("users")
      .updateOne(query, update, function (err, _result) {
        if (err) {
          console.log('no se pudo actualizar');
        } 
      });

}

async function updateChatPersonal(user_id, chat_personal_id, mensaje) {
    const query = { user_id: user_id };
    var {chats} = await data.chatDB.db.collection("users").findOne(query)
    chats.personal.map((element, index) => {
        if (chat_personal_id === element.chat_personal_id) {
            chats.personal[index].mensajes.push(mensaje)
        }
    });

    const update = {$set: {chats: chats}}
    data.chatDB.db
      .collection("users")
      .updateOne(query, update, function (err, _result) {
        if (err) {
          console.log('no se pudo actualizar');
        } 
      });
}

async function sendMsgAll(users) {
    var ids = users.map(element => element.id)
    const query = { user_id: {$in: ids} };
    var usersfound = await data.chatDB.db.collection("users").find(query).toArray()

    return usersfound
}

function handleConn(socket){
    const datos = socket.decoded
    console.log('Hola ' + datos.nickname + ', esta es tu nueva id=' + socket.id);
    updateSocketId(datos.id, socket.id)

    socket.on("disconnecting", (reason) => {
        console.log(reason);
    })

    socket.on("disconnect", (reason) => {
        updateSocketId(datos.id, '')
    })

    socket.on('end', function (){
        socket.disconnect(0);
    });

    socket.on('server', (...args) => {
        console.log();
    })

    socket.on('groups', (...args) => {
        console.log(args);
    })

    socket.on("personal", (...args) => {
        var msg = args[0]
        var emisor = args[2]
        var users = args[1]
        var chat_personal_id = args[3]
        const mensaje = {
            fecha: new Date(),
            mensajes: msg,
            visto: false,
            username: emisor
        }
        if (users[0].id === users[1].id) {
            updateChatPersonal(users[0].id, chat_personal_id, mensaje)    
        }else{
            updateChatPersonal(users[0].id, chat_personal_id, mensaje)
            updateChatPersonal(users[1].id, chat_personal_id, mensaje)
        }
        sendMsgAll(users).then(usersfound => {
            usersfound.forEach(element => {
                if(element.chat_id !== '') socket.to(element.chat_id).emit("personal", true)
            })
        })
        socket.emit("personal", false)
    })

    socket.on("escribiendo", (...args) => {
        var escribiendo = args[0]
        var users = args[1]
        sendMsgAll(users).then(usersfound => {
            usersfound.forEach(element => {
                if(element.chat_id !== '') socket.to(element.chat_id).emit("escribiendo", escribiendo)
            })
        })
    })
    //     var nick = args[0]
    //     var mensaje = args[1]
    //     var room = args[2]

    //     if(room){
    //         socket.join(room);
    //         if (!dataXroom.has(room)) {
    //             dataXroom.set(room, [])
    //         }
    //         if (!usuarios.has(room)) {
    //             usuarios.set(room, new Map())
    //         }
    //     }
    //     var localroom = Array.from(socket.rooms)[1]
    //     usuarios.get(localroom).set(socket.id, nick)

    //     if(mensaje === "" && !room){
    //         dataXroom.get(localroom).push({
    //             nickname: nick,
    //             message: 'Ha ingresado al chat'
    //         })
    //     }else{
    //         dataXroom.get(localroom).push({
    //             nickname: nick,
    //             message: mensaje
    //         })
    //     }


    //     socket.emit("server", Object.fromEntries(usuarios.get(localroom)), dataXroom.get(localroom))
    //     socket.in(localroom).emit("server", Object.fromEntries(usuarios.get(localroom)), dataXroom.get(localroom))
    // })

    // socket.on("personal", (...args) => {
    //     var nick = args[0]
    //     var mensaje = args[1]
    //     var nickotro = args[2]
    //     socket.to(nickotro).emit('personal', mensaje)
    // })
}

module.exports = {
    handleConn, updateSocketId
}