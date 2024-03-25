import React, { useState } from 'react'
import './log_in.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import BASE_URL from '../../../config'

function Log_in() {
    const [emailOrUsername, setEmailOrUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            emailOrUsername,
            password
        }

        try {
            const response = await axios.post(BASE_URL + '/login', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = response.data;
            if (result.success === true) {
                alert(result.message);

                // Store senstive information in localStorage
                localStorage.setItem('firstName', result.firstName);
                localStorage.setItem('middleName', result.middleName);
                localStorage.setItem('lastName', result.lastName);
                localStorage.setItem('email', result.email);
                localStorage.setItem('username', result.username);
                localStorage.setItem('imageUrl', result.imageUrl);
                localStorage.setItem('sessionId', result.sessionId);
                localStorage.setItem('isAuthenticated', true);
                localStorage.setItem('userId', result.id);
                localStorage.setItem('todos', JSON.stringify(result.todos));

                navigate('/all_todos');
                window.location.reload();
            } else {
                alert(result.message);
                console.error("Login failed:", response.data.message);
            }

        } catch (error) {
            console.error("Error during login:", error.message);
        }

    }
    return (
        <div className="regester-form container">
            <h1>Login Form</h1>
            <form onSubmit={handleSubmit} className="input-form">
                <div className="form-group">
                    <label htmlFor="emailOrUsername">Email or Username:</label>
                    <input type="text" id="emailOrUsername" name="emailOrUsername" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Log_in