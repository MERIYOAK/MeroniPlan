import React from 'react'
import './header.css'
import { MdOutlineToday, MdOutlineMenu } from "react-icons/md";
import { FaCircleUser, FaTableList } from "react-icons/fa6";
import { Link } from 'react-router-dom';

function Header() {
    const imageUrl = localStorage.getItem("imageUrl") || '';

    const toggleMenu = () => {
        var menuItem = document.querySelector('.links');
        menuItem.classList.toggle('show-menu');
    };


    return (
        <div className="nav">
            <div className="logo">
                <Link to="/">Meroni<span className="plan">Plan</span></Link>

            </div>
            {localStorage.getItem("isAuthenticated") && (
                <div className="links">
                    <div className="today">
                        <Link to="/today" className='today-link' ><MdOutlineToday /> Today</Link>
                    </div>
                    <div className="all">
                        <Link to="/all_todos" className='all-link'><FaTableList /> All</Link>
                    </div>
                </div>
            )}
            <div className='menu' >
                <div className='user'>
                    {imageUrl ? (
                        <Link to="/user_profile"><img src={imageUrl} alt="user" className='user-image' /></Link>
                    ) : (
                        <FaCircleUser className='user-icon' />
                    )}
                </div>
                {localStorage.getItem("isAuthenticated") && (
                    <div className="menu-icon">
                        <span onClick={toggleMenu} className='menu-bar'><MdOutlineMenu /></span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Header