const { body } = require('express-validator')
const pool = require('../database/db.js')

const dynamicController = async (req, res) => {
    try {
        const { operation, table1, table2, join_column, column_values } = req.body
        const role_id = req.user.role_id

        // Check if the user is authorized to perform the operation
        if (role_id !== 1) { // Assuming role_id 1 is for admin
            return res.status(403).json({ message: "Access Denied, Only admin can perform this operation" })
        }

        switch (operation) {
            case 'read':

                if (!table1 || !table2 || !join_column) {
                    return res.status(400).json({ message: 'Missing required parameters' })
                }

                let joinQuery = `
                    SELECT *
                    FROM ${table1} 
                    INNER JOIN ${table2} ON ${table1}.${join_column} = ${table2}.${join_column}
                `
                let queryParams = []

                //  if filter values are provided
                if (Object.keys(column_values).length > 0) {
                    joinQuery += 'WHERE '

                    // Ading filter conditions
                    const filterConditions = Object.keys(column_values).map((key, index) => {
                        queryParams.push(column_values[key])
                        return `${key} = $${index + 1}`
                    })

                    joinQuery += filterConditions.join(' AND ')
                }

                console.log(joinQuery)
                // Execute the query
                const result = await pool.query(joinQuery, queryParams)

                // Return the result
                res.status(200).json({
                    message: 'Data Retrieved Successfully',
                    data: result.rows
                })
                break
            default:
                res.status(400).json({ message: 'Invalid operation type' })
                break
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

module.exports = dynamicController  
