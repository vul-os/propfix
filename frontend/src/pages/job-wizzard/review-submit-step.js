import React from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import BuildingCard from './buildings/building-card';

// Helper function to format text
const formatText = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1).replace(/([A-Z])/g, ' $1');
};

export default function ReviewSubmitStep({ building, job }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ paddingTop: "18px" }}>
        Review Your Information
      </Typography>

      <Typography variant="body1" sx={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
        Building
      </Typography>
      {building ? (
        <>
          <BuildingCard building={building} onSelectBuilding={() => {}} />
        </>
      ) : (
        'No building information available'
      )}

      <Typography variant="body1" sx={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
        Job 
      </Typography>
      <div style={{ /* Container styling */ margin: '10px', minWidth: '200px', cursor: 'pointer', boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 5px', borderRadius: '8px', padding: '10px', backgroundColor: 'rgb(255, 255, 255)', border: '1px solid rgb(204, 204, 204)' }}>
        {Object.entries(job).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', marginRight: '5px' }}>
              {formatText(key)}:
            </Typography>
            <Typography variant="body2" style={{ fontSize: '0.8rem' }}>{value}</Typography>
          </div>
        ))}
      </div>
    </Stack>
  );
}
