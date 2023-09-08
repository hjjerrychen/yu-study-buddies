import React from "react";
import styled from "styled-components";
import {InfoNotification} from "./Notifications";

const TitleIcon = styled.img`
  width: 23px;
  height: 23px;
`;

const Title = styled.h1`
  font-weight: 500;
  font-size: 1.25rem;
  margin: 0 0 0 8px;
  color: #e31837;
`;

const Desc = styled.span`
  margin-top: 0;
  display: flex;
  margin-bottom: 0;
  align-items: center;
`;

const OnboardingDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

const Span = styled.div`
  padding: 3px;
  align-items: center;
  font-size: 16px;
  
  @media(max-width: 700px) {
    font-size: 14px;
  }
  
`;

const HeroContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;


const LinkURL = styled.a`
    font-weight: bold;
    cursor: pointer;
    color: inherit !important;
    text-decoration: none;
  
    &:hover {
      text-decoration: underline;
    }
  
  &:active {
    opacity: 0.85;
  }
`;


const Link = styled.img`
  height: 25px;
  width: 25px;
  margin-left: 2px;
  margin-top: -3px;

  @media(max-width: 500px) {
    display: none;
  }
  
`;


function Onboarding() {
    return (
        <OnboardingDiv>
            <Span>To see your course list, visit the <Link src={"/icons/link2.svg"}/> <LinkURL target={"_blank"} href={"https://w2prod.sis.yorku.ca/Apps/WebObjects/cdm.woa/wa/DirectAction/cds"}>Course Website</LinkURL> and log in with <strong>Passport York</strong>.</Span>
            <Span>To find group chats, search below by <strong>course name</strong> or <strong>course code</strong>.</Span>
            <Span>Only students with <strong>active e-mail accounts</strong> at York University can post new links.</Span>
        </OnboardingDiv>
    )
}



const Students = styled.img`
  width: max-content;
  height: 250px;
  border: 4px solid #e31837;
  margin-top: 0px;
`;

export default function Hero() {

    return (
        <HeroContainer>
            <Desc>
                <TitleIcon src={"/icons/logo_red.png"} />
                <Title>Study Buddies</Title>
            </Desc>


            <div>
                <InfoNotification content={<Onboarding />} />
            </div>


        </HeroContainer>

    )
}
