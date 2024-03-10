const pool = require('../database/db.js')

const createUser = async (req, res) => {

    const { username, email, password, role_id } = req.body

    try {

        const newUserQuery = 'INSERT INTO Users (username,email,password,role_id) VALUES ($1,$2,$3,$4) RETURNING *'
        const newUserValues = [username, email, password, role_id]

        const newUserResult = await pool.query(newUserQuery, newUserValues);

        res.status(201).json({
            message: "User Created Successfully",
            data: newUserResult.rows[0]
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }

}

const loginUser = async (req, res) => {

    const { username, password } = req.body

    try {
        const loginQuery = 'SELECT * FROM Users WHERE username=$1'
        const loginValues = [username]
        const loginResult = await pool.query(loginQuery, loginValues)

        if (loginResult.rowCount == 0)
            return res.status(401).json({
                message: "User not found"
            })
        const userPass = loginResult.rows[0].password

        if(userPass!=password)
        return res.status(401).json({
            message:"Incorrect Password"
        })

        res.status(200).json({
            message:"User Logged in successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }

}

module.exports={loginUser,createUser}