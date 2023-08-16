import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Card, CardContent } from '@mui/material';
import SignUpForm from './SignUpForm';
import GoogleLoginButton from './GoogleLoginButton';

export default function SignUpPage() {
  return (
    <Container maxWidth="xs">
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Sign Up
          </Typography>
          <SignUpForm />
          <GoogleLoginButton />
          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <RouterLink to="/login">Login</RouterLink>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
