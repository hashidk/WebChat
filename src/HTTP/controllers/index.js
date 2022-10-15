const {register, login, logOut} = require('./auth')
const jwt = require("jsonwebtoken");
const uuid = require('uuid')
const {chatDB} = require('../../data')
require('dotenv').config()

const SECRET_KEY = process.env.SECRET_KEY


async function getUser(req, res) {
    const token = req.cookies.access_token;
    try {
        const data = jwt.verify(token, SECRET_KEY);
        const query = { nickname: data.nickname, user_id: data.id };
        const getData = {_id:0,password:0}
        var user = await chatDB.db.collection("users").findOne(query, getData)
        user.chats.personal = user.chats.personal.sort((chatA,chatB) => {
            if (chatA.mensajes.length === 0 || chatB.mensajes.length === 0) return 0
            return chatA.mensajes.at(-1).fecha > chatB.mensajes.at(-1).fecha ? -1 : chatA.mensajes.at(-1).fecha < chatB.mensajes.at(-1).fecha ? 1 : 0 })
        user.chats.grupos = user.chats.grupos.sort((chatA,chatB) => {
            if (chatA.mensajes.length === 0 || chatB.mensajes.length === 0) return 0
            return chatA.mensajes.at(-1).fecha > chatB.mensajes.at(-1).fecha ? -1 : chatA.mensajes.at(-1).fecha < chatB.mensajes.at(-1).fecha ? 1 : 0 })
    

        return res.status(200).send(user)
    } catch (error) {return res.status(400).send("Falla al obtener el token: " + error)}
}

async function getUsers(req, res) {
    const token = req.cookies.access_token;
    try {
        const data = jwt.verify(token, SECRET_KEY);
        const query1 = { user_id: data.id }
        var {chats} = await chatDB.db.collection("users").findOne(query1)
        
        var friends = chats.personal.map(ele => ele.chat_id[0].id === data.id ? ele.chat_id[1].id : ele.chat_id[0].id)
        const query = { user_id: { $nin: [...friends, data.id] } }
        const getData = {_id:0,password:0,chats:0, notificaciones:0}
        var users = await chatDB.db.collection("users").find(query, {projection: getData}).toArray()
        return res.status(200).send(users)
    } catch (error) {return res.status(400).send("Falla al obtener el token: " + error)}
}

async function addFriend(req, res) {
    const {id} = req.body
    const token = req.cookies.access_token;
    try {
        const data = jwt.verify(token, SECRET_KEY);
        var userdata1 = await chatDB.db.collection("users").findOne({ user_id: data.id })
        var userdata2 = await chatDB.db.collection("users").findOne({ user_id: id })
        const newChat = {
            chat_personal_id: uuid.v1(),
            chat_id: [{username: userdata1.nickname,
                        id: userdata1.user_id,
                        url_img: userdata1.url_img
                    },
                    {username: userdata2.nickname,
                        id: userdata2.user_id,
                        url_img: userdata2.url_img
                    }],
            mensajes: []
        }
        userdata1.chats.personal.push(newChat)
        userdata2.chats.personal.push(newChat)

        const newNotifi = {
            notifi_id: uuid.v1(),
            username: userdata1.nickname,
            text: 'te ha agregado, chatea con esa persona!',
            date: new Date(),
            url_img: userdata1.url_img
        }
        userdata2.notificaciones.push(newNotifi)
    
        chatDB.db
          .collection("users")
          .updateOne({ user_id: data.id }, {$set: {chats: userdata1.chats}}, function (err, _result) {
            if (err) {
                return res.status(400).send('no se pudo actualizar');
            } 
          });

        chatDB.db
          .collection("users")
          .updateOne({ user_id: id }, {$set: {chats: userdata2.chats, notificaciones: userdata2.notificaciones}}, function (err, _result) {
            if (err) {
                return res.status(400).send('no se pudo actualizar');
            } 
          });

        return res.status(200).send('ok')
    } catch (error) {return res.status(400).send("Falla al obtener el token: " + error)}
}

module.exports = {
    getUser, register, login, logOut, getUsers, addFriend
}