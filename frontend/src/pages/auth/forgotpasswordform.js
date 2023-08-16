import { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  FormHelperText,
} from '@mui/material';
import { useAuthContext } from '../../contexts/auth';

export default function ForgotPasswordForm() {
  const { resetPassword } = useAuthContext();

  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleForgotPassword = async () => {
    try {
      await resetPassword(email);
      setError(null);
      setSuccessMessage('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError('Error sending reset email. Please check your email address.');
    }
  };

  return (
    <div>
      <TextField
        label="Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        variant="outlined"
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleForgotPassword}
      >
        Reset Password
      </Button>
      {error && (
        <FormHelperText error>{error}</FormHelperText>
      )}
      {successMessage && (
        <Typography color="textSecondary">{successMessage}</Typography>
      )}
    </div>
  );
}
