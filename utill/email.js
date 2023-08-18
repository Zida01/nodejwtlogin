require('dotenv').config();
const nodemailer = require('nodemailer')
//nodemailer


const sendEmail = (options) => {
    //  set nodemial  tranport with password and email  and servive authbn
    const transporter = nodemailer.createTransport({

        service: "gmail",
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASS,
        },

    })

    // connection test with nodemailer
    //testing transporter for connection  , enable less secure app in gmail setting  
    transporter.verify((error, success) => {
        if (error) {
            console.log(error);
        } else {
            {
                console.log("ready for message");
                console.log(success);
            }
        }
    })


    //  define mail  option
    const mailOption = {

        from: process.env.AUTH_EMAIL,
        to: options.email,
        subject: options.subject,
        html: options.message,

    }

    transporter.sendMail(mailOption)
}

module.exports = sendEmail;
