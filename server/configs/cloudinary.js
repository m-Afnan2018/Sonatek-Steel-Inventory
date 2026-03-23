const cloudinary = require('cloudinary').v2;

const cloudinaryConnection = (CLOUD_NAME, API_KEY, API_SECRET)=>{
    try{
        cloudinary.config({
            cloud_name: CLOUD_NAME,
            api_key: API_KEY,
            api_secret: API_SECRET
        })

        console.log('Connected to Cloudinary');
    }catch(err){
        console.log(err);
    }
}

module.exports = cloudinaryConnection;