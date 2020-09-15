import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from 'react-router-dom';
import axios from 'axios';

function SectionAdd() {
    let { course } = useParams();
    const [name, setName] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        const request = {
            "name": name
        }
        axios.post(`http://localhost:8080/courses/${course}/sections`, request)
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
                            <h1>Add a Section to {course}</h1>
                        </div>
                    </div>
                </div>
            </div>

            { !submitted &&
                <div className="container">
                    <form novalidate>
                        <div className="form-group">
                            <label for="courseName">Section Name</label>
                            <input type="text" className="form-control rounded-0" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="A" />
                            <div className="invalid-feedback">Please include the section name.</div>
                        </div>
                        <button type="submit" className="btn btn-danger" onClick={submit} >Create Section</button>
                    </form>
                </div>
            }
            {
                submitted &&
                <div className="container">
                    <h1>The section has been created!</h1>
                    <a class={"btn btn-danger mt-5"} href={`/courses/${course}`} role="button">{`Go back to ${course}`}</a>
                </div>
            }
        </div>
    );
}

export default SectionAdd;
