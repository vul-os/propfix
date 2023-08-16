import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Link,
  Stack,
  TextField,
  Typography,
  Button,
  Snackbar,
} from '@mui/material';
import { Alert } from '@mui/material';
import { useAuthContext } from '../../contexts/auth';

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
      setError('Error sending reset link. Please check your email.');
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Forgot Password</Typography>
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

      <Link component={RouterLink} to="/login" variant="subtitle2">
        Return to Login
      </Link>

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
  );
}
