import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Home from "./components/home"
import CoursesList from "./components/courses-list"
import Course from "./components/course"
import CourseAdd from "./components/course-add"
import SectionAdd from "./components/section-add"
import LinkAdd from "./components/link-add"


function App() {
  return (
      <Router>
        <Route path="/" exact component={Home} />
        <Route path="/courses" exact component={CoursesList} />
        <Route path="/courses/:course" exact component={Course} />
        <Route path="/courses/:course/sections/add" exact component={SectionAdd} />
        <Route path="/courses/:course/links/add" exact component={LinkAdd} />
        <Route path="/courses/add" exact component={CourseAdd} />
      </Router>
  );
}

export default App;
