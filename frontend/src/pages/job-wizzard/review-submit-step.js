import React from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import BuildingCard from './buildings/building-card'; // Import the BuildingCard component

export default function ReviewSubmitStep({ building, job }) { // Updated props to building and job
  console.log('building:', building);
  console.log('job:', job);

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Review Your Information</Typography>

      <Card variant="outlined" sx={{ padding: 2 }}>
        <CardContent>
          <Typography variant="body1">Building Info:</Typography>
          <Typography variant="body2" paragraph>
            {building ? (
              <>
                <BuildingCard building={building} onSelectBuilding={() => {}} /> {/* Use BuildingCard component */}
              </>
            ) : (
              'No building information available'
            )}
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ padding: 2 }}>
        <CardContent>
          <Typography variant="body1">Job Info:</Typography>
          <Typography variant="body2" paragraph>
            {Object.entries(job).map(([key, value]) => (
              <React.Fragment key={key}>
                {key}: {value}
                <br />
              </React.Fragment>
            ))}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
