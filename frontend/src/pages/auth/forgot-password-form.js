import React, { useState } from 'react';
import { TextField, Button, Stack, Typography, Snackbar, Alert } from '@mui/material';
import { supabase } from '../supabaseClient'; // Import your Supabase client instance

export default function ForgotPasswordForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState(null);

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.api.resetPasswordForEmail(email);

      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
        setError(null);
        onSuccess(); // Notify parent component of success
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="body1">
        Enter your email address to receive a password reset link.
      </Typography>

      <TextField
        label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleResetPassword}
      >
        Send Reset Link
      </Button>

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
        <Alert severity="success">
          A password reset link has been sent to your email address.
        </Alert>
      )}
    </Stack>
  );
}
