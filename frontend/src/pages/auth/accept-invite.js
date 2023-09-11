import React, { useState } from 'react';
import {
  Button,
  Typography,
  Container,
  Box, // Import the Box component
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom'; 
import { useAuthContext } from '../../contexts/auth';
import { acceptMemberInvite } from '../../api/organizations';

export default function AcceptInvite() {
  const navigate = useNavigate(); 
  const { organizationId } = useParams();
  const { getIdToken } = useAuthContext();

  const [error, setError] = useState(null);

  const handleAccept = async () => {
    try {
      const token = await getIdToken();
      const resp = await acceptMemberInvite(organizationId, token);
      setError(null);
      // Navigate to dashboard or appropriate page after accepting the invite
      navigate('/');
    } catch (err) {
      setError('Error accepting the invitation. Please try again.');
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh', // Center vertically within the viewport
      }}
    >
      <Box textAlign="center"> {/* Use Box for centering */}
        <Typography variant="h4" style={{ marginBottom: '20px' }}>
          Accept Your Invitation
        </Typography>
        <Typography variant="body1" style={{ marginBottom: '40px' }}>
          You have been invited to join our platform by organization {organizationId}. Click the button below to accept your invitation and get started!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleAccept}
        >
          Accept Invitation
        </Button>
        {error && <Typography color="error" style={{ marginTop: '20px' }}>{error}</Typography>}
      </Box>
    </Container>
  );
}
