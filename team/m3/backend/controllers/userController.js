import SQLiteUser from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Helper function to create a response object
const factoryResponse = (status, message) => ({ status, message });

// Controller function to handle user registration
export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await SQLiteUser.create({ username, email, password }); //now creates the user and corresponding MegaDatabase
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json(factoryResponse(500, 'User not created due to error; userController'));
    }
};

// Controller function to handle user login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await SQLiteUser.getUserByEmail(email);
        if (!user) {
            return res.status(401).json(factoryResponse(401, 'Invalid email or password'));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json(factoryResponse(401, 'Invalid email or password'));
        }

        const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json(factoryResponse(500, 'Error logging in--Usercontroller'));
    }
};

// POST: Controller function to handle user logout
export const logoutUser = (req, res) => {
    // Invalidate the token 
    res.status(200).json({ message: 'Logged out successfully' });
};

// DELETE: Controller function to handle user deletion
export const deleteUser = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await SQLiteUser.getUserByEmail(email);
        if (!user) {
            return res.status(404).json(factoryResponse(404, 'User not found'));
        }
        await SQLiteUser.delete(user); //now deletes the user and their MegaDatabase
        res.status(200).json(factoryResponse(200, 'User deleted successfully'));
    } catch (error) {
        res.status(500).json(factoryResponse(500, 'Error deleting user'));
    }
};