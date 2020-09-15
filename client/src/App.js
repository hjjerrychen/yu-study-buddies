import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Home from "./components/home"
import Course from "./components/course"
import Footer from "./components/footer"
import CourseAdd from "./components/course-add"
import SectionAdd from "./components/section-add"
import LinkAdd from "./components/link-add"
import Header from "./components/header"
import NotFound from "./components/404"


function App() {
  return (
    <div className="wrapper">
      <Router>
        <Switch>
          <Route exact path="/"> <Header white /></Route>
          <Route component={Header} />
        </Switch>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/courses/add" component={CourseAdd} />
          <Route exact path="/courses/:course" component={Course} />
          <Route exact path="/courses/:course/sections/add" component={SectionAdd} />
          <Route exact path="/courses/:course/sections/:section/links/add" component={LinkAdd} />
          <Route component={NotFound} />
        </Switch>
        <Switch>
          <Route exact path="/" />
          <Route component={Footer} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
