const express = require('express')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express()
const bodyParser = require('body-parser')
const LessonModel = require('../models/lessons');
const ValidationModel = require('../models/validation');
const ResultModel = require('../models/result');
const QuestionModel = require('../models/questions');
const AnswerModel = require('../models/answers');
const UserModel = require('../models/User');
const LessonAnswerModel = require('../models/lessonAnswer');

const jwt = require('jsonwebtoken');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'yourSecret', resave: false, saveUninitialized: true }));
app.use(cookieParser());

module.exports = {
    study_get: async (req, res) => {
        const lesson = await LessonModel.find();
        const question = await QuestionModel.find();
        const answer = await AnswerModel.find();
        console.log(lesson);
        console.log(question.direction);
        console.log(answer.answer);
        res.render('StudyPage');
    }
}

module.exports.getStudyPage = async (req, res) => {
    const id = req.params.id;
    const lessons = await LessonModel.find({ _id: id });
    const questions = await QuestionModel.find({ lessonID: id });
    const lessonAnswers = await LessonAnswerModel.find({
        lessonID: lessons[0]._id});

    const answer = lessonAnswers.map(lessonAnswer => lessonAnswer.answerID);
    const answers = await AnswerModel.find({
        _id: { $in: answer }
    });

    const token = req.cookies.jwt;
    const userID = jwt.verify(token, 'secret').id;
    const user = await UserModel.find({ _id: userID });
    if (user[0].active === false || user[0].active === undefined) {
        return res.redirect('/UserDetails');
    }

    res.render('StudyPage', { lessons, questions, answers, user });
}

module.exports.postStudyPage = async (req, res) => {
    const id = req.params.id;
    var countdownValue = req.body.countdownValue;
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

    var timeLesson = lessons[0].time.toString();
    timeLesson = timeLesson.split(' : ')
    timeLesson = parseInt(timeLesson[0]) * 3600 + parseInt(timeLesson[1]) * 60 + parseInt(timeLesson[2])

    countdownValue = countdownValue.split(' : ')
    countdownValue = parseInt(countdownValue[0]) * 3600 + parseInt(countdownValue[1]) * 60 + parseInt(countdownValue[2]);

    const resultSecond = timeLesson - countdownValue;
    var resultTime = new Date(0);
    resultTime.setSeconds(resultSecond);
    resultTime = resultTime.toISOString().substring(11, 19).replace(/:/g, ' : ');

    const result = new ResultModel({
        lessonID: id,
        lessonName: lessons[0].name,
        accountID: userID,
        score: score,
        time: resultTime,
        createAt: date
    });
    await result.save();
    res.redirect('/HistoryPage');
}