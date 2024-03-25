import React from 'react'
import './intro.css'
import { Link } from 'react-router-dom'

function Intro() {
    return (
        <div className="intro">
            <h2>MeroniPlan</h2>
            <p>MeroniPlan is an app for you to plan your life.</p>
            <i>please <Link to="/register" className="login"> register </Link> or <Link to="/login" className="login"> login </Link> to get started.</i>
        </div>
    )
}

export default Intro