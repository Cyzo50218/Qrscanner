import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useParams,
  Redirect
} from 'react-router-dom';

const Home = () => <div>Welcome to our qrscanner website redirectory</div>;

const UUIDPage = () => {
  let { uuid } = useParams();
  return (
    <div>
      <h2>Redirecting you to your destination...</h2>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/base/:uuid" component={UUIDPage} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
