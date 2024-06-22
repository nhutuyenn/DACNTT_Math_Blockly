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
const UserModel = require('./models/User');
const ResultModel = require('./models/result');
const ValidationModel = require('./models/validation');
const ClassroomModel = require('./models/classroom')
const AccountModel = require('./models/accountDetail');
const response = require('./models/response');

const bodyParser = require('body-parser');
const port = process.env.port
const app = express();

let error = "";

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

    const token = req.cookies.jwt;
    const userID = jwt.verify(token, 'secret').id;
    const user = await UserModel.find({ _id: userID });
    if (user[0].active === false || user[0].active === undefined) {
        return res.redirect('/UserDetails');
    }

    res.render('StudyPage', { lessons, questions, answers });
})

app.post('/StudyPage/:id', async (req, res) => {
    const id = req.params.id;
    const countdownValue = req.body.countdownValue;
    const lessons = await LessonModel.find({ _id: id });
    let score = 0;

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

    const user = await UserModel.find({ _id: userID });
    if (user[0].active === false || user[0].active === undefined) {
        return res.redirect('/UserDetails');
    }
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

app.get('/AnalyzePage/', async (req, res) => {
    const totalDuration = await calculateTotalDuration();
    const id = req.params.id;
    const results = await ResultModel.find();
    console.log(results[0].time);
    res.render('AnalyzePage', { results, totalDuration });
})

app.get('/home', (req, res) => {
    // const token = req.cookies.jwt;
    // const userID = jwt.verify(token, 'secret').id;
    // console.log(userID);
    res.render('HomePage');
})

app.get('/UserDetails', async (req, res) => {
    const token = req.cookies.jwt;
    const userID = jwt.verify(token, 'secret').id;
    const user = await UserModel.find({ _id: userID });

    res.render('UserDetails', { user, error });
})

app.post('/UserDetails', async (req, res) => {
    const { id, fullname, email, phone, birthday, school } = req.body;
    if (fullname === '' || email === '' || phone === '' || birthday === '' || school === '') {
        error = "Hãy nhập tất cả các thông tin cần thiết"
        const user = await UserModel.find({ _id: id });
        return res.render('UserDetails', { user, error });
    }
    await UserModel.updateOne({ _id: id }, {
        $set: {
            name: fullname,
            email: email,
            phone: phone,
            birthday: birthday,
            school: school,
            active: true
        }
    })
    error = ""
    res.redirect('/');
})

app.get('/Classroom', async (req, res) => {
    const token = req.cookies.jwt;
    const userID = jwt.verify(token, 'secret').id;
    const user = await UserModel.find({ _id: userID });
    const classrooms = await ClassroomModel.find({ teacherID: userID });
    if (user[0].active === false || user[0].active === undefined) {
        return res.redirect('/UserDetails');
    }
    res.render('Classroom', {classrooms});
})

app.post('/Classroom', async (req, res) => {

    try {
        // Process your data or save to database here
        const { className, year } = req.body;
        const token = req.cookies.jwt;
        const userID = jwt.verify(token, 'secret').id;
        const user = await UserModel.find({ _id: userID });

        const classroom = await ClassroomModel({
            teacherID: userID,
            teacherName: user[0].name,
            name: className,
            year: year
        });
        await classroom.save();

        res.status(200).json({ message: 'Classroom created successfully' });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

})

app.post('/deleteClass', async (req, res) => {
    try{
        const id = req.body.id;
        await ClassroomModel.deleteOne({ _id: id });
        res.status(200).json({ message: 'Classroom deleted successfully' });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });

    }
})

app.get('/ClassroomDetail/:id', async (req, res) => {
    const token = req.cookies.jwt;
    const userID = jwt.verify(token, 'secret').id;
    const user = await UserModel.find({ _id: userID });

    const id = req.params.id;
    const users = await UserModel.find({ classroomID: id });
    console.log(users)
    if (user[0].active === false || user[0].active === undefined) {
        return res.redirect('/UserDetails');
    }
    res.render('ClassroomDetail', {users});
})

app.listen(port, () => {
    mongoose
        .connect(MONGO_URL)
        .then(() => console.log("Connect to mongoDB successfully"))
        .catch((err) => console.error("Could not connect to MongoDB", err));
    console.log('http://localhost:' + port)
})