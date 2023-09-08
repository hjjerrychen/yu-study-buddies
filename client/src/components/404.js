import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Header";
import {Container} from "./Home";
import {styled} from "styled-components";


const Page = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;


const Content = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  
`;


function LinkAdd() {

    return (
        <Page>
            <Header />
            <Content>
                <Container style={{height: "fit-content"}}>
                    <h1 className="display-3">404 - Not Found</h1>
                    <a className="btn btn-danger btn-lg mt-3" href="/" role="button">Go Home</a>
                </Container>
            </Content>
        </Page>
    );
}

export default LinkAdd;
