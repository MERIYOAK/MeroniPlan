import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../../../config';

function Todo({ item, setTodos }) {
    const [deleting, setDeleting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);

    useEffect(() => {
        let timer = null;
        if (deleting) {
            // Start the countdown timer
            timer = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        } else {
            // Clear the timer if not deleting
            clearInterval(timer);
        }

        // Clear the timer when component unmounts
        return () => clearInterval(timer);
    }, [deleting]);

    useEffect(() => {
        if (timeLeft === 0) {
            // Call the deleteTodo function when timeLeft reaches 0
            deleteTodo();
        }
    }, [timeLeft]);

    const deleteTodo = async () => {
        try {
            const response = await axios.delete(`${BASE_URL}/deletetodo/${item._id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'sessionId': localStorage.getItem('sessionId')
                }
            });

            if (response.status === 200) {
                setTodos(response.data.todos);
                localStorage.setItem('todos', JSON.stringify(response.data.todos));
            } else {
                console.error('Todo deletion failed:', response.data.message);
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
        } finally {
            // Reset the deleting state and timeLeft after API call
            setDeleting(false);
            setTimeLeft(10); // Reset time left to 10 seconds
        }
    };

    const handleCheckboxChange = () => {
        // Toggle the deleting state immediately
        setDeleting(prevDeleting => !prevDeleting);
    };

    // Function to format datetime string to 'ddMMYY at hour:minute'
    const formatDateTime = (datetime) => {
        const dateObj = new Date(datetime);
        const day = dateObj.getDate();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthName = monthNames[dateObj.getMonth()];
        const year = dateObj.getFullYear().toString().substr(-2); // Get last 2 digits of year
        const hour = dateObj.getHours();
        const minute = dateObj.getMinutes();
        return `${day} ${monthName} ${year} at ${hour}:${minute < 10 ? '0' + minute : minute}`;
    };

    return (
        <form>
            <div className="list-item">
                <input type="checkbox" name="checkbox" onChange={handleCheckboxChange} />
                <div className="todo_text">
                    <p style={{ textDecoration: deleting ? 'line-through' : 'none' }} >{item.todo}</p>
                    <span style={{ textDecoration: deleting ? 'line-through' : 'none' }}>Time: {formatDateTime(item.datetime)}</span>
                    {deleting &&
                        <div className="timer">
                            <p>{timeLeft} seconds left to delete</p>
                        </div>
                    }
                </div>
            </div>
        </form>
    );
}

export default Todo;
