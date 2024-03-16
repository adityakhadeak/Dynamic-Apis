const { body } = require('express-validator')
const pool = require('../database/db.js')

const dynamicController = async (req, res) => {
    try {
        const { operation, table, column_values } = req.body
        const role_id = req.user.role_id
        if (req.user.user_id != column_values.user_id)
            return res.status(403).json({ message: "Invalid user token" })
        switch (operation) {
            case 'create':
                // Handle create operation
                switch (table) {
                    case 'interns':
                        if (role_id === 2) {
                            const { full_name, university, start_date, end_date, user_id } = column_values;
                            if (!full_name || !university || !start_date || !end_date || !user_id) {
                                return res.status(400).json({ message: 'Missing  fields required  for interns' });
                            }
                            const createQuery1 = "INSERT INTO Interns (full_name, university, start_date, end_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *";
                            const createValues1 = [full_name, university, start_date, end_date, user_id];
                            try {
                                const createResult1 = await pool.query(createQuery1, createValues1);
                                if (createResult1.rowCount == 0) throw new Error("Failed to create intern");
                                res.status(200).json({ message: "Intern Created Successfully", data: createResult1.rows[0] });
                            } catch (error) {
                                res.status(500).json({ message: error.message });
                            }
                        } else {
                            res.status(403).json({
                                message: "Access Denied, Only intern can add internship info",
                            });
                        }
                        break;
                    case 'internshipassignments':
                        if (role_id === 1) {
                            const { intern_id, task_description, due_date, user_id } = column_values;
                            if (!intern_id || !task_description || !due_date || user_id) {
                                return res.status(400).json({ message: "Invalid Input Missing input fields" })
                            }
                            const createQuery2 = "INSERT INTO InternshipAssignments ( intern_id, task_description, due_date) VALUES ($1, $2, $3) RETURNING *";
                            const createValues2 = [intern_id, task_description, due_date];
                            try {
                                const createResult2 = await pool.query(createQuery2, createValues2);
                                if (createResult2.rowCount == 0) throw new Error("Failed to create internship assignment");
                                res.status(200).json({ message: "Internship Assignment Created Successfully", data: createResult2.rows[0] });
                            } catch (error) {
                                res.status(500).json({ message: error.message });
                            }
                        } else {
                            res.status(403).json({
                                message: "Access Denied, Only Admin assign internshipassignment",
                            });
                        }
                        break;
                    default:
                        res.status(400).json({ message: 'Invalid table' });
                        break;
                }
                break;

            case 'read':
                // Handle read operation
                switch (table) {
                    case 'interns'://only admin can view all interns info
                        if (Object.entries(column_values).length == 1) {
                            if (role_id == 1) {
                                if((column_values.user_id=="")){
                                    res.status(400).json({message:"missing user_id"})
                                }
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
                            if((column_values.user_id=="" ||intern_id=="")){
                                res.status(400).json({message:"missing user_id"})
                            }
                            const readQuery2 = "SELECT * FROM Interns WHERE intern_id=$1";
                            const readQueryValue2 = [intern_id]
                            const readResult2 = await pool.query(readQuery2, readQueryValue2);
                            if(readResult2.rowCount===0)
                            {
                                return res.status(404).json({message:"Intern Not Found"})
                            }
                            res.status(200).json({
                                message: "Data Retrieved Successfully",
                                data: readResult2.rows[0]
                            });
                        }
                        break;
                    case 'internshipassignments':
                        if (Object.entries(column_values).length == 1) {
                            if (role_id == 1) {//admin only route
                                if((column_values.user_id=="")){
                                    res.status(400).json({message:"missing user_id"})
                                }
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
                            const { assignment_id } = column_values

                            if(assignment_id==""){
                              return  res.status(400).json({message:"missing user_id"})

                            }
                            const readQuery2 = "SELECT * FROM InternshipAssignments WHERE assignment_id=$1";
                            const readQueryValue2 = [assignment_id]
                            const readResult2 = await pool.query(readQuery2, readQueryValue2);
                            if(readResult2.rowCount===0)
                            {
                                return res.status(404).json({message:"Intern Not Found"})
                            }
                            res.status(200).json({
                                message: "Data Retrieved Successfully",
                                data: readResult2.rows
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
                        if (!full_name || !university || !start_date || !end_date || !user_id || !internId1 || !user_id) {
                            return res.status(400).json({ message: 'Missing  fields required  for interns' });
                        }
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
                        if (role_id === 1) {//only admin can update the internshipassignment details 
                            const { assignment_id, intern_id: internId2, task_description, due_date } = column_values
                            if (!assignment_id || !internId2 || !task_description || !due_date) {
                                return res.status(400).json({ message: "Invalid Input Missing input fields" })
                            }
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
                        } else {
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
                        if (role_id === 1) {
                            const { intern_id: internId1 } = column_values;
                            const deleteQuery1 = "DELETE FROM Internshipassignments WHERE intern_id=$1 RETURNING *";
                            const deleteValues1 = [internId1];
                            const deleteQuery2 = "DELETE FROM Interns WHERE intern_id=$1 RETURNING *";
                            const deleteValues2 = [internId1];
                            try {

                                if (!internId1) {
                                    throw new Error("Invalid input data");
                                }
                                const deleteResult1 = await pool.query(deleteQuery1, deleteValues1);
                                const deleteResult2 = await pool.query(deleteQuery2, deleteValues2);

                                if (deleteResult2.rowCount == 0)
                                    throw new Error("Intern Not Found");

                                res.status(200).json({
                                    message: "Data Deleted Successfully",
                                    data: deleteResult1.rows[0]
                                });
                            } catch (error) {
                                res.status(404).json({ message: error.message });
                            }
                        } else {
                            res.status(403).json({
                                message: "Access Denied, Only admin  can perform delete operation",
                            });
                        }
                        break;
                    case 'internshipassignments':
                        if (role_id === 1) {
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
                        } else {
                            res.status(403).json({
                                message: "Access Denied, Only admin  can delete internshipassignment info",
                            });
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
