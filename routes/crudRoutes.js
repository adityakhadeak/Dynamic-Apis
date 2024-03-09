const express=require('express')
const dynamicController = require('../controllers/dyanmicController.js')

const router=express()

router.post('/data',dynamicController)

module.exports=router