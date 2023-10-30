import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Profile from './profile';
import Labels from './labels';
import Buildings from './building';
import Organization from './organization';
import InspectionTemplate from './inspections/inspection-template';
import InspectionTemplateGroups from './inspections'
import OtherSettings from './other'; // Import the OtherSettings component
import { useAuthContext } from '../../contexts/auth';


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default function Settings() {
  const [value, setValue] = useState(0);
  const { role } = useAuthContext();
  const isAdmin = role === 'admin'

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  let tabs = [
    { label: 'Profile', content: <Profile /> },
  ];
  if (isAdmin) {
    tabs = [...tabs,
      { label: 'Organization', content: <Organization /> },
      { label: 'Buildings', content: <Buildings /> },
      { label: 'Labels', content: <Labels /> },
      { label: 'Other', content: <OtherSettings /> },
    ];
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} id={`tab-${tab.label}`} />
          ))}
        </Tabs>
      </Box>
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.content}
        </TabPanel>
      ))}
    </Box>
  );
}
