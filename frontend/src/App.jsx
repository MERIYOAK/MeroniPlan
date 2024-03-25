import React, { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header.jsx'
import Intro from './components/intro/Intro.jsx'
import Register from './components/register/Register.jsx'
import Log_in from './components/log_in/Log_in.jsx';
import All_todos from './components/all_todos/All_todos.jsx';
import Today from './components/today/Today.jsx';
import User_profile from './components/user_profile/User_profile.jsx';
import Footer from './components/footer/Footer.jsx'

function App() {


  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Log_in />} />
        <Route path="/all_todos" element={<All_todos />} />
        <Route path="/today" element={<Today />} />
        <Route path="/user_profile" element={<User_profile />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App