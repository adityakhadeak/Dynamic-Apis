const express = require('express')
const { createRole, getRoles } = require('../controllers/roleController')
const { isAdmin } = require('../middlewares/authorization')
const jtoken = require('../middlewares/authentication')

const routerRole=express()


routerRole.post('/createrole',jtoken,isAdmin,createRole)

routerRole.get('/getroles',jtoken, isAdmin,getRoles)

module.exports=routerRole