import React from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';

export default function ReviewSubmitStep({ unitInfo, jobInfo }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Review Your Information</Typography>
      
      <Card variant="outlined" sx={{ padding: 2 }}>
        <CardContent>
          <Typography variant="body1">Unit Info:</Typography>
          <Typography variant="body2" paragraph>
            {Object.entries(unitInfo).map(([key, value]) => (
              <React.Fragment key={key}>
                {key}: {value}
                <br />
              </React.Fragment>
            ))}
          </Typography>
        </CardContent>
      </Card>
      
      <Card variant="outlined" sx={{ padding: 2 }}>
        <CardContent>
          <Typography variant="body1">Job Info:</Typography>
          <Typography variant="body2" paragraph>
            {Object.entries(jobInfo).map(([key, value]) => (
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
