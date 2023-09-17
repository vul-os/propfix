import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from '../../contexts/auth';
import { getAllLabels, deleteLabel, updateLabel, createLabel } from '../../api/labels';

export default function Labels() {
  const theme = useTheme();
  const [labels, setLabels] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedLabel, setEditedLabel] = useState({});
  const [openDialog, setOpenDialog] = useState(false); // State for the dialog
  const { getIdToken, activeOrganization } = useAuthContext();

  useEffect(() => {
    if (activeOrganization) {
      fetchLabels();
    }
  }, [activeOrganization]);

  const fetchLabels = async () => {
    try {
      const token = await getIdToken();
      const response = await getAllLabels(activeOrganization, token);
      setLabels(response?.labels || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  const startEditing = (label) => {
    setEditedLabel({ organizationId: activeOrganization, ...label });
    setEditing(label.id);
  };

  const saveEditing = async () => {
    console.log('Save changes for label:', editedLabel);
    try {
      const token = await getIdToken();
      if (editing) {
        await updateLabel(editedLabel, token);
        // Update the label in the labels state
        setLabels((prevLabels) =>
          prevLabels.map((label) =>
            label.id === editedLabel.id ? { ...label, ...editedLabel } : label
          )
        );
      } else {
        const createdLabel = await createLabel(editedLabel, token);
        if (createdLabel) {
          setLabels((prevLabels) => [...prevLabels, createdLabel]);
        }
      }
      setEditing(null);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving label:', error);
    }
  };

  const closeEditing = () => {
    setEditing(null);
    setOpenDialog(false);
  };

  const handleDeleteLabel = async (label) => {
    try {
      const token = await getIdToken();
      await deleteLabel(label.id, token);
      setLabels((prevLabels) => prevLabels.filter((l) => l.id !== label.id));
      fetchLabels();
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  };

  return (
    <div className="labels-page">
      <Typography variant="h4">Labels ({labels.length})</Typography>

      <TableContainer sx={{ marginTop: theme.spacing(2) }} component={Paper}>
        <Table aria-label="labels table">
          <TableHead>
            <TableRow>
              <TableCell>Label Name</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {labels.map((label) => (
              <TableRow key={label.id}>
                <TableCell>
                  {editing === label.id ? (
                    <TextField
                      label="Label Name"
                      value={editedLabel.name}
                      onChange={(e) => setEditedLabel({ ...editedLabel, name: e.target.value })}
                      fullWidth
                      margin="dense"
                    />
                  ) : (
                    label.name
                  )}
                </TableCell>
                <TableCell>
                  {editing === label.id ? (
                    <input
                      type="color"
                      value={editedLabel.color}
                      onChange={(e) => setEditedLabel({ ...editedLabel, color: e.target.value })}
                    />
                  ) : (
                    <div
                      style={{
                        backgroundColor: label.color,
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {editing === label.id ? (
                    <>
                      <IconButton onClick={() => saveEditing(label)} aria-label="Save">
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={closeEditing} aria-label="Close">
                        <CloseIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton onClick={() => startEditing(label)} aria-label="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteLabel(label)} aria-label="Delete">
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <IconButton
        color="primary"
        aria-label="Add Label"
        onClick={() => setOpenDialog(true)}
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          backgroundColor: '#fff',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
        }}
      >
        <AddIcon />
      </IconButton>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editing ? 'Edit Label' : 'Add NewLabel'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Label Name"
            value={editedLabel.name}
            onChange={(e) => setEditedLabel({ ...editedLabel, name: e.target.value })}
            fullWidth
            margin="dense"
          />
          <input
            type="color"
            value={editedLabel.color}
            onChange={(e) => setEditedLabel({ ...editedLabel, color: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditing}>Cancel</Button>
          <Button onClick={saveEditing}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
