require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const { requireAuth, checkUser } = require('./middlewares/authMiddlewares');
const calculateTotalDuration = require('./controllers/analyzeController');
const jwt = require('jsonwebtoken');
const { MONGO_URL } = process.env;
const LessonModel = require('./models/lessons');
const QuestionModel = require('./models/questions');
const AnswerModel = require('./models/answers'); 
const ResultModel = require('./models/result');
const response = require('./models/response');
const bodyParser = require('body-parser');
const port = process.env.port
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
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
    res.render('HomePage');
})

app.get('/StudyPage/:id', async (req, res) => {
    const id = req.params.id;
    const lessons = await LessonModel.find({_id : id });
    const questions = await QuestionModel.find({lessonID : id });
    const answers = await AnswerModel.find({lessonID : id });
    // const token = req.cookies.jwt;
    // const userID = jwt.verify(token, 'secret').id;
    // console.log(userID);
    // console.log(id);
    res.render('StudyPage', {lessons, questions, answers});
})

app.post('/StudyPage/:id', async (req, res) => {
    // const user = req.cookies.user;
    // if (!user) {
    //     return res.status(400).send('User not found in cookies');
    // }
    // const userID = user._id;
    const {answer1, answer2, answer3, answer4, answer5, answer6, answer7, answer8, answer9, answer10} = req.body;
    // Add code here to handle userID and answers
    res.redirect('/home');
});

app.get('/LessonPage', async (req, res) => {
    const lessons = await LessonModel.find();
    res.render('LessonPage', {lessons});
})

app.post('/LessonPage', async (req, res) =>{
    const {lessonInput} = req.body;
    res.redirect('/StudyPage/'+lessonInput);
})

app.get('/AnalyzePage/', async (req, res) => {
    const totalDuration = await calculateTotalDuration();
    const id = req.params.id;
    const results = await ResultModel.find();
    console.log(results[0].time);
    res.render('AnalyzePage', {results, totalDuration});
})

app.get('/home', (req, res) => {
    // const token = req.cookies.jwt;
    // const userID = jwt.verify(token, 'secret').id;
    // console.log(userID);
    res.render('HomePage');
})

app.listen(port, () => {
    mongoose
        .connect(MONGO_URL)
        .then(() => console.log("Connect to mongoDB successfully"))
        .catch((err) => console.error("Could not connect to MongoDB", err));
    console.log('http://localhost:' + port)
})

/*app.get('/StudyPage', async (req, res) =>{
    //let id = req.params.id;
    const lessons = await LessonModel.find();
    const questions = await QuestionModel.find();
    const answers = await AnswerModel.find();
    res.render('StudyPage', {lessons, questions, answers});
})
app.post('/StudyPage', async (req, res) =>{
    const {answerinput} = req.body;
    console.log("Answer1: " + answerinput);
    res.redirect('/home');
})
    app.get('/StudyPage/:id', async (req, res) =>{
    let id = req.params.id;
    const lessons = await LessonModel.find();
    const questions = await QuestionModel.find();
    const answers = await AnswerModel.find();
    const question = questions[id-1];
    res.render('StudyPage', {lessons, question, answers});
})
*/