import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import {styled} from "styled-components";
import Header from "./Header";
import Hero from "./Hero";

// Only ever used on other pages but it's ok lol
export const PageTitle = styled.div`
  margin-bottom: -8px;
`;


export const Container = styled.div`
  background: white;
  width: 90%;
  max-width: 1600px;
  margin: 25px auto;
  border-radius: 5px;
  padding: 20px 30px 30px;
  display: flex;
  flex-direction: column;
`;

const Page = styled.div`
  display: flex;
  flex-direction: column;
`;


const Input = styled.input`
    
    @media(max-width: 500px) {
      font-size: 15px;
    }
`;

const Tagline = styled.span`
  display: flex;
  font-weight: bold;
  color: #3d3d3d;
  flex-direction: column;
`;

const TaglineSpan = styled.span`
    font-size: 30px;
    margin-bottom: 15px;
  
    @media(max-width: 500px) {
      font-size: 20px;
    }
  
`;

let STATS = null;

async function getStats() {

    if (STATS == null) {
        const axiosRes = await axios.get(`${process.env.REACT_APP_SERVER || "http://localhost:8080"}/stats`);
        STATS = axiosRes.data;
    }

    return STATS;

}

export function Home() {
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState("");
    const [statResults, setStatResults] = useState("");

    getStats().then(res => {
        setStatResults(res)
    });

    let searchResultElements = [];

    searchResultElements = searchResults && searchResults.map((result) =>
        <a className="list-group-item list-group-item-action"
            href={`courses/${result.faculty + result.subject + result.number + result.credits}`}
            key={result?.faculty + result.subject + result.number + result.credits}>
            <span className="font-weight-bold">{result.faculty}/{result.subject} {result.number} {result.credits}</span> - {result.name}
        </a>
    );

    const courseCountStr =  statResults?.courseCount ? (statResults.courseCount.toLocaleString() + " ") : "";

    return (
       <Page>
           <Header/>
           <Container className="container nav-offset" >
               <Hero stats={STATS} />
               <Tagline>
                   <TaglineSpan >Find group chats. Connect with classmates. Ace your courses.</TaglineSpan>
                   <Input type="text"
                          className="form-control form-control-lg rounded-0"
                          placeholder={`Search ${courseCountStr}courses by code or name`}
                          value={searchText}
                          onChange={async (e) => {

                       setSearchText(e.target.value);

                       let apiValue = (searchText)
                           .replaceAll("/", " ")
                           .replaceAll("-", " ")

                       await axios.get(`${process.env.REACT_APP_SERVER || "http://localhost:8080"}/courses?l=5&q=${apiValue}`)
                           .then(response => {
                               setSearchResults(response.data)
                           })
                   }} />
                   <ul className="list-group rounded-0">
                       {searchText && searchResults && searchResultElements}
                   </ul>
               </Tagline>
           </Container>
       </Page>
    );
}

