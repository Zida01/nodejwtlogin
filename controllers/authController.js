const jwt = require('jsonwebtoken');
const User = require('../models/user');
const sendEmail = require('../utill/email');
const crypto = require('crypto');
const { localsName } = require('ejs');
const bcrypt = require('bcrypt');
require('dotenv').config();


// handle error
const handleError = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    //incorrect email
    if (err.message == 'incorrect Email') {
        errors.email = 'email and password incorrect'

    }
    //nno account found
    if (err.message == 'No account found') {
        errors.email = 'Email account does not exit'
    }
    if (err.message == 'passwordreset') {
        errors.email = 'Password reset mail  has  been sent'
    }
    // if (err.message == 'new error') {
    //     errors.email = 'Email account does not exit'

    // }
    //password mismatch
    if (err.message == 'password mismatch') {
        errors.password = 'password mismatch'

    }
    //incorect passweord
    if (err.message == 'incorrect Password') {
        errors.password = 'email and password incorrect'
    }
    //changepassword when loggged
    if (err.message == 'invalid password') {
        errors.password = 'password incorrect'
    }


    //duplicate error handler

    if (err.code === 11000) {
        errors.email = " the email is already registered"
        return errors
    }

    // validation error

    if (err.message.includes('jwtuser validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message

        })
    }
    return errors
}

// jwt functio to creat token
const maxAge = 3 * 24 * 60 * 60// 3days in seconds 
const createToken = (id) => {
    return jwt.sign({ id }, 'bababalulu alalsns', {
        expiresIn: maxAge
    });

}

module.exports.signup_get = (req, res) => {
    res.render('signup')

}


module.exports.login_get = (req, res) => {
    res.render('login')

}


module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        //jwt is the cookie name 
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user: user._id })

    } catch (err) {
        // console.log(err);
        // res.status(400).json({ message: " failed" })

        const errors = handleError(err);
        res.status(400).json({ errors })
    }



}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    // create static method on a modeel
    try {
        const user = await User.login(email, password)
        const token = createToken(user._id);
        //jwt is the cookie name 
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })

        res.status(200).json({ user: user._id })

    } catch (err) {
        const errors = handleError(err);
        res.status(400).json({ errors })

    }

}


module.exports.get_reset_password = (req, res) => {
    res.render('resetpassword')

}



module.exports.post_reset_password = async (req, res, next) => {
    const { email } = req.body;

    // const reseturl = `${req.protocol}://${req.host}/changepassword/${resetToken}`;
    // const message = `<P>We have recieced your password reset request</P><p> kindly use this link</p><p> <a href=${req.protocol}://${req.host}/changepassword/${resetToken}>RESET PASSWORD</a> to proceed/p><p> </p>`

    try {
        const user = await User.loginpassword(email)
        if (user) {
            const resetToken = await user.resetTokenPassword()
            await user.save()
            next();
            try {
                // `${req.protocol}://${req.hostname}:3000/changepassword/${resetToken}/${user._id}`;
                // const reseturl = `${req.protocol}://${req.hostname}:3000/changepassword?token=${resetToken}&id=${user._id}`;
                const message = `<P>We have recieced your password reset request</P><p> kindly use this link</p><p> <a href=${req.protocol}://${req.hostname}:3000/changepassword/${resetToken}/${user._id}>RESET PASSWORD</a> to proceed</p>`
                sendEmail({
                    email: user.email,
                    subject: 'Password Reset',
                    message: message
                })

                res.status(200).json({ user: user._id })


            } catch (error) {
                const errors = handleError(err);
                res.status(400).json({ errors })


            }


        } else {
            res.status(400).json({ messsage: "errors" })
            throw Error('RESETTOKEN STOP')
        }




    } catch (err) {
        const errors = handleError(err);
        res.status(400).json({ errors })


    }
}
module.exports.get_change_password = async (req, res, next) => {

    console.log(req.params.token)
    const user = await User.findByIdAndUpdate({ _id: req.params._id })
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const result = await User.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } })
    res.render('changepassword', { result: result, user: user })



}



module.exports.post_change_password = async (req, res, next) => {

    const { password1 } = req.body
    //console.log(password1)
    const _id = req.params._id
    const salt = await bcrypt.genSalt(10)
    const password = await bcrypt.hash(password1, salt)

    const user = await User.findByIdAndUpdate({ _id }, {
        password: password,
        passwordResetToken: undefined,
        passwordResetTokenExpires: undefined

    },)
    if (user) {
        res.cookie('jwt', '', { maxAge: 1 });
        res.render('login')
    }


    // if (user) {
    //     res.render('login')
    //     console.log();
    // }



}


module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');


}

module.exports.get_password = (req, res) => {
    res.render('passwordchangelogin')
}



module.exports.post_password = async (req, res) => {
    //get user email
    const { email, password, newpassword } = req.body
    const filter = { email: email };

    console.log(req.body)
    try {

        const user = await User.checkloggedinpassword(email, password)
        if (user) {
            const salt = await bcrypt.genSalt(10)
            const changepassword = await bcrypt.hash(newpassword, salt)
            const ty = await User.findOneAndUpdate(filter, { password: changepassword }, { new: true })

            if (ty) {
                res.cookie('jwt', '', { maxAge: 1 });
                res.redirect(200, 'http://localhost:3000/login');

            }

        }


    }

    catch (err) {
        const errors = handleError(err);
        res.status(400).json({ errors })

    }
}