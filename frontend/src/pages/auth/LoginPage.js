import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { styled } from '@mui/material/styles';
import { Link, Container, Typography, Divider, Stack, Button } from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';

import { useResponsive } from '../../hooks/use-responsive';
import Logo from '../../components/logo';
import Iconify from '../../components/iconify';
import LoginForm from './LoginForm';

import { useAuthContext } from '../../contexts/auth';

const globalCss = `
  /* Add the CSS to prevent scrolling */
  body.no-scroll {
    overflow: hidden;
  }
`;

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

export default function LoginPage() {
  const mdUp = useResponsive('up', 'md');
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, isAuthenticated } = useAuthContext();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      const { from } = location.state || { from: { pathname: '/' } };
      navigate(from);
    } catch (error) {
      // Handle sign-in error
    }
  };

  // Add this effect to prevent scrolling
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  return (
    <>
      <Helmet>
        <title> Login | Minimal UI </title>
        <style>{globalCss}</style>
      </Helmet>

      <StyledRoot>
        {mdUp && (
          <StyledSection>
            {/* Use the image URL directly */}
            <img
              src="https://img.freepik.com/free-vector/flat-world-architecture-day-illustration_23-2150731690.jpg?w=740&t=st=1694456960~exp=1694457560~hmac=def2e5acda73d4b6aed05a2da8dc4650c6257ef1c374035ee0a7b7e694101ce5"
              alt="login"
              style={{
                width: '100%', // Adjust the width as needed
                height: '100%', // Adjust the height as needed
              }}
            />
          </StyledSection>
        )}

        <Container maxWidth="sm">
          <StyledContent>
            <Logo
              sx={{
                marginBottom: '20px', // Adjust the spacing as needed
              }}
            />

            <Typography variant="h4" gutterBottom>
              Sign in
            </Typography>

            <Typography variant="body2" sx={{ mb: 5 }}>
              Don’t have an account?{' '}
              <Link component={RouterLink} to="/auth/signup" variant="subtitle2">
                Get started
              </Link>
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button onClick={() => handleGoogleSignIn()} fullWidth size="large" color="inherit" variant="outlined">
                <Iconify icon="eva:google-fill" color="#DF3E30" width={22} height={22} />
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                OR
              </Typography>
            </Divider>

            <LoginForm />
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
