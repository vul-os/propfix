import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Iconify from '../../components/iconify';
import { useAuthContext } from '../../contexts/auth';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuthContext();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(null); // State for email error
  const [passwordError, setPasswordError] = useState(null); // State for password error

  const handleClick = async () => {
    setEmailError(null); // Reset email error
    setPasswordError(null); // Reset password error

    // Validate email format
    if (!isValidEmail(email)) {
      setEmailError('Invalid email address');
      return;
    }

    try {
      await signIn(email, password);
      // Login successful, navigate to the desired route
      const { from } = location.state || { from: { pathname: '/' } };
      navigate(from);
    } catch (error) {
      console.error(error);
      setPasswordError('Invalid password'); // Handle login error
    }
  };

  // Function to check if the email is valid
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField
          name="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!emailError} // Highlight email field red if there's an error
          helperText={emailError} // Display email error message
        />

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          error={!!passwordError} // Highlight password field red if there's an error
          helperText={passwordError} // Display password error message
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Checkbox name="remember" label="Remember me" />
        <Link component={RouterLink} to="/auth/forgot-password" variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
        Login
      </LoadingButton>
    </>
  );
}
