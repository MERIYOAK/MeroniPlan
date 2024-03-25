import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Todo from '../todo/Todo';
import BASE_URL from '../../../config';

function Today() {
    const [todos, setTodos] = useState([]);

    useEffect(() => {
        // Function to fetch todos based on current date
        const fetchTodos = () => {
            // Get todos from local storage
            const storedTodos = JSON.parse(localStorage.getItem('todos')) || [];
            // Filter todos based on current date
            const today = new Date().toISOString().split('T')[0]; // Get today's date in format 'YYYY-MM-DD'
            const filteredTodos = storedTodos.filter(todo => {
                const todoDate = todo.datetime.split('T')[0]; // Extract date part from datetime
                return todoDate === today;
            });
            setTodos(filteredTodos);
        };

        fetchTodos(); // Call the fetchTodos function on component mount
    }, []);

    const [newTodo, setNewTodo] = useState('');
    const [time, setTime] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const currentDate = new Date().toISOString().split('T')[0];
            const newTodoItem = {
                userId: localStorage.getItem('userId'),
                todo: newTodo,
                datetime: `${currentDate}T${time}`
            };

            // Add the new todo item to the backend API
            const response = await axios.post(BASE_URL + '/addtodo', newTodoItem, {
                headers: {
                    'Content-Type': 'application/json',
                    'sessionId': localStorage.getItem('sessionId')
                }
            });

            if (response.data.success) {
                alert(response.data.message);
                localStorage.setItem('todos', JSON.stringify(response.data.todos));
                setTodos(response.data.todos);
                setNewTodo('');
                setTime('');
            } else {
                console.error('Error adding todo:', response.data.message);
            }
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    return (
        <div className="container">
            <h1>Today</h1>
            <form onSubmit={handleSubmit} className="input-form">
                <input type="text" name="todo" placeholder="New Todo" autoComplete="off" required value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
                <input type="time" name="time" required value={time} onChange={(e) => setTime(e.target.value)} />
                <button type="submit">Add</button>
            </form>
            <div>
                <div className="list">
                    <div className="list-item">
                        <input type="checkbox" />
                        <p>&larr;  Note: Hit this to delete a Todo</p>
                    </div>
                    {todos.length > 0 ? (
                        todos.map((item) => (
                            <Todo key={item._id} item={item} setTodos={setTodos} />
                        ))
                    ) : (
                        <div className="list-item">
                            <p>No existing todos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Today