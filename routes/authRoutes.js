const express = require('express')
const { loginUser, createUser, getUsers, getuserlogindetail, updateUserLoginDetails, deleteUser } = require('../controllers/authRouteController.js')
const jtoken = require('../middlewares/authentication.js')
const { isAdmin, isIntern } = require('../middlewares/authorization.js')
const routerAuth = express()

routerAuth.post('/register', createUser)

routerAuth.post('/login', loginUser)

routerAuth.get('/getusers', jtoken, isAdmin, getUsers)

routerAuth.get('/getuser/:user_id',jtoken,isIntern,getuserlogindetail)

routerAuth.put('/updateuserdetails/:user_id',jtoken,updateUserLoginDetails)

routerAuth.delete('/deleteuser/:user_id',jtoken,deleteUser)


module.exports = routerAuth
