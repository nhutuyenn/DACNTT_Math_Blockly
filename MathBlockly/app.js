require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const { checkUser, authenticateToken } = require('./middlewares/authMiddlewares');
const {
    calculateTotalDuration,
    totalCorrect,
    getTotalLessonsByType,
    calculateAccuracy,
    calculateAverageLessonTime ,
    calculateAverageScore,
    calculateHighestScore,
} = require('./controllers/analyzeController');
const { renderPartial } = require('./utilities/utils');
const jwt = require('jsonwebtoken');
const { MONGO_URL } = process.env;

const LessonModel = require('./models/lessons');
const QuestionModel = require('./models/questions');
const AnswerModel = require('./models/answers');
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
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).send({ error: 'No token provided' });
    }

    let userId;
    try {
        const decoded = jwt.verify(token, 'secret');
        userId = decoded.id;
    } catch (err) {
        return res.status(401).send({ error: 'Invalid token' });
    }
    res.render('HomePage', { userId });
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
    const user = await UserModel.find({ _id: userID });
    if (user[0].active === false || user[0].active === undefined) {
        return res.redirect('/UserDetails');
    }
    res.redirect('/HistoryPage/' + userID);
})

app.get('/HistoryPage/:id', async (req, res) => {
    const id = req.params.id;
    const results = await ResultModel.find({ accountID: id });
    res.render('HistoryPage', { results });
})

app.post('/HistoryPage/:id', async (req, res) => {
    const token = req.cookies.jwt;
    const userID = jwt.verify(token, 'secret').id;
    const id = req.params.id;
    const findLesson = req.body.findLesson;
    const user = await UserModel.find({ _id: userID });

    var results;

    console.log(findLesson);
    if (findLesson)
        results = await ResultModel.find({ accountID: id, lessonName: findLesson });
    else
        results = await ResultModel.find({ accountID: id });
    res.render('HistoryPage', { results, user});
})

app.get('/LessonPage', async (req, res) => {
    const lessons = await LessonModel.find();
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).send({ error: 'No token provided' });
    }

    let userId;
    try {
        const decoded = jwt.verify(token, 'secret');
        userId = decoded.id;
    } catch (err) {
        return res.status(401).send({ error: 'Invalid token' });
    }
    res.render('LessonPage', { lessons, userId });
})

app.post('/LessonPage', async (req, res) => {
    const { lessonInput } = req.body;
    res.redirect('/StudyPage/' + lessonInput);
})


app.get('/AnalyzePage/:userId', authenticateToken, async (req, res) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).send({ error: 'No token provided' });
    }

    let userId;
    try {
        const decoded = jwt.verify(token, 'secret');
        userId = decoded.id;
    } catch (err) {
        return res.status(401).send({ error: 'Invalid token' });
    }

    const typeofLesson = req.query.type || "Số học";
    const timeRange = req.query.time || '14d';  // Ensure this matches the query parameter

    // Parse time range
    const endDate = new Date();
    let startDate;
    switch (timeRange) {
        case '1d':
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 1);
            break;
        case '7d':
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
            break;
        case '14d':
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 14);
            break;
        case '30d':
            startDate = new Date();
            startDate.setMonth(endDate.getMonth() - 1);
            break;
        default:
            startDate = new Date();
            startDate.setMonth(endDate.getMonth() - 1);
            break;
    }

    const results = await ResultModel.find({ accountID: userId , createAt: { $gte: startDate, $lt: endDate }});
    const totalDuration = await calculateTotalDuration(results);
    const correct = await totalCorrect(results);
    const lessons = await LessonModel.find({ type: typeofLesson });
    const lessonIds = lessons.map(lesson => lesson._id);
    const resultSorted = await ResultModel.find({
        accountID: userId,
        lessonID: { $in: lessonIds },
        createAt: { $gte: startDate, $lt: endDate }
    });

    const totalLessonsLearned =await getTotalLessonsByType(userId, typeofLesson, { startDate, endDate } );
    const accuracy = await calculateAccuracy(userId, typeofLesson, { startDate, endDate });
    const avgTime = await calculateAverageLessonTime(userId, typeofLesson, { startDate, endDate });
    const avgScore = await calculateAverageScore(userId, typeofLesson, { startDate, endDate });
    const highestScore = await calculateHighestScore(userId, typeofLesson, { startDate, endDate });

    if (req.xhr) { // If the request is an AJAX request
        const partialHtml = await renderPartial('./views/templates/statistics-row.ejs', './views/templates/statistics-table.ejs', './views/templates/render-content-analyze.ejs', { results, lessons, totalDuration, resultSorted, correct, userId, totalLessonsLearned, typeofLesson, accuracy, avgTime, avgScore, highestScore });
        res.json({ html: partialHtml });
    } else {
        res.render('AnalyzePage', { results, lessons, totalDuration, resultSorted, correct, userId, totalLessonsLearned, typeofLesson, accuracy, avgTime, avgScore, highestScore });
    }
});



app.get('/home', (req, res) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).send({ error: 'No token provided' });
    }

    let userId;
    try {
        const decoded = jwt.verify(token, 'secret');
        userId = decoded.id;
    } catch (err) {
        return res.status(401).send({ error: 'Invalid token' });
    }
    res.render('HomePage', { userId });
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

app.post('/addStudent', async (req, res) => {
    try{
        const { classroomId, studentId } = req.body;
        const student = await UserModel.find({ _id: studentId });
        if (student.length > 0) {
            if (student[0].active === true) {
                await UserModel.updateOne({ _id: studentId }, {
                    $addToSet: {
                        classroomID: classroomId
                    }
                })
            }
        }
        res.status(200).json({ message: 'Classroom deleted successfully' });
    }
    catch(error){
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post('/deleteStudent', async (req, res) => {
    try{
        const { classroomId, studentId } = req.body;
        await UserModel.updateOne({ _id: studentId }, {
            $pull: {
                classroomID: classroomId
            }
        })
        res.status(200).json({ message: 'Classroom deleted successfully' });
    }
    catch(error){
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/ClassroomDetail/:id', async (req, res) => {
    const token = req.cookies.jwt;
    const userID = jwt.verify(token, 'secret').id;
    const user = await UserModel.find({ _id: userID });
    const id = req.params.id;
    const users = await UserModel.find({ classroomID: id });
    const classroom = await ClassroomModel.findOne({ _id: id });

    if (user[0].active === false || user[0].active === undefined) {
        return res.redirect('/UserDetails');
    }
    res.render('ClassroomDetail', {users, id, classroom});
})

app.listen(port, () => {
    mongoose
        .connect(MONGO_URL)
        .then(() => console.log("Connect to mongoDB successfully"))
        .catch((err) => console.error("Could not connect to MongoDB", err));
    console.log('http://localhost:' + port)
})