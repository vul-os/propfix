import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import { styled, useTheme } from '@mui/material/styles';

import { useAuthContext } from '../../contexts/auth';

const ProfileCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const IconWrapper = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(1),

  '& svg': {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(0.5),
  },
}));

const Profile = () => {
  const theme = useTheme();
  const { user } = useAuthContext();

  const renderNameIcon = () => (
    <IconWrapper>
      <PersonIcon fontSize="small" />
    </IconWrapper>
  );

  const renderEmailIcon = () => (
    <IconWrapper>
      <EmailIcon fontSize="small" />
    </IconWrapper>
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <ProfileCard>
          <CardContent>
            <Avatar alt="User Avatar" src={user?.photoURL} sx={{ width: 100, height: 100, marginBottom: theme.spacing(2) }} />

            <Typography variant="h5" component="h2">
              {user ? user.displayName : (
                <>
                  {renderNameIcon()}
                  User Name
                </>
              )}
            </Typography>

            <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center">
              {renderEmailIcon()}
              {user ? user.email : 'Email: user@example.com'}
            </Typography>
          </CardContent>
        </ProfileCard>
      </Grid>
      <Grid item xs={12}>
        <Button variant="outlined" color="primary" sx={{ marginTop: theme.spacing(2) }}>
          Reset Password
        </Button>
        <Button variant="outlined" sx={{ marginTop: theme.spacing(2), marginLeft: theme.spacing(2) }}>
          Log Out
        </Button>
      </Grid>
    </Grid>
  );
};

export default Profile;
