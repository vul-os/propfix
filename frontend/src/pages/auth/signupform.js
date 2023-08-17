import { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthContext } from '../../contexts/auth';

export default function SignUpForm() {
  const { signUp } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    try {
      await signUp(email, password);
      setError(null);
      // Redirect the user after successful sign-up
      // You can use React Router or any other routing mechanism here
    } catch (err) {
      setError('Error signing up. Please check your details.');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel>Password</InputLabel>
        <OutlinedInput
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={toggleShowPassword}
                onMouseDown={(e) => e.preventDefault()}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Password"
        />
        <FormHelperText>
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            'Enter your password'
          )}
        </FormHelperText>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSignUp}
      >
          Sign Up
        </Button>
    </div>
  );
}
