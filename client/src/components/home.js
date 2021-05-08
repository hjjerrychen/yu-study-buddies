import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';

import "./home.css";

function Home() {
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState("");

    useEffect(() => { document.body.style.backgroundColor = "#E31837" }, []);

    let searchResultElements = [];

    searchResultElements = searchResults && searchResults.map((result) =>
        <a className="list-group-item list-group-item-action"
            href={`courses/${result.faculty + result.subject + result.number + result.credits}`}
            key={result?.faculty + result.subject + result.number + result.credits}>
            <span className="font-weight-bold">{result.faculty}/{result.subject} {result.number} {result.credits}</span> - {result.name}
        </a>
    );

    searchResultElements = searchResultElements.concat(
        <a className="list-group-item list-group-item-action"
            href="courses/add"
            key="add">
            <span className="font-weight-bold">Don't see your course?</span> Add it!
        </a>
    );

    return (
        <div className="container top-spacing nav-offset" >
            <h1 id="welcome-text" className="text-white">Find group chats. Connect with classmates. Ace your courses.</h1>
            <h6 className="text-white">Now updated for Summer 2021!</h6>
            <input type="text" className="form-control form-control-lg rounded-0" placeholder="Search for courses by code or name" value={searchText} onChange={async (e) => {
                setSearchText(e.target.value)
                await axios.get(`${process.env.REACT_APP_SERVER || "http://localhost:8080"}/courses?l=5&q=${searchText}`)
                    .then(response => {
                        setSearchResults(response.data)
                    })
            }} />
            <ul className="list-group rounded-0">
                {searchText && searchResults && searchResultElements}
            </ul>
        </div>
    );
}

export default Home;
