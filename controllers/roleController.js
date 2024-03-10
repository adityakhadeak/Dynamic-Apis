const pool= require('../database/db.js')

const createRole = async (req, res) => {
    
    const { role_name } = req.body;
    try {
        const createRoleQuery = 'INSERT INTO Roles (role_name) VALUES ($1) RETURNING *';
        const createRoleValues = [role_name];
        const createRoleResult = await pool.query(createRoleQuery, createRoleValues);

        res.status(201).json({
            message: "Role created",
            data: createRoleResult.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

const getRoles=async(req,res)=>{
    try {
        const getRolesQuery="SELECT * FROM Roles"
        const getRolesResult=await pool.query(getRolesQuery)

        res.status(200).json({
            message:"Data fetched",
            data:getRolesResult.rows
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
            error
        });
    }
}

module.exports={getRoles,createRole}