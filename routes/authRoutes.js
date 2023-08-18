const router = require('express').Router();
const authControlller = require('../controllers/authController');
const { requireAuth, checkUser } = require('../middleware/authMIddleware')


router.get('/signup', authControlller.signup_get)

router.post('/signup', authControlller.signup_post)


router.get('/login', authControlller.login_get)

router.post('/login', authControlller.login_post)

router.get('/resetpassword', authControlller.get_reset_password)

router.post('/resetpassword', authControlller.post_reset_password)
// change and update password 
router.get('/changepassword/:token/:_id', authControlller.get_change_password)
router.put('/changepassword/:token/:_id', authControlller.post_change_password)


//change logged user password

router.get('/passwordchangelogin', requireAuth, checkUser, authControlller.get_password)

router.post('/passwordchangelogin', requireAuth, authControlller.post_password)

router.get('/logout', authControlller.logout_get)



module.exports = router;