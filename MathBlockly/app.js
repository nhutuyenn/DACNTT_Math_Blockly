require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const { checkUser} = require('./middlewares/authMiddlewares');
const {
    calculateTotalDuration,
    totalCorrect,
    getTotalLessonsByType,
    calculateAccuracy,
    calculateAverageLessonTime,
    calculateAverageScore,
    calculateHighestScore,
} = require('./controllers/analyzeController');
const { renderPartial } = require('./utilities/utils');
const jwt = require('jsonwebtoken');
const { MONGO_URL } = process.env;

const LessonModel = require('./models/lessons');
const ResultModel = require('./models/result');
const ClassroomModel = require('./models/classroom')
const UserModel = require('./models/User');

const bodyParser = require('body-parser');
const app = express();

let error = "";

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(bodyParser.json());
app.use(session({ secret: 'yourSecret', resave: false, saveUninitialized: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static('assets'));
app.use(express.static(__dirname + '/assets'));
app.use(cookieParser());
app.use(express.json());
app.use(authRoutes);
app.use("/", require('./routes/studyRoutes'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('*', checkUser);

app.get('/', async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        // Redirect to login page if no token is provided
        return res.redirect('/home');
    }
    try {
        const userId = jwt.verify(token, 'secret').id;
        res.render('HomePage', { userId });
    } catch (error) {
        // Redirect to login page if token is invalid
        return res.redirect('/home');
    }
})

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'aceofg5@gmail.com',
        pass: 'tkil errv eavs tbsa',
    },
});

// Routes
app.get('/forgot', (req, res) => {
    res.render('ForgotPassword', { error: null });
});

app.post('/forgot', async (req, res) => {
    const email = req.body.email;
    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.render('ForgotPassword', { error: 'Email không tồn tại' });
    }

    const otp = crypto.randomBytes(3).toString('hex');
    const otpExpires = Date.now() + 3600000; // 1 hour

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save({ validateModifiedOnly: true });
    const mailOptions = {
        to: email,
        from: 'aceofg5@gmail.com',
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is ${otp}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            return res.status(500).send('Error sending email');
        }
        res.redirect(`/verify/${email}`);
    });
});

app.get('/verify/:email', (req, res) => {
    res.render('VerifyOTP', { email: req.params.email, error: null });
});

app.post('/verify/:email', async (req, res) => {
    const { otp } = req.body;
    const user = await UserModel.findOne({ email: req.params.email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
        return res.render('VerifyOTP', {email: req.params.email, error: 'OTP không đúng hoặc đã hết hạn' });
    }

    res.render('ResetPassword', { email: req.params.email, error: null });
});

app.get('/reset/:email', (req, res) => {
    res.render('ResetPassword', { email: req.params.email, error: null });
});

app.post('/reset/:email', async (req, res) => {
    const { password } = req.body;
    const user = await UserModel.findOne({ email: req.params.email });

    try {
        user.password = password; // Đặt lại mật khẩu mới (được mã hóa bởi middleware 'pre')
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({ validateModifiedOnly: true });

        res.redirect('/login');
    } catch (error) {
        res.render('ResetPassword', { email: req.params.email, error: 'Mật khẩu phải có tối thiểu 6 kí tự' });
    }
});

app.get('/HistoryPage', async (req, res) => {
    const token = req.cookies.jwt;
    const userID = jwt.verify(token, 'secret').id;
    const user = await UserModel.find({ _id: userID });
    if (user[0].active === false || user[0].active === undefined) {
        return res.redirect('/UserDetails');
    }
    res.redirect('/HistoryPage/' + userID + '/1');
})

app.get('/HistoryPage/:id/:page?', async (req, res) => {
    const id = req.params.id;
    const page = parseInt(req.params.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const results = await ResultModel.find({ accountID: id })
                                    .skip(skip)
                                    .limit(pageSize)
                                    .exec();

    const totalResults = await ResultModel.countDocuments({ accountID: id }).exec();
    const totalPages = Math.ceil(totalResults / pageSize);
    res.render('HistoryPage', { results, page, totalPages, id });
})

app.post('/HistoryPage/:id/:page?', async (req, res) => {
    const token = req.cookies.jwt;
    const userID = jwt.verify(token, 'secret').id;
    const id = req.params.id;
    const findLesson = req.body.findLesson;
    const page = parseInt(req.params.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const user = await UserModel.find({ _id: userID });

    var results;

    if (findLesson)
        results = await ResultModel.find({ accountID: id, lessonName: findLesson })
                                    .skip(skip)
                                    .limit(pageSize)
                                    .exec();
    else
        results = await ResultModel.find({ accountID: id });
    const totalResults = await ResultModel.countDocuments({ accountID: id }).exec();
    const totalPages = Math.ceil(totalResults / pageSize);
    res.render('HistoryPage', {user, results, page, totalPages, id });
})

app.post('/Search', async (req, res) => {
    const search = req.body.search;
    const token = req.cookies.jwt;

    if (!token) {
        return res.redirect('/home');
    }

    let userId;
    try {
        const decoded = jwt.verify(token, 'secret');
        userId = decoded.id;
    } catch (err) {
        return res.redirect('/home');
    }
    const lessons = await LessonModel.find({ name: search });
    const user = await UserModel.find({ _id: userId });

    res.render('LessonPage', { lessons,userId, user });
})

app.get('/LessonPage', async (req, res) => {
    const lessons = await LessonModel.find();
    const token = req.cookies.jwt;

    if (!token) {
        return res.redirect('/home');
    }

    let userId;
    try {
        const decoded = jwt.verify(token, 'secret');
        userId = decoded.id;
    } catch (err) {
        return res.redirect('/home');
    }
    res.render('LessonPage', { lessons, userId });
})

app.post('/LessonPage', async (req, res) => {
    const { lessonInput } = req.body;
    res.redirect('/StudyPage/' + lessonInput);
})

app.get('/AnalyzePage/:userId', async (req, res) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.redirect('/home');
    }

    let userId;
    try {
        const decoded = jwt.verify(token, 'secret');
        userId = decoded.id;
    } catch (err) {
        return res.status(401).send({ error: 'Invalid token' });
    }

    const typeofLesson = req.query.type || "Số học";
    const timeRange = req.query.time  // Ensure this matches the query parameter
    // Parse time range
    const offset = 7; // Vietnam is UTC+7
    const now = new Date();
    const endDate = new Date(now.getTime() + (offset * 60 * 60 * 1000));
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
        case '90d':
            startDate = new Date();
            startDate.setMonth(endDate.getMonth() - 3);
            break;
        default:
            startDate = new Date();
            startDate.setMonth(endDate.getMonth() - 12);
            break;
    }

    let results;

    if (timeRange === 'all' || timeRange === undefined) {
        results = await ResultModel.find({
            accountID: userId});
    }
    else {
        results = await ResultModel.find({
            accountID: userId,
            createAt: { $gte: startDate, $lt: endDate }
        });
    }
    const totalDuration = await calculateTotalDuration(results);
    const correct = await totalCorrect(results);

    let lessons;

    if (typeofLesson === 'all') {
        lessons = await LessonModel.find();
    } else {
        lessons = await LessonModel.find({ type: typeofLesson });
    }
    const lessonIds = lessons.map(lesson => lesson._id);
    const resultSorted = await ResultModel.find({
        accountID: userId,
        lessonID: { $in: lessonIds },
        createAt: { $gte: startDate, $lt: endDate }
    });

    const tmp = await ResultModel.find({
        accountID: userId,
        lessonID: { $in: lessonIds }
    });

    // const resultSorted = [...resultSorted1].reverse();
    const totalLessonsLearned = await getTotalLessonsByType(userId, typeofLesson, { startDate, endDate });
    const accuracy = await calculateAccuracy(userId, typeofLesson, { startDate, endDate });
    const avgTime = await calculateAverageLessonTime(userId, typeofLesson, { startDate, endDate });
    const avgScore = await calculateAverageScore(userId, typeofLesson, { startDate, endDate });
    const highestScore = await calculateHighestScore(userId, typeofLesson, { startDate, endDate });

    if (req.xhr) { // If the request is an AJAX request
        const partialHtml = await renderPartial(
            './views/templates/statistics-row.ejs',
            './views/templates/statistics-table.ejs',
            './views/templates/render-content-analyze.ejs',
            {
                results,
                lessons,
                totalDuration,
                resultSorted,
                correct,
                userId,
                totalLessonsLearned,
                typeofLesson,
                accuracy,
                avgTime,
                avgScore,
                highestScore
            });
        res.json({ html: partialHtml });
    } else {
        res.render('AnalyzePage', {
            results,
            lessons,
            totalDuration,
            resultSorted,
            correct,
            userId,
            totalLessonsLearned,
            typeofLesson,
            accuracy,
            avgTime,
            avgScore,
            highestScore
        });
    }
});



app.get('/home', (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        // Redirect to login page if no token is provided
        // Use return here to exit the function after sending the response
        return res.render('HomePage');
    }
    try {
        const userId = jwt.verify(token, 'secret').id;
        // Render HomePage with userId and return immediately after
        return res.render('HomePage', { userId });
    } catch (error) {
        // Redirect to login page if token is invalid
        // Use return here as well
        return res.render('HomePage');
    }
});

app.get('/UserDetails', async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.redirect('/home');
    }
    const userID = jwt.verify(token, 'secret').id;
    const user = await UserModel.find({ _id: userID });

    res.render('UserDetails', { user, error });
})

app.post('/UserDetails', async (req, res) => {
    const { id, fullName, email, phone, birthday, school } = req.body;
    if (fullName === '' || email === '' || phone === '' || birthday === '' || school === '') {
        error = "Hãy nhập tất cả các thông tin cần thiết"
        const user = await UserModel.find({ _id: id });
        return res.render('UserDetails', { user, error });
    }

    await UserModel.updateOne({ _id: id }, {
        $set: {
            name: fullName,
            email: email,
            phone: phone,
            dateBirth: birthday,
            school: school,
            active: true
        }
    })
    error = ""
    res.redirect('/');
})

app.get('/Classroom', async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.redirect('/home');
    }
    const userID = jwt.verify(token, 'secret').id;
    const user = await UserModel.find({ _id: userID });
    const classrooms = await ClassroomModel.find({ teacherID: userID });
    if (user[0].active === false || user[0].active === undefined) {
        return res.redirect('/UserDetails');
    }
    res.render('Classroom', { classrooms, user });
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
    try {
        const id = req.body.id;
        await ClassroomModel.deleteOne({ _id: id });
        res.status(200).json({ message: 'Classroom deleted successfully' });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });

    }
})

app.post('/addStudent', async (req, res) => {
    try {
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
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post('/deleteStudent', async (req, res) => {
    try {
        const { classroomId, studentId } = req.body;
        await UserModel.updateOne({ _id: studentId }, {
            $pull: {
                classroomID: classroomId
            }
        })
        res.status(200).json({ message: 'Classroom deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/ClassroomDetail/:id', async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.redirect('/home');
    }
    const userID = jwt.verify(token, 'secret').id;
    const user = await UserModel.find({ _id: userID });
    const id = req.params.id;
    const users = await UserModel.find({ classroomID: id });
    const classroom = await ClassroomModel.findOne({ _id: id });
    const teacher = await UserModel.find({ _id: classroom.teacherID });

    if (user[0].active === false || user[0].active === undefined) {
        return res.redirect('/UserDetails');
    }
    if (user[0].role === "teacher") {
        res.render('ClassroomDetail', { users, id, classroom, teacher });
    }
    else {
        return res.redirect('/');
    }
})

app.get('/forgot', (req, res) => {
    res.render('ForgotPassword');
});

app.listen(process.env.PORT || 5000, () => {
    mongoose
        .connect(MONGO_URL)
        .then(() => console.log("Connect to mongoDB successfully"))
        .catch((err) => console.error("Could not connect to MongoDB", err));
    console.log('http://localhost:' + process.env.PORT)
})