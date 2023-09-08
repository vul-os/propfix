import React from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import BuildingCard from './buildings/building-card';

export default function ReviewSubmitStep({ building, job }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ /* Title styling */ }}>
        Review Your Information
      </Typography>

      <Card variant="outlined" sx={{ padding: 2, /* Card styling */ }}>
        <CardContent>
          <Typography variant="body1" sx={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            Building
          </Typography>
          <Typography variant="body2" paragraph>
            {building ? (
              <>
                <BuildingCard building={building} onSelectBuilding={() => {}} />
              </>
            ) : (
              'No building information available'
            )}
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ padding: 2, /* Card styling */ }}>
        <CardContent>
          <Typography variant="body1" sx={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            Job 
          </Typography>
          <div style={{ /* Container styling */ margin: '10px', minWidth: '200px', cursor: 'pointer', boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 5px', borderRadius: '8px', padding: '10px', backgroundColor: 'rgb(255, 255, 255)', border: '1px solid rgb(204, 204, 204)' }}>
            {Object.entries(job).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', marginRight: '5px' }}>{key}:</Typography>
                <Typography variant="body2" style={{ fontSize: '0.8rem' }}>{value}</Typography>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Stack>
  );
}
