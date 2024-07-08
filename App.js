import React from 'react';
import { BrowserRouter as Router, Route, Switch, useParams, useHistory, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState } from 'react';

const App = () => {
  return (
    <Router basename={process.env.PUBLIC_URL}>
        <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/base/:uuid" component={YourComponent} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );


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

  

const YourComponent = () => {
  const { uuid } = useParams();
  const history = useHistory();

  React.useEffect(() => {
    // Simulate some success or failure
    const isSuccess = Math.random() < 0.5;

    if (isSuccess) {
      toast.success(`UUID: ${uuid} successfully processed!`);
    } else {
      toast.error(`Failed to process UUID: ${uuid}. Please try again.`);
    }

    // Redirect after 3 seconds
    setTimeout(() => {
      history.push(`/?uuid=${uuid}`);
    }, 3000);

  }, [uuid, history]);

  return (
    <div>
      <h2>Processing UUID: {uuid}</h2>
      {/* Displaying toast container */}
      <ToastContainer />
    </div>
  );
};

const NotFound = () => {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>Sorry, the page you're looking for doesn't exist.</p>
    </div>
  );
};
const [authenticated, setAuthenticated] = useState(false);
  const [secretKey, setSecretKey] = useState('');

  const handleLogin = () => {
    // Check if the entered key matches the secret key
    if (secretKey === 'yourSecretKey') {
      localStorage.setItem('authenticated', 'true');
      setAuthenticated(true);
    } else {
      alert('Invalid secret key!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authenticated');
    setAuthenticated(false);
  };

  return (
    <div>
      {!authenticated ? (
        <div>
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Enter secret key"
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h1>Authenticated Content</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default App;
