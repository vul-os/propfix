import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { styled } from '@mui/material/styles';
import { Typography, Stack, TextField, Button, Snackbar, Alert } from '@mui/material';
import { useAuthContext } from '../../contexts/auth';

const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
}));

const StyledSection = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuthContext();
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState(null);

  const handleResetPassword = async () => {
    try {
      await resetPassword(email);
      setResetSent(true);
      setError(null);
    } catch (err) {
      console.log(err)
      setError('Error sending reset link. Please check your email.');
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
  };

  return (
    <StyledRoot>
      <Helmet>
        <title>Forgot Password | Your App Name</title>
      </Helmet>

      <StyledSection>
        <Stack spacing={3}>
          <Typography variant="h4">Forgot Password</Typography>
          <Typography variant="body1">
            Enter your email address to receive a password reset link.
          </Typography>

          <TextField
            label="Email address"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />

          <StyledButton
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleResetPassword}
          >
            Send Reset Link
          </StyledButton>

          <Snackbar
            open={error !== null}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <Alert severity="error" onClose={handleCloseSnackbar}>
              {error}
            </Alert>
          </Snackbar>

          {resetSent && (
            <Typography variant="body1">
              A password reset link has been sent to your email address.
            </Typography>
          )}
        </Stack>
      </StyledSection>
    </StyledRoot>
  );
}
