import React, { useState } from 'react';
import axios from 'axios';
import Todo from '../todo/Todo';
import BASE_URL from '../../../config';

function AllTodos() {
    const [todos, setTodos] = useState(JSON.parse(localStorage.getItem('todos')) || []);
    const [newTodo, setNewTodo] = useState('');
    const [dateTime, setDateTime] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newTodoItem = {
                userId: localStorage.getItem('userId'),
                todo: newTodo,
                datetime: dateTime
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
                setDateTime('');

            } else {
                console.error('Error adding todo:', response.data.message);
            }
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    return (
        <div className="container">
            <h1>All Todos</h1>
            <form onSubmit={handleSubmit} className="input-form">
                <input type="text" name="todo" placeholder="New Todo" autoComplete="off" required value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
                <input type="datetime-local" name="datetime" required value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
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

export default AllTodos;
