import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useParams,
  Redirect
} from 'react-router-dom';

const Home = () => <div>Welcome to the main page!</div>;

const UUIDPage = () => {
  let { base, uuid } = useParams();
  return (
    <div>
      <h2>Detected Base: {base}</h2>
      <h3>UUID/Text: {uuid}</h3>
    </div>
  );
};

function App() {
  return (
    <Router basename="/Qrscanner">
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/base/:uuid" component={UUIDPage} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
