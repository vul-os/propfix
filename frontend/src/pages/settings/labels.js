import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon

import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import { getAllLabels, updateLabel, deleteLabel } from '../../api/labels';
import { useAuthContext,  } from '../../contexts/auth';

export default function Labels() {
  const theme = useTheme();
  const [labels, setLabels] = useState([]);
  const [editLabel, setEditLabel] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

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

  const handleLabelUpdate = async () => {
    try {
      const token = await getIdToken();
      const resp = await updateLabel(editLabel, token);
      fetchLabels(); // Refresh the labels after updating
    } catch (error) {
      console.error('Error updating label:', error);
    }
  };

  const handleDeleteLabel = async (labelId) => {
    try {
      const token = await getIdToken();
      await deleteLabel(labelId, token);
      fetchLabels(); // Refresh the labels after deleting
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  };

  useEffect(() => {
    if (activeOrganization) {
      fetchLabels();
    }
  }, [activeOrganization]);

  const handleEditClick = (label) => {
    setEditLabel({...label});
    setExpandedRow(label);
  };

  const handleCancel = () => {
    setEditLabel(null);
    setExpandedRow(null);
  };

  const handleSaveChanges = (label) => {
    handleLabelUpdate(label);
    setEditLabel(null);
    setExpandedRow(null);
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
              <React.Fragment key={label.id}>
                <TableRow>
                  <TableCell>
                    {expandedRow === label ? (
                      <TextField
                        label="New Name"
                        variant="outlined"
                        fullWidth
                        value={editLabel ? editLabel.name : ''}
                        onChange={(e) => {
                          setEditLabel({
                            ...editLabel,
                            name: e.target.value,
                          });
                        }}
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
                  <TableCell>
                    {expandedRow === label ? (
                      <input
                        type="color"
                        value={editLabel ? editLabel.color : ''}
                        onChange={(e) => {
                          setEditLabel({
                            ...editLabel,
                            color: e.target.value,
                          });
                        }}
                      />
                    ) : (
                      label.color
                    )}
                  </TableCell>
                  <TableCell>
                    {expandedRow === label ? (
                      <div>
                        <IconButton
                          color="secondary"
                          aria-label="Save"
                          onClick={() => handleSaveChanges(label)}
                        >
                          <SaveIcon /> {/* Save icon */}
                        </IconButton>
                        <IconButton
                          color="secondary"
                          aria-label="Close"
                          onClick={handleCancel}
                        >
                          <CancelIcon /> {/* Close icon */}
                        </IconButton>
                      </div>
                    ) : (
                      <div>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(label)}
                          aria-label="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          aria-label="Delete"
                          onClick={() => handleDeleteLabel(label.id)}
                        >
                          <DeleteIcon /> {/* Delete icon */}
                        </IconButton>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
