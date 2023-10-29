import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
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
  const [isEditing, setIsEditing] = useState(false); // Separate state for editing
  const { activeOrganization } = useAuthContext();

  useEffect(() => {
    if (activeOrganization) {
      fetchLabels();
    }
  }, [activeOrganization]);

  const fetchLabels = async () => {
    try {
      const response = await getAllLabels(activeOrganization);
      setLabels(response || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  const startEditing = (label) => {
    setEditedLabel({ organization_id: activeOrganization, ...label });
    setIsEditing(true); // Set the editing state
    setEditing(label.id);
  };

  const updateLabelInState = (updatedLabel) => {
    setLabels((prevLabels) =>
      prevLabels.map((label) =>
        label.id === updatedLabel.id ? { ...label, ...updatedLabel } : label
      )
    );
  };

  const saveEditing = async () => {
    console.log('Save changes for label:', editedLabel);
    try {
      if (isEditing) {
        await updateLabel(editedLabel);
        updateLabelInState(editedLabel);
      } else {
        await createNewLabel(editedLabel);
      }
      setIsEditing(false); // Reset the editing state
      setEditing(null);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving label:', error);
    }
  };

  const closeEditing = () => {
    setIsEditing(false); // Reset the editing state
    setEditing(null);
    setOpenDialog(false);
  };

  const handleDeleteLabel = async (label) => {
    try {
      await deleteLabel(label.id);
      setLabels((prevLabels) => prevLabels.filter((l) => l.id !== label.id));
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  };
  

  const createNewLabel = async (newLabel) => {
    try {
      const createdLabel = await createLabel(newLabel);
      if (createdLabel.id) {
        setLabels((prevLabels) => [...prevLabels, createdLabel]);
      }
    } catch (error) {
      console.error('Error creating label:', error);
    }
  };

  return (
    <div className="labels-page">
      <Typography variant="h4">
        Labels ({labels.length})
        <IconButton onClick={fetchLabels} aria-label="Refresh">
          <RefreshIcon />
        </IconButton>
      </Typography>

      <TableContainer sx={{ marginTop: theme.spacing(2) }} component={Paper}>
        <Table aria-label="labels table">
          <TableHead>
            <TableRow>
              <TableCell>
                Label Name
              </TableCell>
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
                      <IconButton onClick={saveEditing} aria-label="Save">
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
        onClick={() => {
          setEditedLabel({ organization_id: activeOrganization, name: '', color: '#000000' });
          setIsEditing(false); // Reset the editing state
          setOpenDialog(true);
        }}
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

      <Dialog open={openDialog} onClose={closeEditing}>
        <DialogTitle>{isEditing ? 'Edit Label' : 'Add New Label'}</DialogTitle>
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
