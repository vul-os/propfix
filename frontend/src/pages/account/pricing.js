import React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import StarIcon from '@mui/icons-material/StarBorder';
import Typography from '@mui/material/Typography';

const Pricing = ({ plans, onPlanClick }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={5} alignItems="flex-end">
      {plans.map((tier) => (
        <Grid
          item
          key={tier.title}
          xs={12}
          sm={tier.title === 'Enterprise' ? 12 : 6}
          md={4}
        >
          <Card>
            <CardHeader
              title={tier.title}
              subheader={tier.subheader}
              titleTypographyProps={{ align: 'center' }}
              action={tier.title === 'Pro' ? <StarIcon /> : null}
              subheaderTypographyProps={{
                align: 'center',
              }}
              sx={{
                backgroundColor:
                  theme.palette.mode === 'light'
                    ? theme.palette.grey[200]
                    : theme.palette.grey[700],
              }}
            />
            <CardContent>
              <Box
                component="span" // Replace <div> with <span>
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'baseline',
                  mb: 2,
                }}
              >
                <Typography component="h2" variant="h3" color="text.primary">
                  R{tier.price}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  /mo
                </Typography>
              </Box>
              {tier.description.map((line) => (
                <Typography
                  component="p" // Use a <p> element here
                  variant="subtitle1"
                  align="center"
                  key={line}
                >
                  {line}
                </Typography>
              ))}
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant={tier.buttonVariant}
                onClick={() => onPlanClick(tier.planCode)}
              >
                {tier.buttonText}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Pricing;
