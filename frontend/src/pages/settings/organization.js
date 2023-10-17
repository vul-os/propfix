import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem, Select
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from '../../contexts/auth';
import {
  getAllMembers,
  inviteMember,
  removePendingMember,
  removeMember,
} from '../../api/organizations';
import { getAllRoles, removeMember as removeMemberOrg, addMember, changeRole } from '../../api/roles';

export default function Organization() {
  const theme = useTheme();
  const [pendingMembers, setPendingMembers] = useState([]);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteEmailError, setInviteEmailError] = useState(null); // State for invite email error
  const [pendingMemberToDelete, setPendingMemberToDelete] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [inviteRole, setInviteRole] = useState('');

  const [roleMenuAnchorEl, setRoleMenuAnchorEl] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const { getIdToken, activeOrganization, organizations, roles, setRoles, members, setMembers } = useAuthContext();
  const currentOrg = organizations.find((org) => org.id === activeOrganization);

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

  const fetchRoles = useCallback(async () => {
    try {
      const token = await getIdToken();
      const response = await getAllRoles(activeOrganization, token);
      setRoles(response?.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }, [activeOrganization, getIdToken]);

  useEffect(() => {
    if (activeOrganization) {
      fetchMembers();
      fetchRoles();
    }
  }, [activeOrganization]);

  const handleOpenDialog = () => {
    setOpenInviteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenInviteDialog(false);
    setInviteEmail('');
    setInviteEmailError(null); // Reset invite email error
  };

  const handleInvite = async () => {
    try {
        setInviteEmailError(null); // Reset invite email error

        // Validate email format for invite
        if (!isValidEmail(inviteEmail)) {
            setInviteEmailError('Invalid email address');
            return;
        }

        const token = await getIdToken();
        await inviteMember(inviteEmail, activeOrganization, inviteRole, token);
        console.log(`Successfully invited member with email: ${inviteEmail} and role: ${inviteRole}`);
        handleCloseDialog();
    } catch (error) {
        console.error(`Error inviting member: ${error}`);
    } 
  };


  const handleRoleChange = async (event, memberId) => {
    console.log(`Changing role of member ${memberId} to ${event.target.value}`);

    try {
        const token = await getIdToken();
        const response = await changeRole(event.target.value, memberId, activeOrganization, token);
        if (response) {
          fetchRoles()
          fetchMembers()
        }
      } catch (error) {
        console.error("Failed to change role:", error);
    }
  };




  const iconButtonStyle = { color: '#637381' };

  const handleRemovePendingMember = async () => {
    try {
      if (pendingMemberToDelete) {
        const token = await getIdToken();
        await removePendingMember(pendingMemberToDelete, activeOrganization, token);

        // Log the removed pending member
        console.log(`Removed pending member: ${pendingMemberToDelete}`);

        setPendingMembers((prevPendingMembers) =>
          prevPendingMembers.filter((email) => email !== pendingMemberToDelete)
        );
        setPendingMemberToDelete(null);
      }
    } catch (error) {
      console.error(`Error removing pending member: ${error}`);
    }
  };

  const handleRemoveMember = async () => {
    try {
      if (memberToDelete) {
        const token = await getIdToken();
        console.log("Removing member with ID:", memberToDelete); // Debugging log
        await removeMember(memberToDelete, activeOrganization, token);
        setMembers((prevMembers) =>
          prevMembers.filter((user) => user.Id !== memberToDelete)
        );
        setMemberToDelete(null);
      }
    } catch (error) {
      console.error(`Error removing member: ${error}`);
    }
  };

  // Function to check if the email is valid
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <>
      <Box mb={3}>
        <Typography variant="h6">{currentOrg?.name || 'N/A'}</Typography>
        <Typography variant="subtitle1" style={{ fontSize: '14px', color: 'grey' }}>{activeOrganization || 'N/A'}</Typography>
      </Box>

      <Button
        variant="contained"
        sx={{ marginBottom: '15px' }}
        color="primary"
        onClick={handleOpenDialog}
      >
        Invite Member
      </Button>

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
                  error={!!inviteEmailError} 
                  helperText={inviteEmailError}
              />
              <Select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  fullWidth
                  style={{ marginTop: '16px' }}
              >
                  {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                  ))}
              </Select>
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

      
      <div style={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Avatar</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Name</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Email</TableCell>
            <TableCell style={{ whiteSpace: 'nowrap' }}>Role</TableCell> 
            <TableCell style={{ whiteSpace: 'nowrap' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member?.id}>
              <TableCell>
                <Avatar src={member?.photoUrl} alt={member?.displayName || member?.email} />
              </TableCell>
              <TableCell>{member?.displayName || 'N/A'}</TableCell>
              <TableCell>{member?.email}</TableCell>
              <TableCell>
                  <Select
                    value={member?.roleId || ''}
                    onChange={(e) => handleRoleChange(e, member.id)}
                    displayEmpty
                  >
                    {roles?.map((role) => (
                      <MenuItem key={role?.id} value={role?.id}>{role?.name}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
              <TableCell>
                <IconButton
                  color="secondary"
                  onClick={() => setMemberToDelete(member?.id)}
                  style={iconButtonStyle}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

      <Box mt={5}>
        <Typography variant="h6">Pending Members</Typography>

        {pendingMembers.length ? (
          <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ whiteSpace: 'nowrap' }}>Email</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingMembers.map((pm, index) => (
                <TableRow key={index}>
                  <TableCell>{pm.email}</TableCell>
                  <TableCell>
                    <IconButton
                      color="secondary"
                      onClick={() => setPendingMemberToDelete(pm.email)}
                      style={iconButtonStyle}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
         </div>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No pending members.
          </Typography>
        )}
      </Box>

      <Dialog
        open={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to delete the selected member?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberToDelete(null)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemoveMember} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!pendingMemberToDelete}
        onClose={() => setPendingMemberToDelete(null)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to delete the selected pending member?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingMemberToDelete(null)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemovePendingMember} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
