const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const UserSchema = new mongoose.Schema({


    email: {
        type: String,
        required: [true, 'ENTER AN EMAIL'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please Enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'ENTER A PASSWORD'],
        minlength: [6, '  MINIMUM PASSWORD IS SIX']
    },
    passwordResetToken: { type: String },
    passwordResetTokenExpires: { type: String }

});
/**
 * Mongoose hook with PRE;; POST 
 * function is fired before  ;; create , save  function /event
 */

UserSchema.pre('save', async function (next) {

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next();
})

//static method to login user

UserSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password)
        if (auth) {
            return user
        }
        throw Error('incorrect Password');
    }
    throw Error('incorrect Email');

}
// check  if password is correct when logged in
UserSchema.statics.checkloggedinpassword = async function (email, password) {
    const user = await this.findOne({ email });
    const auth = await bcrypt.compare(password, user.password)
    if (auth) {
        return auth
    }
    throw Error('invalid password');


}


UserSchema.statics.loginpassword = async function (email) {
    const user = await this.findOne({ email });
    if (user) {
        return user

    }
    throw Error('No account found');
}

UserSchema.methods.resetTokenPassword = async function () {
    const resetToken = await crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = await crypto.createHash('sha256').update(resetToken).digest('hex');
    // Please note that you need to specify a time to expire this token. In this example is (10 min)
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 10000;

    console.log(resetToken, this.passwordResetToken);
    return resetToken;


}


const User = mongoose.model('jwtuser', UserSchema);

module.exports = User; 