import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthContext } from '../../contexts/auth';
import { getAllMembers } from '../../api/organizations';
import { getAllRoles, removeMember, addMember } from '../../api/roles';
import { useBoardContext } from '../../contexts/board';
import AddMember from './add-member';

export default function Roles() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');

  const { board, setBoard, boardLoading, jobs, setJobs } = useBoardContext();
  const { getIdToken, activeOrganization, organizations } = useAuthContext();

  const fetchMembers = async () => {
    try {
      const token = await getIdToken();
      const response = await getAllMembers(activeOrganization, token);
      setMembers(response?.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = await getIdToken();
      const response = await getAllRoles(activeOrganization, token);
      setRoles(response?.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    if (activeOrganization) {
      fetchMembers();
      fetchRoles();
    }
  }, [activeOrganization]);

  const iconButtonStyle = { color: '#637381' };

  const handleDeleteMember = async () => {
    try {
      const token = await getIdToken();
      await removeMember(activeOrganization, memberToDelete.id, token);
      fetchMembers();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const [selectedRole, setSelectedRole] = useState(null);

  const handleAddMember = async () => {
    try {
    setOpenAddMemberDialog(false)
      const token = await getIdToken();
      if (selectedRole && newMemberId) {
        console.log('Adding member to role:', selectedRole.id);
        console.log('New member ID:', newMemberId);

        // Call your API function to add the member here
        const response = await addMember(activeOrganization, selectedRole.id, newMemberId, token);

        console.log('API Response:', response);

        if (response && response.success) {
          // Fetch roles again after adding the member
          fetchRoles();
        } else {
          console.error('Failed to add member:', response.error || 'Unknown error');
        }
      } else {
        console.error('Selected role or new member ID is missing.', newMemberId);

      }
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  return (
    <>
      {roles.map((role) => (
        <div key={role.id}>
          <Typography variant="h6">{role.name}</Typography>
          <Typography variant="body2">{role.description}</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {role.userIds.map((userId) => {
                const member = members.find((m) => m.id === userId);
                return (
                  <TableRow key={member?.id}>
                    <TableCell>
                      <Avatar src={member?.photoUrl} alt={member?.displayName || member?.email} />
                    </TableCell>
                    <TableCell>{member?.displayName || 'N/A'}</TableCell>
                    <TableCell>{member?.email}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="secondary"
                        onClick={() => {
                          setMemberToDelete(member);
                          setOpenDialog(true);
                        }}
                        style={iconButtonStyle}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setSelectedRole(role);
              setOpenAddMemberDialog(true);
            }}
          >
            Add Member
          </Button>
        </div>
      ))}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete {memberToDelete?.displayName || 'this member'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteMember} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <AddMember
        open={openAddMemberDialog}
        onClose={() => handleAddMember()}
        members={members}
        onAddMember={setNewMemberId}
        selectedRole={selectedRole}
      />
    </>
  );
}
