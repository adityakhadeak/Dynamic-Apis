const express =require('express')
const router=require('./routes/crudRoutes.js')
const dotenv=require('dotenv')
const routerAuth = require('./routes/authRoutes.js')
const routerRole = require('./routes/roleRoutes.js')
const app=express()

dotenv.config()

app.use(express.json())

//dynamic route
app.use('/api',router)

//login and register
app.use('/api/auth',routerAuth)

//roles
app.use('/api/role',routerRole)
const port=process.env.PORT || 5000



app.listen(port,()=>{
    console.log(`Connected to Port  ${port} `)
})