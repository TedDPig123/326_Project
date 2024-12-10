import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import megaDatabase from './sqliteMegadatabase.js';

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
});

// Define the User model with attributes and validation
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true, // Ensure the username is not empty
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
        validate: {
            isEmail: true, // Ensure the email is in a valid format
            notEmpty: true, // Ensure the email is not empty
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true, // Ensure the password is not empty
        },
    },
}, {
    hooks: {
        // Hash the password before creating a new user
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
    },
});

// Class to handle SQLite operations for the User model
class _SQLiteUser {
    constructor() {}

    // Initialize the database and sync the User model
    async init(refresh = false) {
        await sequelize.authenticate();
        await sequelize.sync({ force: refresh });
        
        if (refresh) {
            await this.deleteAll();
        }
    }

    // Create a new user
    async create(user) {
        try {
            const newUser = await User.create(user);
            // Create new megaDatabase entry when a user is created
            await megaDatabase.create({
                userId: newUser.id,
                gridData: {},
                gridStateData: {},
                tileData: {},
                tokenData: {},
                userData: {
                    username: newUser.username,
                    email: newUser.email,
                },
            });
            return newUser;
        } catch (error) {
            console.error('user.js; Error creating user:', error);
            throw error;
        }
    }

    // Get a user by ID
    async getUser(id) {
        try {
            return await User.findByPk(id);
        } catch (error) {
            console.error('user.js; Error getting user by ID:', error);
            throw error;
        }
    }

    // Get a user by email 
    async getUserByEmail(email) {
        try {
            return await User.findOne({ where: { email } });
        } catch (error) {
            console.error('user.js; Error getting user by email:', error);
            throw error;
        }
    }

    // Get all users
    async getAllUsers() {
        try {
            return await User.findAll();
        } catch (error) {
            throw error;
        }
    }

    // Update a user
    async update(user) {
        try {
            const currUser = await User.findByPk(user.id);
            if (!currUser) {
                return null;
            }
            await currUser.update(user);
            return currUser;
        } catch (error) {
            throw error;
        }
    }

    // Delete a user
    async delete(user) {
        try {
            // Delete the MegaDatabase entry for the user
            await megaDatabase.destroy({ where: { userId: user.id } });
            
            await User.destroy({ where: { id: user.id } });
            return user;
        } catch (error) {
            throw error;
        }
    }

    // Delete all users
    async deleteAll() {
        try {
            await User.destroy({ truncate: true });
            return;
        } catch (error) {
            throw error;
        }
    }
}

// Export an instance of the _SQLiteUser class
const SQLiteUser = new _SQLiteUser();

export default SQLiteUser;