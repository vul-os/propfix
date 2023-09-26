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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh'; 
import { useAuthContext } from '../../contexts/auth';
import { getAllMembers } from '../../api/organizations';
import { getAllRoles, removeMember, addMember } from '../../api/roles';
import { useBoardContext } from '../../contexts/board';
import AddMember from './add-member';

export default function Roles() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const { board, setBoard, boardLoading, jobs, setJobs } = useBoardContext();
  const { getIdToken, activeOrganization, organizations } = useAuthContext();
  const iconButtonStyle = { color: '#637381' };

  const fetchMembers = useCallback(async () => {
    try {
      const token = await getIdToken();
      const response = await getAllMembers(activeOrganization, token);
      setMembers(response?.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, [activeOrganization, getIdToken]);

  const fetchRoles = useCallback(async () => {
    try {
      const token = await getIdToken();
      const response = await getAllRoles(activeOrganization, token);
      setRoles(response?.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }, [activeOrganization, getIdToken]);

  // ... useEffect

  const handleDeleteMember = useCallback(async () => {
    try {
      setOpenDialog(false);
      if (selectedRole && selectedMember?.id) {
        const token = await getIdToken();
        await removeMember(selectedRole.id, selectedMember.id, token);
        fetchRoles();
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  }, [selectedMember, selectedRole, getIdToken, fetchMembers]);

  const handleAddMember = useCallback(async (selectedMember) => {
    try {
      setOpenAddMemberDialog(false)
      const token = await getIdToken();
      console.log(selectedRole && selectedMember?.id) 
      if (selectedRole && selectedMember?.id) {
        const response = await addMember(selectedRole.id, selectedMember?.id, token);

        if (response && response.message) {
          fetchRoles();
        } else {
          console.error('Failed to add member:', response.error || 'Unknown error');
        }
      } else {
        console.error('Selected role or new member ID is missing.', selectedMember);
      }
    } catch (error) {
      console.error('Error adding member:', error);
    }
  }, [selectedRole, getIdToken, fetchRoles]);


  useEffect(() => {
    if (activeOrganization) {
      fetchMembers();
      fetchRoles();
    }
  }, [activeOrganization]);

  const handleRefreshRoles = async () => {
    // Call the fetchRoles function to refresh roles
    await fetchRoles();
  };



  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4">Roles ({roles.length})</Typography>
        <IconButton
          onClick={handleRefreshRoles} // Call the handleRefreshRoles function
          aria-label="Refresh"
        >
          <RefreshIcon />
        </IconButton>
      </div>

      {roles.map((role, index) => ( 
        <div key={role.id}>
          <Typography variant="h6">{role.name} ({role.userIds.length}) </Typography>
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
              {role.userIds.map((userId, idx) => {
                const member = members.find((m) => m.id === userId);
                return (
                  <TableRow key={`${member?.id}-${idx}`}>
                    <TableCell>
                      <Avatar src={member?.photoUrl} alt={member?.displayName || member?.email} />
                    </TableCell>
                    <TableCell>{member?.displayName || 'N/A'}</TableCell>
                    <TableCell>{member?.email}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="secondary"
                        onClick={() => {
                          setSelectedRole(role);
                          setSelectedMember(member);
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
            Are you sure you want to delete {selectedMember?.displayName || 'this member'}?
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
        onClose={handleAddMember}
        members={members}
      />
    </>
  );
}
