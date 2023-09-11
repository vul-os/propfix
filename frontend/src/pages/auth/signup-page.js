import React from 'react';
import { Helmet } from 'react-helmet-async';
import { styled } from '@mui/material/styles';
import { Container, Typography, Divider, Stack, Button, Link } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResponsive } from '../../hooks/use-responsive';
import Logo from '../../components/logo';
import Iconify from '../../components/iconify';
import SignUpForm from './signup-form'; // Replace with the correct path
import { useAuthContext } from '../../contexts/auth';

const StyledRoot = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledSection = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(5),
}));

const StyledContent = styled('div')(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export default function SignUpPage() {
  const mdUp = useResponsive('up', 'md');
  const navigate = useNavigate();
  const location = useLocation();
  const { signUpWithGoogle } = useAuthContext();

  const handleGoogleSignUp = async () => {
    try {
      await signUpWithGoogle();
      const { from } = location.state || { from: { pathname: '/' } };
      navigate(from);
    } catch (error) {
      console.error(error);
      // Handle sign-up error
    }
  };

  const handleLoginLinkClick = () => {
    navigate('/auth/login');
  };

  return (
    <StyledRoot>
      <Helmet>
        <title>Sign Up | Your App Name</title>
      </Helmet>

      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, sm: 24, md: 40 },
          left: { xs: 16, sm: 24, md: 40 },
        }}
      />

      {/* Remove or comment out the "Join Us Today!" section */}
      {/* <StyledSection>
        <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
          Join Us Today!
        </Typography>
        // Include any other visual elements you want
      </StyledSection> */}

      <Container maxWidth="sm">
        <StyledContent>
          <Typography variant="h4" gutterBottom>
            Create an Account
          </Typography>

          <Typography variant="body2" sx={{ mb: 5 }}>
            Already have an account?{' '}
            <Button
              component={Link}
              variant="subtitle2"
              onClick={handleLoginLinkClick}
            >
              Login
            </Button>
          </Typography>

          <SignUpForm />

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              OR
            </Typography>
          </Divider>

          <Stack direction="row" spacing={2}>
            <StyledButton
              onClick={handleGoogleSignUp}
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
            >
              <Iconify icon="eva:google-fill" color="#DF3E30" width={22} height={22} />
            </StyledButton>
            {/* Include other social sign-up buttons */}
          </Stack>
        </StyledContent>
      </Container>
    </StyledRoot>
  );
}
