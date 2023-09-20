import React, { useState, useEffect } from 'react';
// @mui
import PropTypes from 'prop-types';

import { useAuthContext } from '../../../contexts/auth'; 
import { executeQuery } from '../../../api/dashboard'; 
import WidgetSummaryComponent from "./widget-summary-component"



export default function WidgetSummary({ name, templates, ...other }) {
  const [data, setData] = useState(null);


  const { getIdToken, user, activeOrganization } = useAuthContext(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getIdToken(); // Get the JWT token from the auth context
        const response = await executeQuery(name, templates, activeOrganization, token);

        if (response.data) {
          const jsonResponse = response
          const firstElement = jsonResponse.data && Object.keys(jsonResponse.data)[0] && 
            jsonResponse.data[Object.keys(jsonResponse.data)[0]][0];
  
          // Handle the successful response here
          console.log('Request was successful');
  
          setData(firstElement); // Set the retrieved data in state
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    if (activeOrganization) {
        fetchData();
    }
  }, [activeOrganization]); // Empty dependency array ensures the effect runs only once

  return (
    <div>
      { !data ? (
        <p>Loading...</p>
      ) : (
        <WidgetSummaryComponent total={data} {...other}/>
      )}
    </div>
  );
}
