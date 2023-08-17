import React from 'react';
import { Helmet } from 'react-helmet-async';
import { styled } from '@mui/material/styles';
import { Link, Container, Typography, Divider, Stack, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResponsive } from '../../hooks/use-responsive';
import Logo from '../../components/logo';
import Iconify from '../../components/iconify';
import SignUpForm from './SignUpForm';
import { useAuthContext } from '../../contexts/auth';

// Reuse the StyledRoot, StyledSection, and StyledContent components
const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.customShadows.card,
  backgroundColor: "#FFFFFF",
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
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
      // Handle sign-up error
    }
  };

  return (
    <>
      <Helmet>
        <title> Sign Up | Your App Name </title>
      </Helmet>

      <StyledRoot>
        <Logo
          sx={{
            position: 'fixed',
            top: { xs: 16, sm: 24, md: 40 },
            left: { xs: 16, sm: 24, md: 40 },
          }}
        />

        {mdUp && (
          <StyledSection>
            <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
              Welcome, Join Us
            </Typography>
            {/* Include any other visual elements you want */}
          </StyledSection>
        )}

        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom>
              Sign Up
            </Typography>

            <SignUpForm />

            <Button
              onClick={() => handleGoogleSignUp()}
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
            >
              <Iconify icon="eva:google-fill" color="#DF3E30" width={22} height={22} />
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                OR
              </Typography>
            </Divider>

            {/* Include other UI elements */}
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
