import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';

function CourseAdd() {
    const [subject, setSubject] = useState("");
    const [number, setNumber] = useState("");
    const [name, setName] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        const request = {
            "name": name,
            "subject": subject,
            "number": number
        }
        axios.post("http://localhost:8080/courses/", request)
            .then(response => {
                setSubmitted(true);
            })
            .catch((error) => {
                console.log(error);
            })

    }

    return (
        <div>
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
                    <form >
                        <label for="courseCode">Course Code</label>
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <small className="form-text text-muted">Subject Code</small>
                                <input
                                    type="text"
                                    className="form-control rounded-0"
                                    value={subject} onChange={(e) => setSubject(e.target.value)}
                                    placeholder="ECON"
                                    required
                                />
                                <div className="invalid-feedback">Please include the valid course subject.</div>
                            </div>
                            <div className="form-group col-md-6">
                                <small className="form-text text-muted">Course Number</small>
                                <input
                                    type="text"
                                    className="form-control rounded-0"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    placeholder="1000"
                                    required
                                />
                                <div className="invalid-feedback">Please include the valid course number.</div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label for="courseName">Course Name</label>
                            <input
                                type="text"
                                className="form-control rounded-0"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Introduction to Microeconomics"
                                required
                            />
                            <div className="invalid-feedback">Please include the course name.</div>
                        </div>
                        <button type="submit" className="btn btn-danger" onClick={submit} >Create Course</button>
                    </form>
                </div>
            }

            {
                submitted &&
                <div className="container">
                    <h1>The course has been created!</h1>
                    <a class={"btn btn-danger mt-5"} href={`/courses/${subject}${number}`} role="button">{`Go to ${subject}${number}`}</a>
                </div>
            }
        </div>
    );
}

export default CourseAdd;
