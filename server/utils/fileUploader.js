const cloudinary = require('cloudinary').v2;

const uploadMedia = async(file, folder, quality )=>{
    const option = { folder: `SonatekSteel_Inventory/${folder}/` }
    if(quality){
        option.quality = quality;
    }
    option.public_id = `image_${Date.now().toString()}`;
    option.type = 'private';
    option.resource_type = 'auto';
    return await cloudinary.uploader.upload(file.tempFilePath, option);
}

module.exports = uploadMedia;