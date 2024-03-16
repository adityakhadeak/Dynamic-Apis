const pool = require('../database/db.js')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken')
const { validationResult, body, param } = require('express-validator');

const createUser = async (req, res) => {

    const validationRules = [
        body('username',"username cannot be empty").notEmpty().isString().escape(),
        body('email',"Enter a valid email address").notEmpty().isEmail().normalizeEmail(),
        body('password',"Password must be of atleast 7 characters").notEmpty().isString().isLength({min:7}),
        body('role_id').notEmpty().isNumeric().toInt()
    ];

    await Promise.all(validationRules.map(validation => validation.run(req)))

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password, role_id } = req.body
 console.log(username,email,password,role_id)
    try {
        const hashedPassword = await bcrypt.hash(password, 10)


        const isUserExistQuery = 'SELECT * FROM Users WHERE username = $1 OR email = $2'
        const isUserExistValues = [username, email]
        const isUserExistResult = await pool.query(isUserExistQuery, isUserExistValues)
        console.log(isUserExistResult)
        if (isUserExistResult.rowCount != 0) {
            return res.status(409).json({
                message: "User with this email or username already exists"
            })
        }


        const newUserQuery = 'INSERT INTO Users (username,email,password,role_id) VALUES ($1,$2,$3,$4) RETURNING *'
        const newUserValues = [username, email, hashedPassword, role_id]

        const newUserResult = await pool.query(newUserQuery, newUserValues);
        const userId = newUserResult.rows[0].user_id
        console.log(newUserResult)
        const userData = {
            user: {
                user_id:userId,
                username,
                role_id
            }
        }
        console.log(userData)
        const token = await jwt.sign(userData, process.env.JWT_SECRET)

        console.log(token)
        res.status(201).json({
            message: "User Created Successfully",
            data: {
                username,
                email,
                role_id
            },
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }

}

const loginUser = async (req, res) => {

    const validationRules = [
        body('username',"Username cannot be empty").notEmpty().isString().escape(),
        body('password').notEmpty().isString(),
    ];

    await Promise.all(validationRules.map(validation => validation.run(req)))

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { username, password } = req.body

    try {
        const loginQuery = 'SELECT * FROM Users WHERE username=$1'
        const loginValues = [username]
        const loginResult = await pool.query(loginQuery, loginValues)
        const user = loginResult.rows[0]

        if (!user)
            return res.status(401).json({
                message: "User not found"
            })

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect Password' })
        }

        const userData = {
            user: {
                user_id: user.user_id,
                username,
                role_id: user.role_id
            }
        }
        // generate token
        const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: "3d" })
        res.status(200).json({
            message: "User Logged in successfully",
            token: token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }

}


const getUsers = async (req, res) => {
    try {
        const getUsersQuery = 'SELECT * FROM Users'
        const usersResult = await pool.query(getUsersQuery)
        const users = usersResult.rows

        users.forEach((user) => {
            delete user.password
        })
        res.status(200).json({
            message: "Data fetched",
            data: users
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal server error",
            error
        })
    }
}

const getuserlogindetail = async (req, res) => {
    const userId = req.params.user_id
    if(userId!=req.user.user_id)
    {
        return res.status(403).json({
            message:"Invalid User Token"
        })
    }
    try {
        const getUserQuery = 'SELECT * FROM Users WHERE user_id=$1'
        const getUserValues = [userId]
        const usersResult = await pool.query(getUserQuery, getUserValues)
        const user = usersResult.rows[0]


        delete user.password

        res.status(200).json({
            message: "Data fetched",
            data: user
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal server error",
            error
        })
    }
}

const updateUserLoginDetails = async (req, res) => {

    const validationRules = [
        body('username').notEmpty().isString().escape(),
        body('email').notEmpty().isEmail().normalizeEmail(),
        body('password', "Password required").notEmpty().isString(),
        param('user_id', "User ID should be numeric").isNumeric().toInt()
    ];

    await Promise.all(validationRules.map(validation => validation.run(req)))

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { user_id } = req.params
    if (user_id != req.user.user_id) {
        return res.status(403).json({
            message: "Invalid User Token",
        })
    }
    try {
        const { username, email, password } = req.body
        const userCheckQuery = 'SELECT * FROM Users WHERE username=$1'
        const userCheckValue = [username]
        const userCheckResult = await pool.query(userCheckQuery, userCheckValue)
        const user = userCheckResult.rows[0]

        if (!user) {
            return res.status(404).json({
                message: "User Not Found"
            })
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect Password' })
        }


        const updateQuery = 'UPDATE Users SET username = $1, email = $2 WHERE user_id = $3 RETURNING *'
        const updateValues = [username, email, user_id]
        const updatedResult = await pool.query(updateQuery, updateValues)

        if (updatedResult.rowCount === 0) {
            return res.status(404).json({
                message: "User not found",
            })
        }

        const updatedUser = updatedResult.rows[0]
        delete updatedUser['password']
        res.status(200).json({
            message: "User details updated",
            data: updatedUser
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal server error",
            error: error
        })
    }
}

const deleteUser = async (req, res) => {
    const validationRules = [
        param('user_id', "User ID should be numeric").isNumeric().toInt()
    ]
    await Promise.all(validationRules.map(validation => validation.run(req)))

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { user_id } = req.params
    if (user_id != req.user.userId) {
        return res.status(403).json({
            message: "Invalid User Token (Cannot authenticate seems other users deleting someones other account)",
        })
    }

    let userDetail = {}
    try {
        const allUserQuery = "SELECT * FROM Users WHERE user_id = $1";
        const queryValue = [user_id];
        const allUserResult = await pool.query(allUserQuery, queryValue);
        if (allUserResult.rowCount === 0) {
            return res.status(404).json({
                message: "User not Found"
            })
        }
        const role_id = allUserResult.rows[0].role_id;

        if (role_id == 2) {
            const deleteStudentQuery1 = "DELETE FROM Intern WHERE user_id = $1 RETURNING *";
            const deleteStudentResult1 = await pool.query(deleteStudentQuery1, queryValue);
            userDetail = { ...userDetail, internshipDetail: { ...deleteStudentResult1.rows[0] } }
            const queryValue2 = [userDetail.intern_id]
            const deleteStudentQuery2 = "DELETE FROM InternshipAssignment WHERE intern_id = $1 RETURNING *";
            const deleteStudentResult2 = await pool.query(deleteStudentQuery2, queryValue2);
            userDetail = { ...userDetail, assignmentDetails: { ...deleteStudentResult2.rows[0] } }
        }


        const deleteUserQuery = "DELETE FROM Users WHERE user_id = $1 RETURNING *";
        const deleteUserResult = await pool.query(deleteUserQuery, queryValue);
        userDetail = { ...userDetail, ...deleteUserResult.rows[0] }
        delete userDetail["password"]
        res.status(200).json({
            message: "User deleted successfully",
            data: userDetail
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal server error",
            error: error
        })
    }
}



module.exports = { loginUser, createUser, getUsers, updateUserLoginDetails, deleteUser,getuserlogindetail }
