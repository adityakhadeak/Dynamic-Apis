const express =require('express')
const { loginUser, createUser } = require('../controllers/authRouteController.js')
const {jtoken} =require('../middlewares/authorization.js')
const routerAuth=express()

routerAuth.post('/register',createUser)

routerAuth.get('/login',jtoken,loginUser)

module.exports=routerAuth
