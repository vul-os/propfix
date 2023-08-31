import React, { useState } from 'react';
import { Container, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import ForgotPasswordForm from './forgot-password-form';

const StyledContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const ForgotPasswordPage = () => {
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetSuccess = () => {
    setResetSuccess(true);
  };

  return (
    <StyledContainer component="main" maxWidth="xs">
      <StyledPaper elevation={3}>
        <Typography variant="h5">Forgot Password</Typography>
        {resetSuccess ? (
          <Typography variant="body1">Check your email for reset instructions.</Typography>
        ) : (
          <ForgotPasswordForm onSuccess={handleResetSuccess} />
        )}
      </StyledPaper>
    </StyledContainer>
  );
};

export default ForgotPasswordPage;
