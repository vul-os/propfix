import React, { useState, useEffect } from 'react';
// @mui
import PropTypes from 'prop-types';

import { useAuthContext } from '../../../contexts/auth'; 
import { executeQuery } from '../../../api/dashboard'; 
import WidgetSummaryComponent from "../../../components/widget-summary"



export default function WidgetSummary({ name, templates, ...other }) {
  const [data, setData] = useState(null);


  const { activeOrganization } = useAuthContext(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await executeQuery(name, templates, activeOrganization);
        if (response) {
          try {
            const jsonResponse = response
        
            if (jsonResponse.data && typeof jsonResponse.data === 'object') {
              const firstElement = Object.values(jsonResponse.data)[0][0];
              // Handle the successful response here
              console.log('Request was successful');
              
              // Assuming setData is a function to set the state
              setData(firstElement); // Set the retrieved data in state
            } else {
              console.error('Invalid data structure in the response');
            }
          } catch (error) {
            console.error('Error parsing JSON response:', error);
          }
        } else {
          setData(null); // Set the retrieved data in state
          console.error('No response received');
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
      { data === null ? (
        <p>Loading...</p>
      ) : (
        <WidgetSummaryComponent total={data} {...other}/>
      )}
    </div>
  );
}
