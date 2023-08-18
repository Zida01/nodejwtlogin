const jwt = require('jsonwebtoken');
const User = require('../models/user');



const requireAuth = (req, res, next) => {
    //   drag token from   cookies

    const token = req.cookies.jwt
    // check   if  jwt token exit and is verfied
    if (token) {
        jwt.verify(token, 'bababalulu alalsns', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.render('/login');
                console.log("unable ");
                next()
            } else {
                // console.log(decodedToken);
                next();
            }

        })



    } else {

        res.redirect('/login')
    }


}


//check current user
//apply in get or post route 
const checkUser = async (req, res, next) => {
    const token = req.cookies.jwt
    // check   if  jwt token exit and is verfied
    if (token) {
        jwt.verify(token, 'bababalulu alalsns', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null

            } else {
                //console.log(decodedToken);
                let user = await User.findById(decodedToken.id)
                res.locals.user = user;
                next();
            }

        })

    } else {
        res.locals.user = null

    }

}
module.exports = { requireAuth, checkUser };