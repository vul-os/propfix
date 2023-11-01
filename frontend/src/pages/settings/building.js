import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
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
import { getAllBuildings, deleteBuilding, updateBuilding, createBuilding } from '../../api/buildings';

export default function Buildings() {
  const theme = useTheme();
  const [buildings, setBuildings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedBuilding, setEditedBuilding] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { activeOrganization } = useAuthContext();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetchBuildings()
    } catch (error) {
      console.error('Error fetching buildings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeOrganization) {
      fetchBuildings();
    }
  }, [activeOrganization]);

  const fetchBuildings = async () => {
    try {
      const response = await getAllBuildings(0, 0, '', activeOrganization);
      setBuildings(response || []);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const startEditing = (building) => {
    setEditedBuilding({
      organization_id: activeOrganization,
      ...building,
      latitude: parseFloat(building.latitude),
      longitude: parseFloat(building.longitude),
    });
    setIsEditing(true);
    setEditing(building.id);
  };

  const updateBuildingInState = (updatedBuilding) => {
    setBuildings((prevBuildings) =>
      prevBuildings.map((building) =>
        building.id === updatedBuilding.id ? { ...building, ...updatedBuilding } : building
      )
    );
  };

  const saveEditing = async () => {
    console.log('Save changes for building:', editedBuilding);
    try {
      if (isEditing) {
        await updateBuilding(editedBuilding);
        updateBuildingInState(editedBuilding);
      } else {
        await createNewBuilding(editedBuilding);
      }
      setIsEditing(false);
      setEditing(null);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving building:', error);
    }
  };

  const closeEditing = () => {
    setIsEditing(false);
    setEditing(null);
    setOpenDialog(false);
  };

  const handleDeleteBuilding = async (building) => {
    try {
      await deleteBuilding(building.id);
      setBuildings((prevBuildings) => prevBuildings.filter((b) => b.id !== building.id));
    } catch (error) {
      console.error('Error deleting building:', error);
    }
  };

  const createNewBuilding = async (newBuilding) => {
    try {
      const createdBuilding = await createBuilding(newBuilding);
      console.log(createdBuilding)
      if (createdBuilding.id) {
        setBuildings((prevBuildings) => [...prevBuildings, createdBuilding]);
      }
    } catch (error) {
      console.error('Error creating building:', error);
    }
  };

  return (
    <div className="buildings-page">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" style={{ marginRight: '0px' }}>
          Buildings ({buildings.length})
        </Typography>
        <IconButton
          color=""
          aria-label="Refresh Buildings"
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            backgroundColor: '',
            border: 'none',
            boxShadow: 'none',
          }}
        >
          <RefreshIcon />
        </IconButton>
      </div>
      
      <TableContainer sx={{ marginTop: theme.spacing(2) }} component={Paper}>
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
                      label="Building Name"
                      value={editedBuilding.name || ''}
                      onChange={(e) =>
                        setEditedBuilding({ ...editedBuilding, name: e.target.value })
                      }
                      fullWidth
                      margin="dense"
                    />
                  ) : (
                    building.name
                  )}
                </TableCell>
                <TableCell>
                  {editing === building.id ? (
                    <TextField
                      label="Address"
                      value={editedBuilding.address || ''}
                      onChange={(e) =>
                        setEditedBuilding({ ...editedBuilding, address: e.target.value })
                      }
                      fullWidth
                      margin="dense"
                    />
                  ) : (
                    building.address
                  )}
                </TableCell>
                <TableCell>
                  {editing === building.id ? (
                    <TextField
                      label="Latitude"
                      type="number"
                      value={editedBuilding.latitude || ''}
                      onChange={(e) =>
                        setEditedBuilding({ ...editedBuilding, latitude: parseFloat(e.target.value) || 0 })
                      }
                      fullWidth
                      margin="dense"
                    />
                  ) : (
                    building.latitude
                  )}
                </TableCell>
                <TableCell>
                  {editing === building.id ? (
                    <TextField
                      label="Longitude"
                      type="number"
                      value={editedBuilding.longitude || ''}
                      onChange={(e) =>
                        setEditedBuilding({ ...editedBuilding, longitude: parseFloat(e.target.value) || 0 })
                      }
                      fullWidth
                      margin="dense"
                    />
                  ) : (
                    building.longitude
                  )}
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
                      <IconButton
                        onClick={() => handleDeleteBuilding(building)}
                        aria-label="Delete"
                      >
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
        aria-label="Add Building"
        onClick={() => {
          setEditedBuilding({
            organization_id: activeOrganization,
            name: '',
            address: '',
            latitude: 0,
            longitude: 0,
          });
          setIsEditing(false);
          setOpenDialog(true);
        }}
        style={{
          position: 'fixed',
          bottom: '75px',
          right: '16px',
          backgroundColor: '#fff',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
        }}
      >
        <AddIcon />
      </IconButton>

      <Dialog open={openDialog} onClose={closeEditing}>
        <DialogTitle>{isEditing ? 'Edit Building' : 'Add Building'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Building Name"
            value={editedBuilding.name || ''}
            onChange={(e) =>
              setEditedBuilding({ ...editedBuilding, name: e.target.value })
            }
            fullWidth
            margin="dense"
          />
          <TextField
            label="Address"
            value={editedBuilding.address || ''}
            onChange={(e) => setEditedBuilding({ ...editedBuilding, address: e.target.value })}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Latitude"
            type="number"
            value={editedBuilding.latitude || 0}
            onChange={(e) =>
              setEditedBuilding({ ...editedBuilding, latitude: parseFloat(e.target.value) || 0 })
            }
            fullWidth
            margin="dense"
          />
          <TextField
            label="Longitude"
            type="number"
            value={editedBuilding.longitude || 0}
            onChange={(e) =>
              setEditedBuilding({ ...editedBuilding, longitude: parseFloat(e.target.value) || 0 })
            }
            fullWidth
            margin="dense"
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
