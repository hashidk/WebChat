const { chatDB } = require('../../data')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require('cors');
const { allow_cors } = require('../../Utils');
require('dotenv').config()

const SECRET_KEY = process.env.SECRET_KEY
const config_cors = {
  credentials: true,
  preflightContinue: true,
  origin: allow_cors,
  methods: ['GET','POST','DELETE','UPDATE','PUT']
}

morgan.token('id', function getId (req) {
  return req.id
})

function mw(app) {
    app.use(cors(config_cors))
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json())
    app.use(cookieParser());
    app.use(morgan('short'))
}

const authorization = async (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(403).send("Inicie sesión para poder ingresar");
    }
    try {
      const data = jwt.verify(token, SECRET_KEY);
      const query = { nickname: data.nickname, user_id: data.id };
      var resp = await chatDB.db.collection("users").findOne(query)
      if (resp === null)  return res.status(403).send('No se pudo autenticarle, vuelva a intentar')
      return next();
    } catch(err) {
      return res.status(403).send("Falla al obtener el token: " + err);
    }
  };

module.exports = {
    mw,
    authorization
}