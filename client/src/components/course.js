import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee } from '@fortawesome/free-solid-svg-icons'

function Course(props) {
    let { course } = useParams();
    const [courseDetails, setCourseDetails] = useState("");

    useEffect(() => {
        const getCourseData = async () => await axios.get(`http://localhost:8080/courses/${course}`)
            .then(response => {
                setCourseDetails(response.data)
            })
            .catch((error) => {
                console.log(error);
            })
        getCourseData();
    }, []);


    const sections = courseDetails && courseDetails.sections.map((section) =>

        <div className="mt-3">
            <div className="d-flex justify-content-between">
                <h2 className="">{"Section " + section.name}</h2>
                <a className="btn btn-outline-danger min-content" href={`${course}/sections/${section.name}/links/add`} role="button">Add Link for Section {section.name}</a>
            </div>
            <div className="container-fluid">
                <div className="row flex-row">
                    {
                        section.links.map((link) =>
                            <div className="col-sm col-12 pb-3">
                                <div className="card" >
                                    <div className="card-body">
                                        <h5 className="card-title">{link.type}</h5>
                                        <p className="card-text bg-light"><small><samp><a href={link.url}>{link.url}</a></samp></small></p>
                                        <button type="button" class="btn btn-outline-dark btn-sm mr-2">
                                            <i class="far fa-copy" /> Copy
                                        </button>
                                        <button type="button" class="btn btn-outline-dark btn-sm">
                                            <i class="fas fa-exclamation-circle"></i> Report
                                        </button>
                                        <p className="card-text"><small className="text-muted">Added on {new Date(link.updatedAt).toDateString()}</small></p>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        section.links.length === 0 && (
                            <div className="col-12">
                                <div className="card" >
                                    <div className="card-body">
                                        <h6 className="card-text">There's no links yet for this section! Why don't you add one?</h6>
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
            <div className="jumbotron jumbotron-fluid">
                <div className="container">
                    <div className="d-flex justify-content-between">
                        <div>
                            <h1>{courseDetails.faculty || ""}/{courseDetails.subject} {courseDetails.number}</h1>
                            <p className="lead mb-0">{courseDetails.name}</p>
                        </div>
                        <div className="">
                            <div div className="d-flex flex-column">
                                <a className="btn btn-outline-light min-content" href={`${course}/sections/add`} role="button">Add Section</a>
                            </div>

                            {courseDetails.faculty && courseDetails.credits &&
                                <div className="d-flex flex-column mt-3">
                                    <a className="btn btn-outline-light min-content"
                                        target="_blank"
                                        href={`https://w2prod.sis.yorku.ca/Apps/WebObjects/cdm.woa/wa/crsq?fa=${courseDetails.faculty}&sj=${courseDetails.subject}&cn=${courseDetails.number}&cr=${courseDetails.credits}&ay=2020&ss=FW`}
                                        role="button">
                                        View Course on REM <i class="fas fa-external-link-alt"></i>
                                    </a>
                                </div>
                            }
                        </div>
                    </div>

                </div>
            </div>
            <div className="container">
                {courseDetails && sections}
                {/* <div className="container-fluid">
                    <div className="row flex-row">
                        <div className="col-3">
                            <div className="card" >
                                <div className="card-body">
                                    <h5 className="card-title">WhatsApp</h5>
                                    <p className="card-text bg-light"><samp><a>https://GOOGLE>COM</a></samp></p>
                                    <p className="card-text"><small className="text-muted">Added 3 mins ago</small></p>
                                </div>
                            </div>
                        </div>


                        <div className="col-3">
                            <div className="card" >
                                <div className="card-body">
                                    <h5 className="card-title">WhatsApp</h5>
                                    <p className="card-text bg-light"><samp><a>https://GOOGddddddddddddddLE>COM</a></samp></p>
                                    <p className="card-text"><small className="text-muted">Added 3 mins ago</small></p>
                                </div>
                            </div>
                        </div>



                    </div>
                </div> */}
            </div>
        </div>
    );
}

export default Course;
