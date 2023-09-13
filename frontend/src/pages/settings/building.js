import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add'; // Updated the FAB icon
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
import { useAuthContext } from '../../contexts/auth';
import { getAllBuildings, deleteBuilding, updateBuilding, createBuilding } from '../../api/buildings';

export default function Buildings() {
  const [buildings, setBuildings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedBuilding, setEditedBuilding] = useState({});
  const [openDialog, setOpenDialog] = useState(false); // State for the dialog
  const { getIdToken, activeOrganization } = useAuthContext();

  useEffect(() => {
    if (activeOrganization) {
      fetchBuildings();
    }
  }, [activeOrganization]);

  const fetchBuildings = async () => {
    try {
      const token = await getIdToken();
      const response = await getAllBuildings(0, 0, '', token);
      setBuildings(response.buildings || []);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const startEditing = (building) => {
    setEditedBuilding(building);
    setEditing(building.id);
  };

  const saveEditing = async () => {
    console.log('Save changes for building:', editedBuilding);
    try {
      const token = await getIdToken();
      if (editing) {
        await updateBuilding(editedBuilding, token);
      } else {
        const createdBuilding = await createBuilding(editedBuilding, token); // Create a new building
        if (createdBuilding) {
          // Add the newly created building to the list
          setBuildings((prevBuildings) => [...prevBuildings, createdBuilding]);
        }
      }
      setEditing(null);
      setOpenDialog(false); // Close the dialog
    } catch (error) {
      console.error('Error saving building:', error);
    }
  };
  
  const closeEditing = () => {
    setEditing(null);
    setOpenDialog(false); // Close the dialog
  };
  
  const handleDeleteBuilding = async (building) => {
    try {
      const token = await getIdToken();
      await deleteBuilding(building.id, token);
      // Remove the deleted building from the list
      setBuildings((prevBuildings) => prevBuildings.filter((b) => b.id !== building.id));
    } catch (error) {
      console.error('Error deleting building:', error);
    }
  };

  return (
    <div className="buildings-page">
      <Typography variant="h4">Buildings ({buildings.length})</Typography>

      <TableContainer component={Paper}>
        <Table aria-label="buildings table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {buildings.map((building) => (
              <TableRow key={building.id}>
                <TableCell>
                  {editing === building.id ? (
                    <TextField
                      label="Name"
                      value={editedBuilding.buildingName}
                      onChange={(e) => setEditedBuilding({ ...editedBuilding, buildingName: e.target.value })}
                      fullWidth
                      margin="dense"
                    />
                  ) : building.buildingName}
                </TableCell>
                <TableCell>
                  {editing === building.id ? (
                    <TextField
                      label="Address"
                      value={editedBuilding.address}
                      onChange={(e) => setEditedBuilding({ ...editedBuilding, address: e.target.value })}
                      fullWidth
                      margin="dense"
                    />
                  ) : building.address}
                </TableCell>
                <TableCell>
                  {editing === building.id ? (
                    <TextField
                      label="Latitude"
                      value={editedBuilding.latitude}
                      onChange={(e) => setEditedBuilding({ ...editedBuilding, latitude: e.target.value })}
                      fullWidth
                      margin="dense"
                    />
                  ) : building.latitude}
                </TableCell>
                <TableCell>
                  {editing === building.id ? (
                    <TextField
                      label="Longitude"
                      value={editedBuilding.longitude}
                      onChange={(e) => setEditedBuilding({ ...editedBuilding, longitude: e.target.value })}
                      fullWidth
                      margin="dense"
                    />
                  ) : building.longitude}
                </TableCell>
                <TableCell>
                  {editing === building.id ? (
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
                      <IconButton onClick={() => startEditing(building)} aria-label="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteBuilding(building)} aria-label="Delete">
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

      {/* Add the FAB here */}
      <IconButton
        color="primary"
        aria-label="Add Building"
        onClick={() => setOpenDialog(true)} // Open the dialog on click
        style={{
          position: 'fixed',
          bottom: '75px', // Adjusted position
          right: '16px', // Adjusted position
          backgroundColor: '#fff', // Added background color
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)', // Added box shadow
        }}
      >
        <AddIcon />
      </IconButton>

      {/* Add the dialog component here */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editing ? 'Edit Building' : 'Add Building'}</DialogTitle>
        <DialogContent>
          {/* Use the existing table cells as text fields for entering building details */}
          <TextField
            label="Name"
            value={editedBuilding.buildingName}
            onChange={(e) => setEditedBuilding({ ...editedBuilding, buildingName: e.target.value })}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Address"
            value={editedBuilding.address}
            onChange={(e) => setEditedBuilding({ ...editedBuilding, address: e.target.value })}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Latitude"
            value={editedBuilding.latitude}
            onChange={(e) => setEditedBuilding({ ...editedBuilding, latitude: e.target.value })}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Longitude"
            value={editedBuilding.longitude}
            onChange={(e) => setEditedBuilding({ ...editedBuilding, longitude: e.target.value })}
            fullWidth
            margin="dense"
          />
          {/* Add more fields as needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditing}>Cancel</Button>
          <Button onClick={saveEditing}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
