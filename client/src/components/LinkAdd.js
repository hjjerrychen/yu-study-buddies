import React, { useState, useRef, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import classNames from 'classnames';
import ReCAPTCHA from "react-google-recaptcha";
import ReactGA from 'react-ga';
import Header from "./Header";
import {Container, PageTitle} from "./Home";
import {styled} from "styled-components";

const H1 = styled.h1`
    @media(max-width: 500px) {
      font-size: 30px;      
    }
`;

const P = styled.p`
  @media(max-width: 500px) {
    font-size: 19px;
  }
`;

const WhyRequestThis = styled.small`
  @media(max-width: 500px) {
    display: block;
    margin-bottom: 10px;
  }
`;
function LinkAdd() {
    const reRef = useRef();

    let { course, section } = useParams();
    const [type, setType] = useState("");
    const [customType, setCustomType] = useState("");
    const [url, setURL] = useState("");
    const [username, setUsername] = useState("");
    const [terms, setTerms] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [validateTerms, setValidateTerms] = useState(false);
    const [serverError, setServerError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [terminalError, setTerminalError] = useState("");
    const [noLinkHelpModal, setNoLinkHelpModal] = useState(false);
    const [usernameWhyModal, setUsernameWhyModal] = useState(false);
    const [courseDetails, setCourseDetails] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyCode, setVerifyCode] = useState("");
    const [invalidCode, setInvalidCode] = useState(false);
    const [expiredCode, setExpiredCode] = useState(false);
    const [isInRequest, setIsInRequest] = useState(false);

    const formValid = {
        "type": type !== "",
        "customType": (type !== "Other" && customType === "") || (customType.length > 0 && customType.length < 20 && type === "Other"),
        "url": /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(url),
        "terms": terms,
        "username": username
    }

    useEffect(() => {
        const findSection = (sections, sectionToFind) => {
            for (section of sections) {
                if (section["name"] === sectionToFind) {
                    return true
                }
            }
            return false;
        }

        const getCourseData = () => axios.get(`${process.env.REACT_APP_SERVER || "http://localhost:8080"}/courses/${course}`)
            .then(response => {
                setCourseDetails(response.data)
                if (!findSection(response.data["sections"], section)) {
                    window.location.replace("/404");
                }

            })
            .catch((error) => {
                if (error.response?.status === 404) {
                    window.location.replace("/404");
                }
                else {
                    setTerminalError("Things aren't working right now. Please try again later.")
                }
            })
        getCourseData();
    }, [course, section])


    const verify = async (e) => {
        e.preventDefault();
        setIsInRequest(true);

        if (isVerifying) {
            await submit();
            setIsInRequest(false);
            return;
        }

        try {
            const request = {
                "username": username,
                "captcha": await reRef.current.executeAsync()
            }

            reRef.current.reset();

            await axios.post(`${process.env.REACT_APP_SERVER || "http://localhost:8080"}/verify/create`, request)

            ReactGA.event({
                category: 'User',
                action: 'add-link-verify'
            });

            setIsVerifying(true);
            setInfoMessage(`A code was sent to your email "${username}@my.yorku.ca". Please enter it below.`);
        } catch (e) {
            if (e.response?.status === 400) {
                setServerError("Bad request.");
            }
            else if (e.response?.status === 429) {
                setServerError("That's too many requests! Try again later.")
            }
            else {
                setServerError("Things aren't working right now. Please try again later.")
            }
        }

        setIsInRequest(false);

    }

    const submit = async() => {

        try {
            const request = {
                "type": (type === "Other" ? customType : type),
                "url": url,
                "terms": terms,
                "username": username,
                "code": verifyCode || null
            }
            await axios.post(`${process.env.REACT_APP_SERVER || "http://localhost:8080"}/courses/${course}/sections/${section}/link`, request)
            ReactGA.event({
                category: 'User',
                action: 'add-link'
            });
            setInvalidCode(false);
            setSubmitted(true);
        }
        catch (e) {
            if (e.response?.status === 400) {
                setServerError("Bad request.")
            }
            else if (e.response?.status === 410) {
                setInfoMessage("");
                setServerError("The requested code is expired. Please refresh the page.");
                setExpiredCode(true);
            }
            else if (e.response?.status === 401) {
                setServerError("The code you entered does not match our records.");
                setInvalidCode(true);
            }
            else if (e.response?.status === 404) {
                setServerError("Please check the URL of the page you are on and try again.")
            }
            else if (e.response?.status === 429) {
                setServerError("That's too many requests! Try again later.")
            }
            else if (e.response?.data?.error) {
                setServerError(e.response.data.error)
            }
            else {
                setServerError("Things aren't working right now. Please try again later.")
            }
        }
    }
    return (
        <div>
            <Header />
            <Container>
                <PageTitle>
                    <div className="d-flex justify-content-between">
                        {!terminalError &&
                            <div>
                                <H1>Add a Link</H1>
                                <P className="lead mb-0">{courseDetails.faculty}/{courseDetails.subject} {courseDetails.number} {courseDetails.credits} (Section {section}) </P>
                            </div>
                        }
                    </div>
                </PageTitle>
            </Container>
            <Container>
                {   noLinkHelpModal && !terminalError &&
                    <div>
                        {ReactGA.modalview("/no-link-help")}
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal d-block">
                            <div className="modal-dialog modal-dialog-scrollable" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">What if the social media I use doesn't use links to invite people?</h5>
                                    </div>
                                    <div className="modal-body">
                                        <p>There are many creative workarounds you can use. Some ideas are below:</p>
                                        <p>For social media that uses QR codes to invite people, such as WeChat, take a screenshot of the QR code, upload it to a third-party website, such as <a href="https://imgur.com/"> imgur </a> and paste the image link here instead.</p>
                                        <p>For social media that require direct invites, make a fake profile and link that profile here. People can add the fake profile, and then the person in charge of the fake profile can add them into the group chat.</p>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-outline-dark" onClick={() => setNoLinkHelpModal(false)}>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {   usernameWhyModal && !terminalError &&
                    <div>
                        {ReactGA.modalview("/username-why-help")}
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal d-block">
                            <div className="modal-dialog modal-dialog-scrollable" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Why do we request your Passport York Username?</h5>
                                    </div>
                                    <div className="modal-body">
                                        <p>We use your username to send an e-mail to your @my.yorku.ca account, verifying you are a student.</p>
                                        <p>This prevents the service being abused by scammers and spammers.</p>
                                        <p>Your username is never public & group-chat ownership is anonymous.</p>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-outline-dark" onClick={() => setUsernameWhyModal(false)}>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {   !submitted && !terminalError &&
                    <div>
                        {
                            serverError &&
                            <div className="alert alert-danger" role="alert">
                                Error: {serverError}
                            </div>
                        }
                        {
                            infoMessage &&
                            <div className="alert alert-info" role="alert">
                                {infoMessage}
                            </div>
                        }
                        <form>
                            <div className="form-group">
                                <label>Type</label>
                                <select className={classNames({
                                    "form-control": true,
                                    "rounded-0": true,
                                    "is-valid": formValid.type,
                                    "is-invalid": !formValid.type && type
                                })} value={type} onChange={(e) => setType(e.target.value)} >
                                    <option value="">Select a type...</option>
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Discord">Discord</option>
                                    <option value="Facebook Messenger">Facebook Messenger</option>
                                    <option value="Facebook Group">Facebook Group</option>
                                    <option value="WeChat">WeChat</option>
                                    <option value="Slack">Slack</option>
                                    <option value="Telegram">Telegram</option>
                                    <option value="Signal">Signal</option>
                                    <option value="Other">Other</option>
                                </select>
                                {
                                    type === "Other" &&
                                    <input
                                        type="text"
                                        className={classNames({
                                            "form-control": true,
                                            "rounded-0": true,
                                            "mt-3": true,
                                            "is-valid": formValid.customType,
                                            "is-invalid": !formValid.customType && customType
                                        })}
                                        value={customType} onChange={(e) => setCustomType(e.target.value)}
                                        placeholder="Type" />
                                }
                                <div className="invalid-feedback">Please enter a valid type.</div>
                            </div>

                            <div className="form-group">
                                <label className="mr-3">URL</label>
                                <small className="link-black" onClick={() => setNoLinkHelpModal(true)}>
                                    <i className="fas fa-question-circle" /> My group doesn't have a link
                                </small>
                                <input
                                    type="text"
                                    className={classNames({
                                        "form-control": true,
                                        "rounded-0": true,
                                        "is-valid": formValid.url,
                                        "is-invalid": !formValid.url && url
                                    })}
                                    id="url"
                                    value={url}
                                    onChange={(e) => {
                                        setURL(e.target.value)
                                    }}
                                    placeholder="https://www.google.com" />
                                <div className="invalid-feedback">Please enter a valid URL, including http or https.</div>
                            </div>
                            <div className="form-group">
                                <label className="mr-3">Passport York Username</label>
                                <WhyRequestThis className="link-black" onClick={() => setUsernameWhyModal(true)}>
                                    <i className="fas fa-question-circle" /> Why do we request this?
                                </WhyRequestThis>
                                <input
                                    type="text"
                                    className={classNames({
                                        "form-control": true,
                                        "rounded-0": true,
                                    })}
                                    id="url"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value)
                                    }}
                                    placeholder="johndoe" />
                                <div className="invalid-feedback">Please enter a valid Passport York ID</div>
                            </div>
                            {
                                !submitted && !terminalError && isVerifying &&
                                <div className="form-group">
                                    <label className="mr-3">Verification Code</label>
                                    <input
                                        type="text"
                                        className={classNames({
                                            "form-control": true,
                                            "rounded-0": true,
                                            "is-valid": Number.isInteger(verifyCode) && verifyCode.length === 6,
                                            "is-invalid": invalidCode
                                        })}
                                        id="code"
                                        value={verifyCode}
                                        onChange={(e) => {
                                            setVerifyCode(e.target.value)
                                        }}
                                        disabled={expiredCode}
                                        placeholder={123456} />
                                    <div className="invalid-feedback">
                                        {expiredCode ?
                                            "Your code is expired. Refresh the page."
                                            : "The code you entered was incorrect, try again."}
                                    </div>
                                </div>
                            }
                            <div className="form-group" >
                                <div className="form-check" onClick={() => {
                                    setValidateTerms(true)
                                    setTerms(!terms)}
                                }>
                                    <input className={classNames({
                                        "form-check-input": true,
                                        "is-valid": formValid.terms,
                                        "is-invalid": validateTerms && !formValid.terms
                                    })}
                                           type="checkbox"
                                           checked={terms}
                                           onChange={() => null}
                                            />
                                    <label className="form-check-label" style={{"cursor": "pointer", "userSelect": "none"}}>I agree that the URL above links to an online community of the indicated type for this course and section, and is for school purposes only.</label>
                                    <label className="form-check-label" style={{"cursor": "pointer", "userSelect": "none"}}><small>Links to malicious, inappropriate, copyrighted, or otherwise illegal content are not allowed. Do not post any Zoom links or links to online lectures. </small></label>
                                    <div className="invalid-feedback" style={{"cursor": "pointer", "userSelect": "none"}}>Please agree to the terms to continue.</div>
                                </div>
                            </div>

                            <ReCAPTCHA sitekey="6LdeTwooAAAAAAp4ooizHD_M4aSG0zq68NcvU5Lo" size="invisible" ref={reRef} />
                            <button type="submit" className="btn btn-danger" onClick={verify} disabled={
                                (
                                    (!Object.values(formValid).every(formFieldValid => formFieldValid) && !isVerifying)
                                    || (verifyCode.length !== 6 && isVerifying)
                                    || (expiredCode && isVerifying)
                                    || isInRequest
                                )
                            }>{isVerifying ? (expiredCode ? "Code Expired" : "Verify Code") : "Create Link"}</button>
                        </form>
                    </div>
                }
                {
                    submitted && !terminalError &&
                    <div>
                        <h1><i className="fas fa-check text-danger" />&nbsp;&nbsp;The link has been added!</h1>
                        <a className={"btn btn-danger mt-3"} href={`/courses/${course}`} role="button">{`Go Back to ${courseDetails?.faculty}/${courseDetails?.subject} ${courseDetails?.number} ${courseDetails?.credits}`}</a>
                    </div>
                }
                {
                    terminalError &&
                    <div>
                        <div className="alert alert-danger" role="alert">
                            Error: {terminalError}
                        </div>
                    </div>
                }
            </Container>
        </div>
    );
}

export default LinkAdd;
