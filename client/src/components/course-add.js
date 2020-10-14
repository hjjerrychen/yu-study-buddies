import React, { useState, useRef } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import classNames from 'classnames';
import ReCAPTCHA from "react-google-recaptcha";
import ReactGA from 'react-ga';

function CourseAdd() {
    const reRef = useRef();

    const [subject, setSubject] = useState("");
    const [number, setNumber] = useState("");
    const [name, setName] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState("");

    const formValid = {
        "subject": subject.length >= 2 && subject.length <= 4,
        "number": number.length === 4 && Number(number.charAt(0)) > 0,
        "name": name.length > 0 && name.length <= 100
    }

    const submit = async (e) => {
        e.preventDefault();

        try {
            const request = {
                "name": name,
                "subject": subject,
                "number": number,
                "captcha": await reRef.current.executeAsync()
            }
            reRef.current.reset();
            await axios.post("http://localhost:8080/courses/", request)
            ReactGA.event({
                category: 'User',
                action: 'add-link',
                value: window.location.pathname + window.location.search
            });
            setSubmitted(true);
        }
        catch (e) {
            if (e.response?.status === 400) {
                setServerError("Bad request.")
            }
            else if (e.response?.status === 404) {
                setServerError(`${e.response.data.error} Please check the URL of the page you are on and try again.`)
            }
            else if (e.response?.status === 429) {
                setServerError(`That's too many requests! Try again later.`)
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
                            <h1>Add a Course</h1>
                        </div>
                    </div>
                </div>
            </div>

            { !submitted &&
                <div className="container">
                    {
                        serverError &&
                        <div className="alert alert-danger" role="alert">
                            Error: {serverError}
                        </div>
                    }
                    <form>
                        <label>Course Code</label>
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <small className="form-text text-muted">Subject Code</small>
                                <input
                                    type="text"
                                    className={classNames({
                                        "form-control": true,
                                        "rounded-0": true,
                                        "is-valid": formValid.subject,
                                        "is-invalid": !formValid.subject && subject
                                    })}
                                    value={subject} onChange={(e) => setSubject(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                                    maxLength="4"
                                    placeholder="ECON"
                                />
                                <div className="invalid-feedback">Please enter a valid subject code.</div>
                            </div>
                            <div className="form-group col-md-6">
                                <small className="form-text text-muted">Course Number</small>
                                <input
                                    type="text"
                                    className={classNames({
                                        "form-control": true,
                                        "rounded-0": true,
                                        "is-valid": formValid.number,
                                        "is-invalid": !formValid.number && number
                                    })}
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="1000"
                                    maxLength="4"
                                />
                                <div className="invalid-feedback">Please enter a valid course number.</div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Course Name</label>
                            <input
                                type="text"
                                className={classNames({
                                    "form-control": true,
                                    "rounded-0": true,
                                    "is-valid": formValid.name,
                                    "is-invalid": !formValid.name && name
                                })}
                                value={name}
                                maxLength="100"
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Introduction to Microeconomics"
                            />
                            <div className="invalid-feedback">Please enter a shorter course name.</div>
                        </div>

                        <ReCAPTCHA sitekey="6LdgVNYZAAAAAPBMSaqI_px7PyL1As_XkTmLAXVa" size="invisible" ref={reRef} />
                        <button type="submit" className="btn btn-danger" onClick={submit} disabled={!Object.values(formValid).every(formFieldValid => formFieldValid)}>Create Course</button>
                    </form>
                </div>
            }

            {
                submitted &&
                <div className="container">
                    <h1>The course has been created!</h1>
                    <a className={"btn btn-danger mt-5"} href={`/courses/${subject}${number}`} role="button">{`Go to ${subject} ${number}`}</a>
                </div>
            }
        </div>
    );
}

export default CourseAdd;
