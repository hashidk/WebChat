require('dotenv').config()
const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE


const cloudinary_config = { 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET,
    secure: false
  }

const cookie_config = {
    httpOnly: false,
    secure: true,
    maxAge: 30 * MINUTE,
    sameSite: 'none',
    // domain: '192.168.100.51:3000,192.168.100.51:3500'
}

module.exports = {
    cloudinary_config,
    cookie_config
}