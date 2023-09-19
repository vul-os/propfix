// components/AddMember.js

import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from '@mui/material';

export default function AddMember({ open, onClose, members, onAddMember }) {
  const [selectedMember, setSelectedMember] = useState(null);

  const handleAddMember = () => {
    if (selectedMember) {
      onAddMember(selectedMember.id);
      // setSelectedMember(null);
      onClose();
    }
  };

  useEffect(() => {
    if (open) {
      // setSelectedMember(null); // Reset selected member when the dialog opens
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="add-member-dialog-title">
      <DialogTitle id="add-member-dialog-title">Add Member</DialogTitle>
      <DialogContent>
        <List>
          {members.map((member) => (
            <ListItem
              key={member.id}
              button
              onClick={() => setSelectedMember(member)}
              selected={selectedMember?.id === member.id}
            >
              <ListItemAvatar>
                <Avatar src={member.photoUrl} alt={member.displayName} />
              </ListItemAvatar>
              <ListItemText
                primary={member.displayName}
                secondary={member.email}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAddMember} color="primary" disabled={!selectedMember}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
