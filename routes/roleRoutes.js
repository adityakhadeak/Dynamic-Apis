const express = require('express')
const { createRole, getRoles } = require('../controllers/roleController')
const { isAdmin } = require('../middlewares/authorization')

const routerRole=express()


routerRole.post('/createrole',isAdmin,createRole)

routerRole.get('/getroles', isAdmin,getRoles)

module.exports=routerRole