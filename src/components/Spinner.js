import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Spinner = ({path='login'}) => {
  const navigate = useNavigate();
  const [counter, setCounter] = useState(5);
  const location = useLocation()

  useEffect(() => {
    const timer = setTimeout(() => {
      // Redirect to /login after 5 seconds
      navigate(`/${path}`,{
        state:location.pathname
      });
    }, 5000);

    // Update the counter every second
    const interval = setInterval(() => {
      setCounter((prevCounter) => prevCounter - 1);
    }, 1000);

    // Clear the timer and interval when the component unmounts
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate, location, path]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '100vh' }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p>Redirecting in {counter} seconds</p>
    </div>
  );
};

export default Spinner;
