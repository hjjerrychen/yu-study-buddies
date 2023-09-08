import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from "./Header"
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import ReactGA from 'react-ga';
import classNames from 'classnames';
import ReCAPTCHA from "react-google-recaptcha";
import {Container} from "./Home";


function Course() {
    const reRef = useRef();

    const { course } = useParams();
    const [courseDetails, setCourseDetails] = useState("");
    const [linkToReport, setLinkToReport] = useState("");
    const [copyButtonLabels, setCopyButtonLabels] = useState("");
    const [reportSubmitted, setReportSubmitted] = useState(false);
    const [reportError, setReportError] = useState("");
    const [serverError, setServerError] = useState("");


    useEffect(() => {
        const getCourseData = () => axios.get(`${process.env.REACT_APP_SERVER || "http://localhost:8080"}/courses/${course}`)
            .then(response => {
                setCourseDetails(response.data)
                const copyButtonLabel = {}

                for (const section of response.data.sections) {
                    for (const link of section.links) {
                        copyButtonLabel[link._id] = <span><i className="far fa-copy" /> Copy</span>
                    }
                }
                setCopyButtonLabels(copyButtonLabel)
            })
            .catch((e) => {
                if (e.response?.status === 400) {
                    setServerError("Bad request.")
                }
                else if (e.response?.status === 404) {
                    window.location.replace("/404");
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
            })
        getCourseData();
    }, [course]);

    const copyToClipboard = (id, url) => {
        try {
            navigator.clipboard.writeText(url)
            setCopyButtonLabels({ ...copyButtonLabels, [id]: <span><i className="fas fa-check" /> Copied!</span> })
            setTimeout(() => setCopyButtonLabels({ ...copyButtonLabels, [id]: <span><i className="far fa-copy" /> Copy</span> }), 500);
        }
        catch (e) {
            setCopyButtonLabels({ ...copyButtonLabels, [id]: <span><i className="fas fa-times" /> Browser Not Supported!</span> })
            setTimeout(() => setCopyButtonLabels({ ...copyButtonLabels, [id]: <span><i className="far fa-copy" /> Copy</span> }), 500);
        }

    }

    const closeReportModal = () => {
        setLinkToReport("");
        setReportSubmitted(false);
    }

    const reportLink = async () => {
        try {
            const request = {
                "link_id": linkToReport.id,
                "reason": linkToReport.reason,
                "captcha": await reRef.current.executeAsync()
            }
            reRef.current.reset();
            await axios.post(`${process.env.REACT_APP_SERVER || "http://localhost:8080"}/report`, request)

            ReactGA.event({
                category: 'User',
                action: 'report'
            });
            setReportSubmitted(true);
        }
        catch (e) {
            if (e.response?.status === 400) {
                setReportError("Bad request.")
            }
            else if (e.response?.status === 429) {
                setReportError("That's too many requests! Try again later.")
            }
            else if (e.response?.data?.error) {
                setReportError(e.response.data.error)
            }
            else {
                setReportError("Things aren't working right now. Please try again later.")
            }
        }
    }

    const sections = courseDetails && courseDetails.sections.map((section) =>
        <div key={section.name}>
            <div>
                <div className="d-flex justify-content-between row ">
                    <div className="col-sm-6">
                        <h2>{"Section " + section.name}</h2>
                    </div>
                    <div className="col-sm-6  text-sm-right sm-mb">
                        <a className="btn btn-outline-danger min-content " href={`${course}/sections/${section.name}/links/add`} role="button">Add Link for Section {section.name}</a>
                    </div>
                </div>
            </div>
            <div>
                <div className="row flex-row">
                    {
                        section.links.map((link) =>
                            <div key={link._id} className="col-xl-3 col-lg-4 col-md-6  pb-3">
                                <div className="card" >
                                    <div className="card-body">
                                        <h5 className="card-title">{link.type}</h5>
                                        <p className="card-text bg-light text-break"><small><samp><a href={link.url}>{link.url}</a></samp></small></p>
                                        <p className="card-text mb-0">
                                            <small className="mr-3 link-black" onClick={() => copyToClipboard(link._id, link.url)}>{copyButtonLabels[link._id]}</small>
                                            <small className="link-black"
                                                onClick={() => setLinkToReport({ id: link._id, type: link.type, url: link.url, date: new Date(link.updatedAt).toDateString(), reason: "" })}>
                                                <i className="fas fa-exclamation-circle" /> Report
                                            </small>
                                        </p>
                                        <p className="card-text "><small className="text-muted">
                                            Added on {new Date(link.updatedAt).toDateString()}
                                        </small></p>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        section.links.length === 0 && (
                            <div className="col-12 pb-3">
                                <div className="card" >
                                    <div className="card-body">
                                        <h6 className="card-text">There are no links yet! Why don't you make one?</h6>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <Header />
            <Container>
                {!serverError &&
                    <div className="justify-content-between row">
                        <div className="col-sm-6 sm-mb" >
                            <h1>{courseDetails.faculty}/{courseDetails.subject} {courseDetails.number} {courseDetails.credits}</h1>
                            <p className="lead mb-0">{courseDetails.name}</p>
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6 justify-content-end align-items-center align-self-center">
                            <div className="">
                                <div className="mb-3">
                                    <a className="btn-block btn btn-outline-light min-content" href={`${course}/sections/add`} role="button">Add Section</a>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </Container>
            <Container style={{paddingBottom: "15px"}}>
                {
                    linkToReport !== "" &&
                    <div>
                        {ReactGA.modalview("/report")}
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal d-block">
                            <div className="modal-dialog modal-dialog-scrollable" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">{reportSubmitted ? "Report Submitted" : "Report a Link"}</h5>
                                        <button type="button" className="close" onClick={() => closeReportModal()}>
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        {
                                            !reportSubmitted &&
                                            <div>
                                                {
                                                    reportError &&
                                                    <div className="alert alert-danger" role="alert">
                                                        Error: {reportError}
                                                    </div>
                                                }
                                                <div className="card" >
                                                    <div className="card-body">
                                                        <h6 className="card-title">{linkToReport.type}</h6>
                                                        <p className="card-text bg-light"><small><samp>{linkToReport.url}</samp></small></p>
                                                        <p className="card-text"><small className="text-muted">
                                                            Added on {linkToReport.date}
                                                        </small></p>
                                                    </div>
                                                </div>
                                                <div className="form-group mt-3">
                                                    <label>Reason for Reporting</label>
                                                    <select
                                                        className={classNames({
                                                            "form-control": true,
                                                            "rounded-0": true,
                                                            "is-valid": linkToReport.reason !== "",
                                                            "is-invalid": linkToReport.reason === "" && linkToReport.reason
                                                        })}
                                                        value={linkToReport.reason}
                                                        onChange={(e) => setLinkToReport({ ...linkToReport, reason: e.target.value })}>
                                                        <option value="">Select a reason...</option>
                                                        <option value="Malformed (not an URL).">Malformed (not an URL).</option>
                                                        <option value="Broken, doesn't work or expired.">Broken, doesn't work or expired.</option>
                                                        <option value="Inappropriate, malicious, misleading or suspicious.">Inappropriate, malicious, misleading or suspicious.</option>
                                                        <option value="Duplicate or already exists.">Duplicate or already exists.</option>
                                                        <option value="Wrong course or section.">Wrong course or section.</option>
                                                        <option value="Added by mistake.">Added by mistake.</option>
                                                        <option value="Zoom or online lecture link.">Zoom or online lecture link.</option>
                                                    </select>
                                                    <div className="invalid-feedback">Please select a reason.</div>
                                                    <ReCAPTCHA sitekey="6LdeTwooAAAAAAp4ooizHD_M4aSG0zq68NcvU5Lo" size="invisible" ref={reRef} />
                                                </div>
                                            </div>
                                        }
                                        {
                                            reportSubmitted &&
                                            <div className="text-center">
                                                <h1><i className="fas fa-check text-danger" /></h1>
                                                <h2>Thanks for reporting!</h2>
                                            </div>
                                        }
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-outline-dark" onClick={() => closeReportModal()}>{reportSubmitted ? "Close" : "Cancel"}</button>
                                        {
                                            !reportSubmitted &&
                                            <button type="button" className="btn btn-danger" disabled={linkToReport.reason === ""} onClick={() => reportLink()}>Submit</button>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {
                    serverError &&
                    <div className="alert alert-danger" role="alert">
                        Error: {serverError}
                    </div>
                }
                {courseDetails && sections}
            </Container>
        </div>
    );
}

export default Course;
