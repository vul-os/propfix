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

export default function AddMember({ open, onClose, members, selectedMember, setSelectedMember }) {

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="add-member-dialog-title">
      <DialogTitle id="add-member-dialog-title">Add Member</DialogTitle>
      <DialogContent>
        <List>
          {members.map((member) => (
            <ListItem
              key={member.id}
              onClick={() => {
                onClose(member)
              }}
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
    </Dialog>
  );
}
