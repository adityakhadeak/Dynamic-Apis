const express = require('express')
const { createRole, getRoles } = require('../controllers/roleController')

const routerRole=express()


routerRole.post('/createrole',createRole)

routerRole.get('/getroles',getRoles)

module.exports=routerRole