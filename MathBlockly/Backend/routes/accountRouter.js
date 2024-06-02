/*const express = require('express')
const Router = express.Router()
const bcrypt = require('bcrypt')

Router.get('/', (req, res) => {
    res.json({
        code: 0,
        message: 'Account router'
    })
})

Router.get('/login', (req, res) => {
    res.json({
        code: 0,
        message: 'login router'
    })
})

Router.get('/register', (req, res) => {
    let {userName, password, email} = req.body
    let hash = bcrypt.hash(password, 8)
    res.json({
        code: 0,
        message: 'register router'
    })
})

module.exports(Router)*/