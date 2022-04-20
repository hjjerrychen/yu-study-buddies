import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";

function Footer() {
    return (
        <footer className="footer mt-5">
            <nav className="navbar navbar-dark">
                <div className="container">
                    <nav className="nav">
                        <a className="nav-link text-white" href="/">Home</a>
                        <a className="nav-link text-white" target="_blank" rel="noopener noreferrer" href="https://github.com/jerry70450/yu-study-buddies">GitHub</a>
                        <a className="nav-link text-white" target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/yustudybuddies">Donate</a>
                    </nav>
                </div>

            </nav>
        </footer>
    )
}

export default Footer;
