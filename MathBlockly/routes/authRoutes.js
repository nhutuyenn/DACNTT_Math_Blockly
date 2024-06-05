const {Router} = require('express');
const router = Router();
const authController = require('../controllers/authController');
// const passport = require('passport');
// const {check, validationResult} = require('express-validator');
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');    

router.get('/register', authController.register_get);

router.post('/register', authController.register_post);

router.get('/login', authController.login_get)

router.post('/login', authController.login_post);

router.get('/logout', authController.logout_get);

// app.get('/AnalyzePage', (req, res) => {
//     res.render('AnalyzePage');
// })
// app.get('/HistoryPage', (req, res) => {
//     res.render('HistoryPage');
// })
// app.get('/ReviewPage', (req, res) => {
//     res.render('ReviewPage');
// })
// app.get('/StudyPage', (req, res) => {
//     res.render('StudyPage');
// })
// app.get('/UserDetails', (req, res) => {
//     res.render('UserDetails');
// })

module.exports = router