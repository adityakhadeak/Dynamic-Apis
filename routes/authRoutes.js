const express =require('express')
const { loginUser, createUser } = require('../controllers/authRouteController.js')

const routerAuth=express()

routerAuth.post('/register',createUser)

routerAuth.get('/login',loginUser)

module.exports=routerAuth