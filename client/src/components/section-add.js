import React, { useState, useRef } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import classNames from 'classnames';
import ReCAPTCHA from "react-google-recaptcha";
import ReactGA from 'react-ga';

function SectionAdd() {
    let { course } = useParams();
    const reRef = useRef();

    const [name, setName] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const nameValid = name.length > 0 && name.length <= 10;
    const [serverError, setServerError] = useState("");


    const submit = async (e) => {
        e.preventDefault();
        try {
            const request = {
                "name": name,
                "captcha": await reRef.current.executeAsync()
            }
            reRef.current.reset();
            await axios.post(`http://localhost:8080/courses/${course}/sections`, request)
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
            else if(e.response?.status === 404){
                setServerError(`${e.response.data.error} Please check the URL of the page you are on and try again.`)
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
                            <h1>Add a Section to {course}</h1>
                        </div>
                    </div>
                </div>
            </div>
            {
                !submitted &&
                <div className="container">
                    {
                        serverError &&
                        <div className="alert alert-danger" role="alert">
                            Error: {serverError}
                        </div>
                    }
                    <form>
                        <div className="form-group">
                            <label>Section Name</label>
                            <input type="text"
                                className={classNames({
                                    "form-control": true,
                                    "rounded-0": true,
                                    "is-valid": nameValid,
                                    "is-invalid": !nameValid && name
                                })}
                                id="name"
                                value={name}
                                maxLength="10"
                                onChange={(e) => setName(e.target.value)} placeholder="A" />
                            <div className="invalid-feedback">Section name is too long.</div>
                        </div>

                        <ReCAPTCHA sitekey="6LdgVNYZAAAAAPBMSaqI_px7PyL1As_XkTmLAXVa" size="invisible" ref={reRef} />
                        <button type="submit" className="btn btn-danger" onClick={submit} disabled={!nameValid}>Create Section</button>
                    </form>
                </div>
            }
            {
                submitted &&
                <div className="container">
                    <h1>The section has been created!</h1>
                    <a className={"btn btn-danger mt-5"} href={`/courses/${course}`} role="button">{`Go back to ${course}`}</a>
                </div>
            }
        </div>
    );
}

export default SectionAdd;
