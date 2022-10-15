const { MongoClient } = require('mongodb');
const {mongodb_config} = require('./config')
require('dotenv').config()

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri, mongodb_config);

function connDBPromise( ) {
    return new Promise((resolve, reject) => {
        client.connect( (err, db) => {
            if (err) reject(err);
            console.log("Conexión exitosa");
            dbChat = db.db('Chat')            
            resolve(dbChat)
        });
    })
}

var chatDB = {
    db: null
}
async function connDB() {
    // var db
    try {
        chatDB.db = await connDBPromise()
        return chatDB
    } catch (err) {
        console.log(err)
        return null
    }
}


module.exports = {
    connDB,
    chatDB
}