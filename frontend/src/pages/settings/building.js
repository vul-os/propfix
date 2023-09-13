import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
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
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles'; // Import the theme
import { useAuthContext } from '../../contexts/auth';
import { getAllBuildings, deleteBuilding, updateBuilding } from '../../api/buildings';

export default function Buildings() {
  const theme = useTheme(); // Use the theme
  const [buildings, setBuildings] = useState([]);
  const [editing, setEditing] = useState(null); // ID of building currently being edited
  const [editedBuilding, setEditedBuilding] = useState({}); // Temporary state for the edited building
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
      const response = await updateBuilding(editedBuilding, token);
      setEditing(null);
      fetchBuildings()
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }    
  };
  
  const closeEditing = () => {
    setEditing(null);
  };
  
  const handleDeleteBuilding = async (building) => {
    try {
      const token = await getIdToken();
      await deleteBuilding(building.id, token);
      fetchBuildings();
    } catch (error) {
      console.error('Error deleting building:', error);
    }
  };

  return (
    <div className="buildings-page">
      <Typography variant="h4">Buildings ({buildings.length})</Typography>
      
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
                      value={editedBuilding.buildingName} 
                      onChange={(e) => setEditedBuilding(prev => ({...prev, buildingName: e.target.value}))}
                    />
                  ) : building.buildingName}
                </TableCell>
                <TableCell>
                  {editing === building.id ? (
                    <TextField 
                      value={editedBuilding.address} 
                      onChange={(e) => setEditedBuilding(prev => ({...prev, address: e.target.value}))}
                    />
                  ) : building.address}
                </TableCell>
                <TableCell>
                  {editing === building.id ? (
                    <TextField 
                      value={editedBuilding.latitude} 
                      onChange={(e) => setEditedBuilding(prev => ({...prev, latitude: e.target.value}))}
                    />
                  ) : building.latitude}
                </TableCell>
                <TableCell>
                  {editing === building.id ? (
                    <TextField 
                      value={editedBuilding.longitude} 
                      onChange={(e) => setEditedBuilding(prev => ({...prev, longitude: e.target.value}))}
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
    </div>
  );
}
