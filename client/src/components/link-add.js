import React, { useState, useRef, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import classNames from 'classnames';
import ReCAPTCHA from "react-google-recaptcha";
import ReactGA from 'react-ga';

function LinkAdd() {
    const reRef = useRef();

    let { course, section } = useParams();
    const [type, setType] = useState("");
    const [customType, setCustomType] = useState("");
    const [url, setURL] = useState("");
    const [terms, setTerms] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [validateTerms, setValidateTerms] = useState(false);
    const [serverError, setServerError] = useState("");
    const [noLinkHelpModal, setNoLinkHelpModal] = useState(false);
    const [courseDetails, setCourseDetails] = useState("");

    const formValid = {
        "type": type !== "",
        "customType": (type !== "Other" && customType === "") || (customType.length > 0 && customType.length < 20 && type === "Other"),
        "url": /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(url),
        "terms": terms,
    }

    useEffect(() => {
        const getCourseData = async () => await axios.get(`${process.env.REACT_APP_SERVER || "http://localhost:8080"}/courses/${course}`)
            .then(response => {
                setCourseDetails(response.data)
            })
            .catch((error) => {
                if (error.response?.status === 404) {
                    window.location.replace("/404");
                }
            })
        getCourseData();
    }, [course]);

    const submit = async (e) => {
        e.preventDefault();
        try {
            const request = {
                "type": (type === "Other" ? customType : type),
                "url": url,
                "terms": terms,
                "captcha": await reRef.current.executeAsync()
            }
            reRef.current.reset();
            await axios.post(`${process.env.REACT_APP_SERVER || "http://localhost:8080"}/courses/${course}/sections/${section}/link`, request)
            ReactGA.event({
                category: 'User',
                action: 'add-link'
            });
            setSubmitted(true);
        }
        catch (e) {
            if (e.response?.status === 400) {
                setServerError("Bad request.")
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
        <div className="nav-offset">
            <div className="jumbotron jumbotron-fluid">
                <div className="container">
                    <div className="d-flex justify-content-between">
                        <div>
                            <h1>Add a Link</h1>
                            <p className="lead mb-0">{courseDetails.faculty}/{courseDetails.subject} {courseDetails.number} {courseDetails.credits} (Section {section}) </p>
                        </div>
                    </div>
                </div>
            </div>
            {
                noLinkHelpModal &&
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
            { !submitted &&
                <div className="container">
                    {
                        serverError &&
                        <div className="alert alert-danger" role="alert">
                            Error: {serverError}
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
                            <div className="form-check">
                                <input className={classNames({
                                    "form-check-input": true,
                                    "is-valid": formValid.terms,
                                    "is-invalid": validateTerms && !formValid.terms
                                })}
                                    type="checkbox"
                                    checked={terms}
                                    onChange={() => {
                                        setValidateTerms(true)
                                        setTerms(!terms)
                                    }} />
                                <label className="form-check-label">I agree that the URL above links to an online community of the indicated type for this course and section, and is for school purposes only.</label>
                                <label className="form-check-label"><small>Links to malicious, inappropriate, copyrighted, or otherwise illegal content are not allowed. Do not post any Zoom links or links to online lectures. </small></label>
                                <div className="invalid-feedback">Please agree to the terms to continue.</div>
                            </div>
                        </div>

                        <ReCAPTCHA sitekey="6LdgVNYZAAAAAPBMSaqI_px7PyL1As_XkTmLAXVa" size="invisible" ref={reRef} />
                        <button type="submit" className="btn btn-danger" onClick={submit} disabled={!Object.values(formValid).every(formFieldValid => formFieldValid)}>Create Link</button>
                    </form>
                </div>
            }
            {
                submitted &&
                <div className="container">
                    <h1><i className="fas fa-check text-danger" /></h1>
                    <h1>The link has been added!</h1>
                    <a className={"btn btn-danger mt-5"} href={`/courses/${course}`} role="button">{`Go Back to ${courseDetails?.faculty}/${courseDetails?.subject} ${courseDetails?.number} ${courseDetails?.credits}`}</a>
                </div>
            }
        </div>
    );
}

export default LinkAdd;
