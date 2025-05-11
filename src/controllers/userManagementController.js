const userManagementModel = require("../models/user/userManagement.model");
const bcrypt =  require('bcryptjs');
const {logActivity} = require('../utils/activityLog');

const viewAllUsers =  async (req, res) =>{
    try {
        const users = await userManagementModel.viewAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users: ', error);
        res.status(500).json({message: "Failed to fetch users", error: error.message});

    }
}

const getUserById = async (req,res) => {
    try {
        const {userId} = req.params;

        const user = await userManagementModel.getUserById(userId);

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({message: 'Failed to fetch user', error: error.message});
        
    }
}

const updateUser = async (req, res) => {
    try {
        const {userId} = req.params;
        const userData = req.body;

        const existingUser =  await userManagementModel.getUserById(userId);
        if (!existingUser) {
            return res.status(404).json({message: "User not found"});
        }

        const success =  await userManagementModel.updateUser(userId, userData);

        if (success) {
            await logActivity(req.user.user_id, `Updated user with ID ${userId}`);
            res.status(200).json({message: 'User updated successfully'});
        } else{
            res.status(400).json({message: 'Failed to update user'});
        }
    } catch (error) {
        console.error("Error updating user: ", error);
        res.status(500).json({message: 'Failed to update user', error: error.message});
        
    }
}

const deleteUser = async (req,res) => {
    try {
        const {userId} = req.params;

        if (req.user.user_id.toString() === userId) {
            return res.status(400).json({message: 'Cannot delete your own account'});
        }

        const existingUser = await userManagementModel.getUserById(userId);
        if (!existingUser) {
            return res.status(404).json({message: 'User not found'});
        }

        const success = await userManagementModel.deleteUser(userId);

        if (success) {
            await logActivity(req.user.user_id, `Deleted user with ID ${userId}`);
            res.status(200).json({message: 'User deleted successfully'});
        }else {
            res.status(400).json({message: 'Failed to delete user'});
        }
    } catch (error) {
        console.error('Error deleting user: ', error);
        res.status(500).json({message : 'Failed to delete user', error: error.message});
        
    }
}

const changeUserRole = async (req,res) => {
    try {
        const {userId} =  req.params;
        const {roles} = req.body;

        if (!roles || !Array.isArray(roles) || roles.length === 0) {
            return res.status(400).json({message: "Roles must be a non-empty array"});
              }

        const existingUser =  await userManagementModel.getUserById(userId);
        if (!existingUser) {
            return res.status(404).json({message: "User not found"})
        }

        const success = await userManagementModel.changeUserRole(userId, roles);

        if (success) {
            await logActivity(req.user.user_id, `Changed roles for user with ID ${userId} to ${roles.join(', ')}`);
            res.status(200).json({message: "User roles updated successfully"});
        }else{
            res.status(400).json({message: "Failed to update user roles"});
        }
    } catch (error) {
        console.error("Error changing user roles:", error);
        res.status(500).json({message: "Failed to change user role", error:error.message})
    }
}

const searchUsers =  async (req,res) => {
    try {
        const {query} = req.query;

        if (!query) {
            return res.status(400).json({message : "Search query is required"})
        }

        const users =  await userManagementModel.searchUsers(query);

        await logActivity(req.user.user_id, `Search for users with query: ${query}`);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({message : 'Failde to search users', error:error.message});
        
    }
}

module.exports = {viewAllUsers, getUserById, updateUser, deleteUser,changeUserRole, searchUsers};