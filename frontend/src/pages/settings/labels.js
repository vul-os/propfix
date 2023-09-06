import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { getAllLabels } from '../../api/labels'; // Import your JSON-RPC function here
import { useAuthContext } from '../../contexts/auth'; // Make sure to update this path

export default function Labels() {
  const [labels, setLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(null);
  const [newLabel, setNewLabel] = useState('');
  const { getIdToken, activeOrganization } = useAuthContext();

  const fetchLabels = async () => {
    try {
      const token = await getIdToken();
      const response = await getAllLabels(activeOrganization, token);
      setLabels(response?.labels || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  useEffect(() => {
    if (activeOrganization) {
      fetchLabels();
    }
  }, [activeOrganization]);

  const handleEditClick = (label) => {
    setIsEditing(true);
    setEditLabel(label);
    setNewLabel(label.name);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditLabel(null);
    setNewLabel('');
  };

  const handleSaveChanges = () => {
    // Send a PUT request to update the label on the server
    // ...

    setIsEditing(false);
    setEditLabel(null);
    setNewLabel('');
  };

  return (
    <div className="labels-page">
      <Typography variant="h4">
        Labels ({labels.length})
      </Typography>

      <TableContainer sx={{ marginTop: '10px' }} component={Paper}>
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
                  {isEditing && editLabel === label ? (
                    <TextField
                      label="Label Name"
                      variant="outlined"
                      fullWidth
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                    />
                  ) : (
                    <Chip
                      id={label.id}
                      label={label.name}
                      className="github-chip"
                      style={{ backgroundColor: label.color }}
                    />
                  )}
                </TableCell>
                <TableCell>{label.color}</TableCell>
                <TableCell>
                  {isEditing && editLabel === label ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </Button>
                  ) : (
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(label)}
                      aria-label="Edit"
                    >
                      <EditIcon />
                      <Typography
                        variant="body2"
                        style={{ marginLeft: '4px' }}
                      >
                        Edit
                      </Typography>
                    </IconButton>
                  )}
                  {isEditing && editLabel === label && (
                    <Button
                      variant="outlined"
                      color="default"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
