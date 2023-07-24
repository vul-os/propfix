import React, { useState, useEffect } from 'react';
// @mui
import PropTypes from 'prop-types';

import WidgetSummaryComponent from "./widget-summary-component"
import { useApiContext } from '../../../contexts/api';

WidgetSummary.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  sx: PropTypes.object,

  name: PropTypes.string.isRequired,
};


export default function WidgetSummary({ url, name, templates, ...other }) {
  const [data, setData] = useState(null);
  const { postRequest } = useApiContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const route = 'execute';
        const requestBody = {
          "template_dict": templates,
          "name": name,
        };

        await postRequest(url, route, requestBody);
        const response = await postRequest(url, route, requestBody);

        const jsonResponse = response
        const firstElement = jsonResponse.data && Object.keys(jsonResponse.data)[0] && 
          jsonResponse.data[Object.keys(jsonResponse.data)[0]][0];

        // Handle the successful response here
        console.log('Request was successful');

        setData(firstElement); // Set the retrieved data in state
      } catch (error) {
        // Handle any errors here
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once

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
