const { ServerApiVersion } = require('mongodb');

const mongodb_config = { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    serverApi: ServerApiVersion.v1 
}

module.exports = {
    mongodb_config
}