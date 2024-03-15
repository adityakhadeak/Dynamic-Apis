const { json } = require('express');
const pool = require('../database/db.js')

const dynamicController = async (req, res) => {
    try {
        const { operation, table, column_values } = req.body


        switch (operation) {
             case 'create':
                    const { full_name, university, start_date, end_date, user_id } = column_values
                    const createQuery = "INSERT INTO Interns (full_name, university, start_date, end_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *"
                    const createValues = [full_name, university, start_date, end_date, user_id]
                    const createResult = await pool.query(createQuery, createValues)
        
                    if (createResult.rowCount == 0)
                        return res.status(200).json({
                            message: "Intern Not Created",
                        });
        
                    res.status(200).json({
                        message: "Intern Created Successfully",
                        data: createResult.rows[0]
                    });
                break;
                
            case 'read':
                // Handle read operation
                switch (table) {
        case 'interns':
            const readQuery1 = "SELECT * FROM Interns";
            const readResult1 = await pool.query(readQuery1);
            res.status(200).json({
                message: "Data Retrieved Successfully",
                data: readResult1.rows
            });
            break;
        case 'internshipassignments':
            const readQuery2 = "SELECT * FROM InternshipAssignments";
            const readResult2 = await pool.query(readQuery2);
            res.status(200).json({
                message: "Data Retrieved Successfully",
                data: readResult2.rows
            });
            break;
        default:
            res.status(400).json({ message: 'Invalid table name' });
            return;
    }
    break;
            case 'update':
                // Handle update operation based on table
                switch (table) {
                    case 'interns':
                        const { intern_id: internId1, full_name, university, start_date, end_date, user_id } = column_values
                        const updateQuery1 = "UPDATE Interns SET full_name=$1, university=$2, start_date=$3,  end_date=$4 WHERE intern_id=$5 RETURNING *"
                        const updateValues1 = [full_name, university, start_date, end_date, internId1]
                        const updateResult1 = await pool.query(updateQuery1, updateValues1);

                        if (updateResult1.rowCount == 0)
                            return res.status(200).json({
                                message: "Intern Not Found",
                            });

                        res.status(200).json({
                            message: "Data Updated Successfully",
                            data: updateResult1.rows[0]
                        });
                        break;
                    case 'internshipassignments':
                        const { assignment_id, intern_id: internId2, task_description, due_date } = column_values
                        const updateQuery2 = "UPDATE InternshipAssignments SET task_description=$1, due_date=$2 WHERE assignment_id=$3 RETURNING *"
                        const updateValues2 = [task_description, due_date, assignment_id]
                        const updateResult2 = await pool.query(updateQuery2, updateValues2);

                        if (updateResult2.rowCount == 0)
                            return res.status(200).json({
                                message: "Assignment Not Found",
                            });

                        res.status(200).json({
                            message: "Data Updated Successfully",
                            data: updateResult2.rows[0]
                        });
                        break;
                    default:
                        res.status(400).json({ message: 'Invalid table name' });
                        return;
                }
                break;
            case 'delete':
                // Handle delete operation
                break;
            default:
                res.status(400).json({ message: 'Invalid operation type' });
                return;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = dynamicController
