import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Avatar, Button, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from '../../contexts/auth';
import { getAllMembers, inviteMember } from '../../api/organizations';

export default function Organization() {
  const theme = useTheme();
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const { getIdToken, activeOrganization, organizations } = useAuthContext();
  const currentOrg = organizations.find(org => org.id === activeOrganization);

  const fetchMembers = async () => {
    try {
      const token = await getIdToken();
      const response = await getAllMembers(activeOrganization, token);
      setMembers(response?.members || []);
      setPendingMembers(response?.pending_members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  useEffect(() => {
    if (activeOrganization) {
      fetchMembers();
    }
  }, [activeOrganization]);

  const handleOpenDialog = () => {
    setOpenInviteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenInviteDialog(false);
    setInviteEmail('');
  };

  const handleInvite = async () => {
    try {
      const token = await getIdToken();
      await inviteMember(inviteEmail, activeOrganization, token);
      console.log(`Successfully invited member with email: ${inviteEmail}`);
    } catch (error) {
      console.error(`Error inviting member: ${error}`);
    }
    handleCloseDialog();
  };

  return (
    <>
      <Box mb={3}>
        <Typography variant="h6">{currentOrg?.name || 'N/A'}</Typography>
        <Typography variant="subtitle1">{activeOrganization || 'N/A'}</Typography>
      </Box>

      <Button variant="contained" sx={{marginBottom: "15px"}} color="primary" onClick={handleOpenDialog}>
        Invite Member
      </Button>

      {/* Invite Member Dialog */}
      <Dialog open={openInviteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Invite Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Member Email"
            type="email"
            fullWidth
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleInvite} color="primary">
            Invite
          </Button>
        </DialogActions>
      </Dialog>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Avatar</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <Avatar src={member.photoUrl} alt={member.displayName || member.email} />
              </TableCell>
              <TableCell>{member.displayName || 'N/A'}</TableCell>
              <TableCell>{member.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

     {/* Section for Pending Members */}
     <Box mt={5}>
        <Typography variant="h6">Pending Members</Typography>

        {pendingMembers.length ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingMembers.map((email, index) => (
                <TableRow key={index}>
                  <TableCell>{email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body1" color="textSecondary">No pending members.</Typography>
        )}
      </Box>
    </>
  );
}
