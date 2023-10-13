import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import { styled, useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

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
  const { user, sendPasswordResetLink, signOut } = useAuthContext();

  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

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

  const handleResetPasswordClick = () => {
    setResetPasswordDialogOpen(true);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleCloseResetPasswordDialog = () => {
    setResetPasswordDialogOpen(false);
  };

  const handleCloseLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };

  const confirmResetPassword = async () => {
    try {
      await sendPasswordResetLink(user.email);
      handleCloseResetPasswordDialog();
    } catch (error) {
      console.error(error);
      handleCloseResetPasswordDialog();
    }
  };

  const confirmLogout = async () => {
    try {
      await signOut();
      handleCloseLogoutDialog();
    } catch (error) {
      console.error(error);
      handleCloseLogoutDialog();
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <ProfileCard>
          <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar alt="User Avatar" src={user?.photoURL} sx={{ width: 100, height: 100, marginBottom: theme.spacing(2) }} />

            <Typography variant="h5" component="h2" sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'primary.main', marginBottom: '1rem' }}>
              {user ? user.displayName : (
                <>
                  {renderNameIcon()}
                  User Name
                </>
              )}
            </Typography>

            <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center" sx={{ fontSize: '1rem', color: 'text.secondary' }}>
              {renderEmailIcon()}
              {user ? user.email : 'Email: user@example.com'}
            </Typography>
          </CardContent>
        </ProfileCard>
      </Grid>

      <Grid item xs={12}>
        <Button variant="outlined" color="primary" sx={{ marginTop: theme.spacing(2) }} onClick={handleResetPasswordClick}>
          Reset Password
        </Button>
        <Button variant="outlined" color="secondary" sx={{ marginTop: theme.spacing(2), marginLeft: theme.spacing(2) }} onClick={handleLogoutClick}>
          Log Out
        </Button>
      </Grid>

      <Dialog open={resetPasswordDialogOpen} onClose={handleCloseResetPasswordDialog}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset your password? An email with instructions will be sent to your registered email address.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetPasswordDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmResetPassword} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={logoutDialogOpen} onClose={handleCloseLogoutDialog}>
        <DialogTitle>Log Out</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to log out?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogoutDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmLogout} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default Profile;
