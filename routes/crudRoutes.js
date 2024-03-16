const express=require('express')
const dynamicController = require('../controllers/dyanmicController.js')

const router=express();

// let validInput = ()=>{
//     const { table, column_values } = req.body;

//     // Validate input based on the table 
//     switch (table) {
//         case 'interns':
//             const { full_name, university, start_date, end_date, user_id } = column_values;
//             if (!full_name || !university || !start_date || !end_date || !user_id) {
//                 return res.status(400).json({ message: 'Missing required fields for interns' });
//             }
//             break;
//         case 'internshipassignments':
//             const { assignment_id, intern_id: internId2, task_description, due_date } = column_values;
//             if(!assignment_id || !internId2 ||!task_description||!due_date){
//                  return res.status(400).json({message: "Invalid Input Missing input fields"})
//             }
        
//     }
// }


router.post('/data',dynamicController);

module.exports=router