const express =require('express')
const { loginUser, createUser, getUsers } = require('../controllers/authRouteController.js')
const jtoken =require('../middlewares/authentication.js')
const routerAuth=express()

routerAuth.post('/register',createUser)

routerAuth.post('/login',jtoken,loginUser)

routerAuth.get('/getusers',getUsers)

module.exports=routerAuth
