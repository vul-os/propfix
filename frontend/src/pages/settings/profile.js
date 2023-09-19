import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import EmailIcon from '@mui/icons-material/Email';
import { createTheme, styled, ThemeProvider } from '@mui/material/styles';

import { useAuthContext } from '../../contexts/auth';

// Define a custom theme with primary and secondary colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#800080', // Purple color for the border and buttons
    },
    secondary: {
      main: '#3f51b5', // Secondary color (blue in this example) for the buttons
    },
    pink: {
      main: '#ff4081', // Pink color for the Reset Password button
    },
    purple: {
      main: '#800080', // Purple color for the Log Out button
    },
  },
});

const ProfileCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: 'white', // White background
  borderRadius: theme.spacing(1), // Rounded corners
  boxShadow: 'none', // No shadow
  border: `2px solid ${theme.palette.pink.main}`, // Pink border
}));

const ProfileContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const WhiteIcon = styled('span')(({ theme }) => ({
  color: 'white', // Set the color to white
  display: 'flex',
  alignItems: 'center',
}));

const ColoredButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  background: 'transparent', // Transparent background
  color: 'white', // Text color
  border: 'none', // No border
  '&:hover': {
    background: 'transparent', // Transparent background on hover
  },
}));

const PinkButton = styled(ColoredButton)(({ theme }) => ({
  background: theme.palette.pink.main, // Pink background for Reset Password button
  '&:hover': {
    background: theme.palette.pink.dark, // Darker pink background on hover
  },
}));

const PurpleButton = styled(ColoredButton)(({ theme }) => ({
  background: theme.palette.purple.main, // Purple background for Log Out button
  '&:hover': {
    background: theme.palette.purple.dark, // Darker purple background on hover
  },
}));

const BlackEmailIcon = styled(EmailIcon)(({ theme }) => ({
  color: 'black', // Set the color to black
}));

const Profile = () => {
  const { user } = useAuthContext();

  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <ProfileCard>
            <ProfileContent>
              <WhiteIcon>
                <Avatar
                  alt="User Avatar"
                  src={user?.photoURL}
                  sx={{
                    width: 100,
                    height: 100,
                    marginBottom: theme.spacing(2),
                    // No color or background specified for the Avatar to use the default colors
                  }}
                >
                  {user ? user.displayName?.charAt(0).toUpperCase() : ''}
                </Avatar>
                <Typography variant="h5" component="h2">
                  {user ? user.displayName : 'User Name'}
                </Typography>
              </WhiteIcon>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: theme.spacing(2) }}>
                <WhiteIcon>
                  <BlackEmailIcon fontSize="large" /> {/* Use the BlackEmailIcon with black color */}
                </WhiteIcon>
                <Typography variant="subtitle1" gutterBottom style={{ marginLeft: theme.spacing(1), marginTop: theme.spacing(1) }}>
                  {user ? user.email : 'Email: user@example.com'}
                </Typography>
              </div>
            </ProfileContent>
          </ProfileCard>
        </Grid>
        <Grid item xs={12}>
          <PinkButton
            variant="outlined"
            color="pink"
            onClick={() => {
              // Handle Reset Password click
            }}
          >
            Reset Password
          </PinkButton>
          <PurpleButton
            variant="outlined"
            color="purple"
            sx={{ marginLeft: theme.spacing(2) }}
            onClick={() => {
              // Handle Log Out click
            }}
          >
            Log Out
          </PurpleButton>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Profile;
