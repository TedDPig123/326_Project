import { syncWithMegaDatabase } from "./megaDBRequests.js";
import { createOrUpdateMegaDatabase, getAllDatabaseDataForRegistration} from "./megaDBRequests.js";
import { clearTileObjectDB, tileRenderOnLoad } from "./TileLogic.js";
import { updateMegaDB } from "./megaDBRequests.js";

localStorage.removeItem('userEmail');


// Event listener for the registration form submission
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Get the values from the input fields
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        // Send a POST request to the server to register the user
        const response = await fetch('/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }), // Send the user data in the request body
        });

        // Parse the response from the server
        const data = await response.json();

        //note: this part does not run
        const megaDBObject = await getAllDatabaseDataForRegistration(email);
        console.log(megaDBObject);
        await createOrUpdateMegaDatabase(megaDBObject);


        // Display a message to the user
        document.getElementById('message').innerText = data.message || 'Registration successful';
    } catch (error) {
        // Display an error message if the registration fails
        document.getElementById('message').innerText = 'Registration failed';
    }
});

// Event listener for the login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Get the values from the input fields
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        // Send a POST request to the server to log in the user
        const response = await fetch('/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }), // Send the user data in the request body
        });

        // Parse the response from the server
        const data = await response.json();

        // If a token is returned, store it in localStorage and display a success message
        if (data.token) {
            localStorage.setItem('token', data.token);

            //geri edit start
            localStorage.setItem('userEmail', email);

            await syncWithMegaDatabase(email);
            await tileRenderOnLoad();
            //geri edit end

            document.getElementById('message').innerText = 'Login successful';
        } else {
            // Display an error message if the login fails
            document.getElementById('message').innerText = data.message || 'Login failed';
        }
    } catch (error) {
        // Display an error message if the login fails
        document.getElementById('message').innerText = 'Login failed';
    }
});

// Event listener for the logout button click
document.getElementById('logout-button').addEventListener('click', async () => {
    try {
        // Send a POST request to the server to log out the user
        const response = await fetch('/users/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, // Send the token in the Authorization header
        });

        // Parse the response from the server
        const data = await response.json();

        // Remove the token from localStorage and display a success message
        await updateMegaDB();
        await clearTileObjectDB()
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        document.getElementById('message').innerText = data.message || 'Logged out successfully';
    } catch (error) {
        // Display an error message if the logout fails
        document.getElementById('message').innerText = 'Logout failed';
    }
});

// Event listener for the delete button click
document.getElementById('delete-button').addEventListener('click', async () => {
    const email = prompt('Please enter your email to confirm deletion:');
    if (!email) {
        document.getElementById('message').innerText = 'User deletion cancelled';
        return;
    }

    try {
        // Send a DELETE request to the server to delete the user
        const response = await fetch('/users/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }), // Send the user email in the request body
        });

        // Parse the response from the server
        const data = await response.json();

        // Display a message to the user
        document.getElementById('message').innerText = data.message || 'User deleted successfully';
    } catch (error) {
        // Display an error message if the deletion fails
        document.getElementById('message').innerText = 'User deletion failed';
    }
});