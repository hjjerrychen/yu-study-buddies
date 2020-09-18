import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from 'react-router-dom';
import axios from 'axios';

function LinkAdd() {
    let { course, section } = useParams();
    const [type, setType] = useState("Facebook Messenger");
    const [customType, setCustomType] = useState("");
    const [url, setURL] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        const request = {
            "type": (type === "Other" ? customType : type),
            "url": url
        }
        axios.post(`http://localhost:8080/courses/${course}/sections/${section}/link`, request)
            .then(response => {
                setSubmitted(true);
            })
            .catch((error) => {
                console.log(error);
            })

    }
    return (
        <div className="nav-offset">
            <div className="jumbotron jumbotron-fluid">
                <div className="container">
                    <div className="d-flex justify-content-between">
                        <div>
                            <h1>Add a Link for {course}, Section {section}</h1>
                        </div>
                    </div>
                </div>
            </div>
            { !submitted &&
                <div className="container">
                    <form novalidate>
                        <div className="form-group">
                            <label for="courseName">Type</label>
                            <select class="form-control rounded-0" value={type} onChange={(e) => setType(e.target.value)} >
                                <option value="none">Select a type...</option>
                                <option value="Facebook Messenger">Facebook Messenger</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Discord">Discord</option>
                                <option value="WeChat">WeChat</option>
                                <option value="Other">Other</option>
                            </select>
                            {type === "Other" && <input type="text" className="form-control rounded-0 mt-3" value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="Type" />}
                            {/* <small className="form-text text-muted">For WeChat</small> */}
                            <div className="invalid-feedback">Please include the type.</div>
                        </div>

                        <div className="form-group">
                            <label for="courseName">URL</label>
                            <input type="text" className="form-control rounded-0" id="url" value={url} onChange={(e) => setURL(e.target.value)} placeholder="https://www.google.com" />
                            <div className="invalid-feedback">Please include the link URL.</div>
                        </div>
                        <button type="submit" className="btn btn-danger" onClick={submit} >Create Link</button>
                    </form>
                </div>
            }
            {
                submitted &&
                <div className="container">
                    <h1>The link has been created!</h1>
                    <a class={"btn btn-danger mt-5"} href={`/courses/${course}`} role="button">{`Go Back to ${course}`}</a>
                </div>
            }
        </div>
    );
}

export default LinkAdd;
