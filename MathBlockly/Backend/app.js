require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const { requireAuth, checkUser } = require('./middlewares/authMiddlewares');
const jwt = require('jsonwebtoken');
const { MONGO_URL } = process.env;

const port = process.env.port
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', '/Frontend')));
app.use(cookieParser());
app.use(express.json());
app.use(authRoutes);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// const dbURL = 'mongodb+srv://aceofg5:EFJsa1mzUKHLuIVi@lemathdb.wggjkbl.mongodb.net/?retryWrites=true&w=majority&appName=LeMathDB';

// mongoose
//     .connect(dbURL, 
//     //     {
//     //     useNewUrlParser: true,
//     //     useUnifiedTopology: true,
//     // }
// )
//     .then((result) => {
//         app.listen(3000), () => {
//             console.log('Listening on port 3000');
//         };
//     })
//     .catch((err) => {
//         console.log(err);
//     })

app.get('*', checkUser);

app.get('/', requireAuth, (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'secret', (err, decodedToken) => {
            if (err) {
                res.render('LoginPage');
            } else {
                res.render('HomePage');
            }
        });
    } else {
        res.render('LoginPage');
    }
})

app.get('/home', requireAuth, (req, res) => {
    res.render('HomePage');
    // res.send('Hello World!');
})

app.listen(port, () => {
    mongoose
        .connect(MONGO_URL)
        .then(() => console.log("Connect to mongoDB successfully"))
        .catch((err) => console.error("Could not connect to MongoDB", err));
    console.log('http://localhost:' + port)
})

