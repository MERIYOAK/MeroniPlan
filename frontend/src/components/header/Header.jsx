import React from 'react'
import './header.css'
import { MdOutlineToday, MdOutlineMenu } from "react-icons/md";
import { FaCircleUser, FaTableList } from "react-icons/fa6";

function Header() {
    const imageUrl = localStorage.getItem("imageUrl") || '';

    const toggleMenu = () => {
        var menuItem = document.querySelector('.links');
        menuItem.classList.toggle('show-menu');
    };


    return (
        <div className="nav">
            <div className="logo">
                <a href="#">Meroni<span className="plan">Plan</span></a>
            </div>
            {localStorage.getItem("isAuthenticated") && (
                <div className="links">
                    <div className="today">
                        <a href="/today" className='today-link' ><MdOutlineToday /> Today</a>
                    </div>
                    <div className="all">
                        <a href="/all_todos" className='all-link'><FaTableList /> All</a>
                    </div>
                </div>
            )}
            <div className='menu' >
                <div className='user'>
                    {imageUrl ? (
                        <a href="/user_profile"><img src={imageUrl} alt="user" className='user-image' /></a>
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