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
const UserModel = require('./models/User');
const ResultModel = require('./models/result');
const ValidationModel = require('./models/validation');
const response = require('./models/response');

const bodyParser = require('body-parser');
const port = process.env.port
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(bodyParser.json());
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

app.get('/', async (req, res) => {
    res.render('HomePage');
})

app.get('/StudyPage/:id', async (req, res) => {
    const id = req.params.id;
    const lessons = await LessonModel.find({ _id: id });
    const questions = await QuestionModel.find({ lessonID: id });
    const answers = await AnswerModel.find({ lessonID: id });

    res.render('StudyPage', { lessons, questions, answers });
})

app.post('/StudyPage/:id', async (req, res) => {
    const id = req.params.id;
    let score = 0;
    const countdownValue = req.body.countdownValue;
    const lessons = await LessonModel.find({ _id: id });


    try {
        const validations = await ValidationModel.find();
        const objects = JSON.parse(req.body.answerinput);

        validations.forEach((validation) => {
            // Compare questionID
            if (objects.hasOwnProperty(validation.questionID.toString())) {
                // Compare answerID
                const answerIDs = validation.answerID;
                const objectAnswerIDs = objects[validation.questionID.toString()].trim().split(' ');
                if (answerIDs.length === objectAnswerIDs.length) {
                    for (let i = 0; i < answerIDs.length; i++) {
                        if (answerIDs[i] !== objectAnswerIDs[i]) {
                            break;
                        }
                        else if (i === answerIDs.length - 1) {
                            if (answerIDs[i] === objectAnswerIDs[i]) {
                                score++;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }

    const token = req.cookies.jwt;
    const userID = jwt.verify(token, 'secret').id;

    const date = new Date()
    date.setTime(date.getTime() + 420 * 60000)

    const result = new ResultModel({
        lessonID: id,
        lessonName: lessons[0].name,
        accountID: userID,
        score: score,
        time: countdownValue,
        createAt: date
    });
    await result.save();
    res.redirect('/HistoryPage');
})

app.get('/HistoryPage', async (req, res) => {
    const token = req.cookies.jwt;
    const userID = jwt.verify(token, 'secret').id;
    const results = await ResultModel.find({ accountID: userID });
    res.render('HistoryPage', { results });
})


app.get('/LessonPage', async (req, res) => {
    const lessons = await LessonModel.find();
    res.render('LessonPage', { lessons });
})

app.post('/LessonPage', async (req, res) => {
    const { lessonInput } = req.body;
    res.redirect('/StudyPage/' + lessonInput);
})

app.get('/home', async (req, res) => {
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