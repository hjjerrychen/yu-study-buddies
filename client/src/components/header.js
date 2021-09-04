import React from 'react';

import "bootstrap/dist/css/bootstrap.min.css";
import "./header.css";

function Header(props) {
    return (
        <header>
            <nav className={"navbar border-bottom fixed-top font-weight-bold pl-0 pr-0 " + (props.white ? "navbar-dark " : "navbar-light bg-white")}>
                <div className="container">
                    <a className="navbar-brand " href="/">YU Study Buddies</a>
                    <div className="navbar-right">
                        {props.white && <a className="text-white text-decoration-none" target="_blank" href="https://www.buymeacoffee.com/yustudybuddies">Donate</a>}
                        {props.white && <a className="text-white text-decoration-none ml-3 d-none d-sm-inline" target="_blank" href="https://github.com/jerry70450/yu-study-buddies">GitHub</a>}
                        {!props.white && <a className="text-danger text-decoration-none" target="_blank" href="https://www.buymeacoffee.com/yustudybuddies">Donate</a>}
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;
