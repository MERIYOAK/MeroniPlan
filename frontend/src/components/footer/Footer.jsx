import React from 'react'
import './footer.css'

function Footer() {
    return (
        <footer id="footer">
            <p className="copyright">Copyright © MeroniPlan {new Date().getFullYear()}</p>
        </footer>
    )
}

export default Footer