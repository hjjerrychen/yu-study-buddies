import styled from "styled-components";
import React from "react";

const Notification = styled.div`
  width: 100%;
  border: 1px solid;
  border-radius: 5px;
  display: flex;
  margin-top: 15px;
`;

const NotificationContent = styled.div`
  width: 100%;
  padding: 15px 0 15px 15px;
  display: flex;
`;

const NotificationIcon = styled.img`
  width: 25px;
  height: 25px;
  margin-right: 10px;
  margin-top: 3px;

  @media(max-width: 400px) {
    display: none;
  }
  
`;

const XIcon = styled.img`
  width: 25px;
  height: 25px;
  padding: 5px;
  border-radius: 500px;
  cursor: pointer;
  transition-duration: 100ms;
  
  &:hover {
    background: ${props => props.color};
  }
  
  &:active {
    filter: brightness(0.6);
  }
`;

const CloseContainer = styled.div`
  padding: 12px;
`;
function onClick(event) {
    event.target.parentNode.parentNode.remove();
}
export function InfoNotification(props) {

    let color, border, background, xBackground;
    border = color = "rgba(0,94,182,1.0)";
    background = "rgba(0,94,182,0.15)";
    xBackground = "rgba(0,94,182,0.18)";

    return (
        <Notification style={{borderColor: border, color: color, background: background}}>
            <NotificationContent>
                <NotificationIcon src={"/icons/info.svg"}/>
                {props.content}
            </NotificationContent>
            <CloseContainer>
                <XIcon onClick={onClick} color={xBackground} src={'/icons/x.svg'} />
            </CloseContainer>
        </Notification>
    )
}
