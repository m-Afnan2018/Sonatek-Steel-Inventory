const mailer = require('nodemailer');
const customError = require('./errorHandler');


const sendMail = async(to, subject, html)=>{
    try{
        const transporter = mailer.createTransport({
            host: process.env.MAILER_HOST,
            service: 'gmail',
            auth: {
                user: process.env.MAILER_USERNAME,
                pass: process.env.MAILER_PASSWORD,
            }
        })
        const mailOptions = {
            from: 'Sonatek Steel Inventory',
            to,
            subject,
            html,
        }

        const send = transporter.sendMail(mailOptions)
        return send; 
    }
    catch(err){
        console.error(err);
    }
}

module.exports = sendMail;