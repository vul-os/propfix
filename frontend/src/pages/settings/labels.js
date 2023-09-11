import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import { getAllLabels } from '../../api/labels';
import { useAuthContext } from '../../contexts/auth';

export default function Labels() {
  const theme = useTheme();
  const [labels, setLabels] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(null);
  const [newLabel, setNewLabel] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');
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
    setName(label.name); // Set label name
    setColor(label.color); // Set label color
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditLabel(null);
    setNewLabel('');
    setName(''); // Clear label name
    setColor('#000000'); // Reset label color to default
  };

  const handleSaveChanges = (label) => {
    // Send a PUT request to update the label on the server
    // ...

    setIsEditing(false);
    setEditLabel(null);
    setNewLabel('');
    setName(''); // Clear label name
    setColor('#000000'); // Reset label color to default
  };

  const handleExpandRow = (label) => {
    setExpandedRow(expandedRow === label ? null : label);
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
                    {isEditing && editLabel === label ? (
                      // Use Autocomplete for label name editing
                      <Autocomplete
                        options={labels}
                        getOptionLabel={(option) => option.name}
                        value={name}
                        onChange={(_, newValue) => {
                          setName(newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Label Name"
                            variant="outlined"
                            fullWidth
                          />
                        )}
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
                    {isEditing && editLabel === label ? (
                      // Use native color input for label color editing
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                          setColor(e.target.value);
                        }}
                      />
                    ) : (
                      label.color
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing && editLabel === label ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(2) }}>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={() => handleSaveChanges(label)}

                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            color="default"
                            startIcon={<CancelIcon />}
                            onClick={handleCancel}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => handleExpandRow(label)}
                          aria-label="Edit"
                        >
                          <EditIcon />
                          <Typography
                            variant="body2"
                            style={{ marginLeft: theme.spacing(1) }}
                          >
                            Edit
                          </Typography>
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
                {/* Expandable row with text fields */}
                {expandedRow === label && (
                  <TableRow>
                    <TableCell colSpan={3} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(2) }}>
                        <TextField
                          label="Name"
                          variant="outlined"
                          fullWidth
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(2) }}>
                        <input
                          type="color"
                          id="color-picker"
                          value={color}
                          onChange={(e) => {
                            setColor(e.target.value);
                          }}
                        />
                        <Typography variant="body2" style={{ marginLeft: theme.spacing(1) }}>
                          {color}
                        </Typography>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
