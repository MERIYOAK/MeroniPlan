import React from 'react'
import './user_profile.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../../../config';

function User_profile() {
    const navigate = useNavigate();
    const firstName = localStorage.getItem('firstName');
    const middleName = localStorage.getItem('middleName');
    const lastName = localStorage.getItem('lastName');
    const email = localStorage.getItem('email');
    const username = localStorage.getItem('username');
    const imageUrl = localStorage.getItem('imageUrl');

    const logoutHandler = async () => {
        try {
            const sessionId = localStorage.getItem("sessionId");
            // Add your backend logout endpoint URL
            const response = await axios.post(BASE_URL + "/logout", {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        "sessionId": sessionId,
                    },
                });

            if (response.data.success) {
                alert(response.data.message);

                localStorage.removeItem('firstName');
                localStorage.removeItem('middleName');
                localStorage.removeItem('lastName');
                localStorage.removeItem('email');
                localStorage.removeItem('username');
                localStorage.removeItem('imageUrl');
                localStorage.removeItem('sessionId');
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('userId');
                localStorage.removeItem('todos');

                navigate('/');
                window.location.reload();
            } else {
                console.error("Logout failed:", response.data.message);
            }
        } catch (error) {
            console.error("Error during logout:", error.message);
        }
    };

    const handleImageChange = async () => {
        try {
            // Open file input dialog to allow the user to select an image
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                // Upload the selected image file to the S3 bucket
                const formData = new FormData();
                formData.append('image', file);
                formData.append('userId', localStorage.getItem("userId"));

                const sessionId = localStorage.getItem("sessionId");

                const response = await axios.post(BASE_URL + '/imageChange', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'sessionId': sessionId
                    }
                });

                if (response.data.success) {
                    alert(response.data.message);
                    localStorage.setItem('imageUrl', response.data.imageUrl);
                    window.location.reload();
                } else {
                    console.error("Image upload failed:", response.data.message);
                }
            };
            fileInput.click();
        } catch (error) {
            console.error("Error during image upload:", error.message);
        }
    };


    return (
        <div className="user-profile">
            {imageUrl && (
                <>
                    <img src={imageUrl} alt="User" className="profile-image" />
                    <span className='profile-info-button' onClick={handleImageChange}>change profile picture</span>
                </>
            )}
            <div className="profile-info">
                <h2>User Profile</h2>
                <div>
                    <p><strong>First Name:</strong> {firstName}</p>
                    <p><strong>Middle Name:</strong> {middleName}</p>
                    <p><strong>Last Name:</strong> {lastName}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Username:</strong> {username}</p>
                </div>
                <button className='profile-info-button' onClick={logoutHandler}>Logout</button>
            </div>
        </div>
    );
};

export default User_profile