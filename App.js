import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useParams, useHistory, useLocation } from 'react-router-dom';

// Home component
const Home = () => {
  const query = new URLSearchParams(useLocation().search);
  const uuid = query.get('uuid');

  return (
    <div>
      <h2>Home Page</h2>
      {uuid && <p>Returned with UUID: {uuid}</p>}
      <p>Welcome to the home page.</p>
    </div>
  );
};

// Component for handling /base/:uuid
const YourComponent = () => {
  const { uuid } = useParams();
  const history = useHistory();

  useEffect(() => {
    // Automatically navigate to home with UUID when the component mounts
    history.push(`/?uuid=${uuid}`);
  }, [uuid, history]);

  return null; // This component doesn't need to render anything
};

// NotFound component for handling unknown routes
const NotFound = () => {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>Sorry, the page you're looking for doesn't exist.</p>
    </div>
  );
};

// Main App component
const MyApp = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/base/:uuid" component={YourComponent} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default MyApp;

