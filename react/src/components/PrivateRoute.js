
import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, ...rest }) => {
  const user = sessionStorage.getItem('user'); 
  
 
  return (
    <Route 
      {...rest} 
      element={user ? element : <Navigate to="/login" />} 
    />
  );
};

export default PrivateRoute;
