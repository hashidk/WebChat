const middlewares = require('../middlewares')
const controllers = require('../controllers')

function routesChat(app) {
    app.post('/api/login', controllers.login)
    app.post('/api/register',controllers.register)

    app.post('/api/logout', middlewares.authorization, controllers.logOut)

    app.get('/api/user', middlewares.authorization, controllers.getUser)
    app.post('/api/user/friends', middlewares.authorization, controllers.addFriend)
    app.get('/api/user/users', middlewares.authorization, controllers.getUsers)
    // app.post('/api/users', controllers.addUser)
}

module.exports = {
    routesChat
}