import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import ExoStepper from './stepper'

function CreateJobDialog({open, onClose}) {
  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="create-job-dialog-title"
        aria-describedby="create-job-dialog-description"
      >
        <DialogTitle id="create-job-dialog-title" disableTypography>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="h6">Create a New Job</Typography>
            <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
            </IconButton>
        </div>
        </DialogTitle>
        <DialogContent>
          <ExoStepper handleClose={onClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateJobDialog;
