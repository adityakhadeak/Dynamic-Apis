const { json } = require('express');
const pool = require('../database/db.js')

const dynamicController = async (req, res) => {
    try {
        const { operation, table, column_values } = req.body
        const { role_id } = req.role_id

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
                        if (Object.entries(column_values).length == 0) {
                            if (role_id == 1) {

                                const readQuery1 = "SELECT * FROM Interns";
                                const readResult1 = await pool.query(readQuery1);
                                res.status(200).json({
                                    message: "Data Retrieved Successfully",
                                    data: readResult1.rows
                                });
                            } else {
                                res.status(403).json({
                                    message: "Access Denied, Only Admin can view all interns",
                                });
                            }
                        } else {//open to all admin and intern
                            const { intern_id } = column_values
                            const readQuery2 = "SELECT * FROM Interns WHERE intern_id=$1";
                            const readQueryValue2 = [intern_id]
                            const readResult2 = await pool.query(readQuery2, readQueryValue2);
                            res.status(200).json({
                                message: "Data Retrieved Successfully",
                                data: readResult2.rows[0]
                            });
                        }
                        break;
                    case 'internshipassignments':
                        if (Object.entries(column_values).length == 0) {
                            if (role_id == 1) {//admin only route
                                const readQuery1 = "SELECT * FROM InternshipAssignments";
                                const readResult1 = await pool.query(readQuery1);
                                res.status(200).json({
                                    message: "Data Retrieved Successfully",
                                    data: readResult1.rows
                                });
                            } else {
                                res.status(403).json({
                                    message: "Access Denied, Only Admin can view all internshipassignment",
                                });
                            }
                        } else {//open to all admin and intern
                            const { intern_id } = column_values
                            const readQuery2 = "SELECT * FROM InternshipAssignments WHERE intern_id=$1";
                            const readQueryValue2 = [intern_id]
                            const readResult2 = await pool.query(readQuery2, readQueryValue2);
                            res.status(200).json({
                                message: "Data Retrieved Successfully",
                                data: readResult2.rows[0]
                            });
                        }
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

                        const internDataQuery = "SELECT * FROM Intern WHERE intern_id=$1"
                        const internValue = [internId1]
                        const internDataResult = await pool.query(internDataQuery, internValue)

                        const internData = internDataResult.rows[0]
                        if (internData.start_date === start_date && internData.end_date === end_date) {
                            if (role_id === 2) {//user can update only his info not enddate and start date
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
                            } else {
                                res.status(403).json({
                                    message: "Access Denied, Only Intern can update his info",
                                });
                            }
                        } else if(internData.full_name===full_name && internData.university===university) {
                            if (role_id === 1) {//admin can update only start and end date and not interns personal info
                                const updateQuery1 = "UPDATE Interns SET full_name=$1, university=$2, start_date=$3, end_date=$4 WHERE intern_id=$5 RETURNING *"
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
                            }
                            else{
                                res.status(403).json({
                                    message: "Access Denied, Only admin  can update start and end date of internship info",
                                });
                            }
                        }
                        break;
                    case 'internshipassignments':
                        if(role_id===1){//only admin can update the internshipassignment details 
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
                    }else{
                        res.status(403).json({
                            message: "Access Denied, Only admin  can update internshipassignment info",
                        });
                    }
                        break;
                    default:
                        res.status(400).json({ message: 'Invalid table name' });
                        return;
                }
                break;
            case 'delete':
                // Handle delete operation
                switch (table) {
                    case 'interns':
                        const { intern_id: internId1 } = column_values;
                        const deleteQuery1 = "DELETE FROM Interns WHERE intern_id=$1 RETURNING *";
                        const deleteValues1 = [internId1];
                        try {

                            if (!internId1) {
                                throw new Error("Invalid input data");
                            }
                            const deleteResult1 = await pool.query(deleteQuery1, deleteValues1);
            
                            if (deleteResult1.rowCount == 0)
                                throw new Error("Intern Not Found");
            
                            res.status(200).json({
                                message: "Data Deleted Successfully",
                                data: deleteResult1.rows[0]
                            });
                        } catch (error) {
                            res.status(404).json({ message: error.message });
                        }
                        break;
                    case 'internshipassignments':
                        const { assignment_id } = column_values;
                        const deleteQuery2 = "DELETE FROM InternshipAssignments WHERE assignment_id=$1 RETURNING *";
                        const deleteValues2 = [assignment_id];
                        try {
                            const deleteResult2 = await pool.query(deleteQuery2, deleteValues2);
            
                            if (deleteResult2.rowCount == 0)
                                throw new Error("Assignment Not Found");
            
                            res.status(200).json({
                                message: "Data Deleted Successfully",
                                data: deleteResult2.rows[0]
                            });
                        } catch (error) {
                            res.status(404).json({ message: error.message });
                        }
                        break;
                    default:
                        res.status(400).json({ message: 'Invalid table' });
                        break;
                }
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
