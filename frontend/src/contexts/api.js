import React, { createContext, useContext } from 'react';
import { useAuthContext } from './auth'; // Import the AuthContext

const ApiContext = createContext();

const ApiProvider = ({ children }) => {
  const { getIdToken } = useAuthContext(); // Access the getIdToken function from the AuthContext

  // Define the postRequest function that includes the ID token in the headers
  const postRequest = async (url, route, requestBody) => {
    try {
      const token = await getIdToken(); // Get the ID token from the AuthContext

      const fullUrl = `${url}/${route}`;

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  // Provide the postRequest function in the ApiContext
  const apiContextValue = {
    postRequest
  };

  return (
    <ApiContext.Provider value={apiContextValue}>
      {children}
    </ApiContext.Provider>
  );
};

const useApiContext = () => useContext(ApiContext); // Custom hook to access the ApiContext

export { ApiProvider, useApiContext };
