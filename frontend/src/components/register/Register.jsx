import React, { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../../../config';

function Register() {

    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [sex, setSex] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // Check if image is uploaded
        if (!image) {
            alert('Please upload an image');
            return;
        }

        // Perform registration logic
        const data = {
            firstName,
            middleName,
            lastName,
            username,
            age,
            sex,
            city,
            country,
            password,
            image
        }

        // Send registration data to server
        try {
            const response = await axios.post(BASE_URL + '/register', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
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

                navigate('/all_todos');
                window.location.reload();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div className="regester-form container">
            <h1>Registration Form</h1>
            <form onSubmit={handleSubmit} className="input-form">
                <div className="form-group">
                    <label htmlFor="firstName">First Name:</label>
                    <input type="text" id="firstName" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="middleName">Middle Name:</label>
                    <input type="text" id="middleName" name="middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name:</label>
                    <input type="text" id="lastName" name="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="age">Age:</label>
                    <input type="number" id="age" name="age" required min="1" max="100" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="sex">Sex:</label>
                    <select id="sex" name="sex" required value={sex} onChange={(e) => setSex(e.target.value)} >
                        <option value="" disabled >-- Select --</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="image">Image:</label>
                    <input type="file" id="image" name="image" onChange={(e) => setImage(e.target.files[0])} accept="image/*" required />
                </div>
                <div className="form-group">
                    <label htmlFor="city">City:</label>
                    <input type="text" id="city" name="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="country">Country:</label>
                    <input type="text" id="country" name="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default Register