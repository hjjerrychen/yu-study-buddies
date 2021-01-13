import React from 'react';

import "bootstrap/dist/css/bootstrap.min.css";
import "./header.css";

function Header(props) {
    return (
        <header>
            <nav className={"navbar border-bottom fixed-top font-weight-bold pl-0 pr-0 " + (props.white ? "navbar-dark " : "navbar-light bg-white")}>
                <div className="container">
                    <a className="navbar-brand " href="/">Study Buddies @ YU</a>
                    {/* {props.white && <a className="navbar-right text-white text-decoration-none" href="https://github.com/jerry70450/yu-study-buddies">GitHub</a>} */}

                </div>
            </nav>
        </header>
    );
}

export default Header;
