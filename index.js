const express =require('express')
const router=require('./routes/crudRoutes.js')
const dotenv=require('dotenv')
const app=express()

dotenv.config()

app.use(express.json())

//dynamic route
app.use('/api',router)



const port=process.env.PORT || 5000



app.listen(port,()=>{
    console.log(`Connected to Port  ${port} `)
})