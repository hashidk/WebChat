const data = require('./data')

data.connDB().then(async resp => {
    if (resp !== null) {
        const update = { 
            $set: { chat_id: "" }
        }
        data
        .chatDB
        .db
        .collection("users")
        .updateMany( {}, update, function (err, _result) {
            if (err) {
              console.log('no se pudo actualizar');
            } 
        })

        // const fs = require('fs')
        // const path = require('path')
        // var privateKey = fs.readFileSync( path.join(__dirname, 'key.pem') );
        // var certificate = fs.readFileSync( path.join(__dirname, 'cert.pem') );
        // const https = require("https");

        const express = require('express')
        const { createServer } = require("http");
        const routes = require('./HTTP/routes')
        const middlewares = require('./HTTP/middlewares')
        const ws = require('./WS')

        var app = express()
        app.set('port', process.env.PORT)
        
        middlewares.mw(app)
        routes.routesChat(app)
        app.use(express.static('public'))
        // const httpsServer = https.createServer({
        //     cert: certificate,
        //     key: privateKey
        //   },app).listen(app.get('port'), '0.0.0.0', function(){
        //     console.log(`Servidor corriendo en: http://localhost:${app.get('port')}`);
        //  });

        // const serverOn = app.listen(app.get('port'), function() {
        //     console.log(`Servidor corriendo en: http://localhost:${app.get('port')}`);
        // })



        const httpServer = createServer(app);
        
        // const io = ws.setUpWS(httpsServer)

        const io = ws.setUpWS(httpServer)

        httpServer.listen(app.get('port'), '0.0.0.0', function() {
            console.log(`Servidor corriendo en: http://localhost:${app.get('port')}`);
        });
    }else{
        console.log('No se pudo conectar a la base de datos');
    }
})
