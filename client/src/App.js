import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ReactGA from 'react-ga';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import {Home} from "./components/Home"
import Course from "./components/Course"
import LinkAdd from "./components/LinkAdd"
import NotFound from "./components/404"

const analyticsTrackingID = "UA-115566042-3"

ReactGA.initialize(analyticsTrackingID);
ReactGA.pageview(window.location.pathname + window.location.search)

function App() {
  return (
    <div className="wrapper">
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/courses/:course" component={Course} />
          <Route exact path="/courses/:course/sections/:section/links/add" component={LinkAdd} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
