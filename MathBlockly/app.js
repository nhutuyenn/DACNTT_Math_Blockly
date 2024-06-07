require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const { requireAuth, checkUser } = require('./middlewares/authMiddlewares');
const jwt = require('jsonwebtoken');
const { MONGO_URL } = process.env;
const LessonModel = require('./models/lessons');
const QuestionModel = require('./models/questions');
const AnswerModel = require('./models/answers');
const response = require('./models/response');
//const studyRoutes = require('./routes/studyRoutes');

const port = process.env.port
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static('assets'));
app.use(cookieParser());
app.use(express.json());
app.use(authRoutes);
//app.use(studyRoutes);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('*', checkUser);

app.get('/', (req, res) => {
    // const token = req.cookies.jwt;
    // if (token) {
    //     jwt.verify(token, 'secret', (err, decodedToken) => {
    //         if (err) {
    //             res.render('LoginPage');
    //         } else {
    //             res.render('HomePage');
    //         }
    //     });
    // } else {
    //     res.render('LoginPage');
    // }
    res.render('HomePage');
})

app.get('/StudyPage', async (req, res) =>{
    const lesson = await LessonModel.find();
    const question = await QuestionModel.find();
    const answer = await AnswerModel.find();
    res.render('StudyPage', {lesson, question, answer});
})

app.get('/home', (req, res) => {
    res.render('HomePage');
})

app.listen(port, () => {
    mongoose
        .connect(MONGO_URL)
        .then(() => console.log("Connect to mongoDB successfully"))
        .catch((err) => console.error("Could not connect to MongoDB", err));
    console.log('http://localhost:' + port)
})

