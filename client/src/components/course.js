import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import Header from "./header"

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
            <h2>{"Section " + section.name}</h2>
            <div className="container-fluid">
                <div className="row flex-row">
                    {
                        section.links.map((link) =>
                            <div className="col-sm col-12 pb-3">
                                <div className="card" >
                                    <div className="card-body">
                                        <h5 className="card-title">{link.type}</h5>
                                        <p className="card-text bg-light"><small><samp><a href={link.url}>{link.url}</a></samp></small></p>
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
            <div className="content">
                <Header />
            </div>

            <div className="jumbotron jumbotron-fluid">
                <div className="container">
                    <h1>{courseDetails.subject} {courseDetails.number}</h1>
                    <p className="lead">{courseDetails.name}</p>
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
