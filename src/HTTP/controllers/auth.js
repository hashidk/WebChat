const { cloudinary_config, cookie_config } = require('./config')
const path = require('path')
const SHA256 = require("crypto-js/sha256");
const cloudinary = require('cloudinary').v2
const jwt = require("jsonwebtoken");
const data = require('../../data')
const uuid = require('uuid')
const fs = require('fs');
require('dotenv').config()


const SECRET_KEY = process.env.SECRET_KEY

cloudinary.config(cloudinary_config);

async function login(req, res) {
    var {nickname, password} = req.body
    var t_nickname = nickname.toLocaleLowerCase()

    if (!t_nickname || !password) {
        return res.status(400).send('Asegurese de ingresar todos los campos')
    }

    const query = { nickname: t_nickname, password: SHA256(password).toString() };
    var user = null
    try {
        user = await data.chatDB.db.collection("users").findOne(query)
        if (user === null) {
            return res.status(400).send('Credenciales incorrectas')
        }
    } catch(err) {
        return res.status(400).send('Error al acceder a los datos')
    }

    const token = jwt.sign({
        id: user.user_id,
        nickname: user.nickname
    }, SECRET_KEY);

    return res
    .cookie("access_token", token, cookie_config)
    .status(200).send("Todo bien")
}

async function register(req, res) {
    const {nickname, password, confirm_password, nombre, image} = req.body
    if (!nickname || !password || !confirm_password || !nombre) {
        return res.status(400).send('Asegurese de ingresar todos los campos')
    }
    var t_nickname = nickname.toLocaleLowerCase()

    const query = { nickname: t_nickname };
    try {
        var resp = await data.chatDB.db.collection("users").findOne(query)
        if (resp !== null) return res.status(400).send('El usuario ya existe')
    } catch (err) {
        return res.status(400).send(err);
    }

    if (password !== confirm_password) return res.status(400).send('Las contraseñas deben ser iguales')

    const newID = uuid.v4()
    var url = 'https://res.cloudinary.com/dfxnpuks6/image/upload/v1665677350/unknown_zw9x26.jpg'
    if (image) {
        url = await saveImage(image)
    }

    const newUser = {
        user_id: newID,
        nickname: t_nickname,
        password: SHA256(password).toString(),
        nombre: nombre,
        url_img: url,
        chat_id: '',
        last_join: new Date(),
        chats: {
            personal: [],
            grupos: [
                {
                    chat_grupo_id: uuid.v1(),
                    nombre: 'grupo',
                    esPublico: true,
                    url_img: 'https://res.cloudinary.com/dfxnpuks6/image/upload/v1665786117/Photo_1665786119300_873.png',
                    chat_id: [
                        {
                            username: t_nickname,
                            id: newID
                        }
                    ],
                    mensajes: [
                        {
                            fecha: new Date(),
                            mensajes: 'Este es el apartado de grupos',
                            username: 'adminwill',
                            visto: false
                        }
                    ]
                },{
                    chat_grupo_id: uuid.v1(),
                    nombre: 'publico',
                    esPublico: false,
                    url_img: 'https://res.cloudinary.com/dfxnpuks6/image/upload/v1665786117/Photo_1665786119300_873.png',
                    chat_id: [
                        {
                            username: t_nickname,
                            id: newID
                        }
                    ],
                    mensajes: [
                        {
                            fecha: new Date(),
                            mensajes: 'Este es el apartado de grupos',
                            username: 'adminwill',
                            visto: false
                        }
                    ]
                }
            ],
        },
        notificaciones: [
            {
                notifi_id: uuid.v1(),
                username: 'adminwill',
                text: 'te ha dado la bienvenida',
                date: new Date(),
                url_img: 'https://res.cloudinary.com/dfxnpuks6/image/upload/v1665786117/Photo_1665786119300_873.png'
            }
        ],
        sugerencias: []
      };

    data.chatDB.db.collection("users").insertOne(newUser, function (err, result) {
        if (err) return res.status(400).send("Error al insertar los valores")
    });

    const token = jwt.sign({
        id: newUser.user_id,
        nickname: newUser.nickname
    }, SECRET_KEY);
    return res
    .cookie("access_token", token, cookie_config)
    .status(200).send("Todo bien")
}

async function logOut(req, res) {
    return res
    .clearCookie("access_token")
    .status(200)
    .send("Cerrado el chat")
}

async function uploadImg(imagePath) {
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    try {
      // Upload the image
      const result = await cloudinary.uploader.upload(imagePath, options);
    //   console.log(result);
      return result.url.toString();
    } catch (error) {
      console.error(error);
    }
}

async function saveImage(baseImage) {
    const uploadPath = path.join(__dirname, "images", "uploads")
    const localPath = path.join(__dirname, "images")
    const ext = baseImage.substring(baseImage.indexOf("/")+1, baseImage.indexOf(";base64"));
    const fileType = baseImage.substring("data:".length,baseImage.indexOf("/"));
    const regex = new RegExp(`^data:${fileType}\/${ext};base64,`, 'gi');
    const base64Data = baseImage.replace(regex, "");
    const rand = Math.ceil(Math.random()*1000);
    const filename = `Photo_${Date.now()}_${rand}.${ext}`;
    
    if(!fs.existsSync(path.join(localPath, "uploads"))) {
        fs.mkdirSync(path.join(localPath, "uploads"));
    }
    if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath);
    }
    fs.writeFileSync(path.join(uploadPath,filename), base64Data, 'base64');
    return await uploadImg(path.join(uploadPath,filename))
    // return {filename, localPath};
}

module.exports = {
    login, register, logOut
}