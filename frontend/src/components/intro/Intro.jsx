import React from 'react'
import './intro.css'

function Intro() {
    return (
        <div className="intro">
            <h2>MeroniPlan</h2>
            <p>MeroniPlan is a plan for you to plan your life.</p>
            <i>please <a href="/register" className="login"> register </a> or <a href="/login" className="login"> login </a> to get started.</i>
        </div>
    )
}

export default Intro