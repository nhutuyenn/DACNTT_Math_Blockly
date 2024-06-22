const jwt = require('jsonwebtoken');
const User = require('../models/User');

// const requireAuth = (req, res, next) => {
//     const token = req.cookies.jwt;
//     if (token) {        
//         jwt.verify(token, 'secret', (err, decodedToken) => {
//             if (err) {  
//                 console.log(err);   
//                 res.redirect('/login');
//             } else {
//                 next();
//             }
//         });
//     } else {
//         res.redirect('/login');
//     }
// };

const checkUser = (req, res, next) => { 
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'secret', async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

function authenticateToken(req, res, next) {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).send({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, 'secret');
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).send({ error: 'Invalid token' });
    }
}

module.exports = { 
    // requireAuth,
    authenticateToken,
    checkUser
 };