import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuthContext } from '../../contexts/auth';
import { getAllBuildings, deleteBuilding } from '../../api/buildings';

export default function Buildings() {
  const [buildings, setBuildings] = useState([]);
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

  // Function to handle building card click
  const handleBuildingClick = (building) => {
    // Handle building click here, e.g., navigate to a detailed view.
    console.log('Building clicked:', building);
  };

  // Function to handle editing a building
  const handleEditBuilding = (building) => {
    // Handle editing the building, e.g., navigate to an edit page.
    console.log('Edit building:', building);
    // You can navigate to the edit page and pass building data as props.
  };

  // Function to handle deleting a building
  const handleDeleteBuilding = async (building) => {
    // Handle deleting the building.
    try {
      const token = await getIdToken();
      await deleteBuilding(building.id, token);
      // Update the buildings list after successful deletion.
      fetchBuildings();
    } catch (error) {
      console.error('Error deleting building:', error);
    }
  };

  return (
    <div className="buildings-page">
      <Typography variant="h4">Buildings ({buildings.length})</Typography>
      <div className="building-cards" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {buildings.map((building) => (
          <div
            key={building.id}
            role="button"
            tabIndex={0}
            onClick={() => handleBuildingClick(building)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                handleBuildingClick(building);
              }
            }}
            style={{
              flex: '1 0 calc(33.33% - 20px)',
              cursor: 'pointer',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
              transition: 'box-shadow 0.3s ease-in-out',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '20px',
              minHeight: '250px',
              textDecoration: 'none',
              color: '#333',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                <AccountCircleIcon style={{ fontSize: '1.5rem', marginRight: '5px' }} />
                <Typography variant="h6" style={{ marginBottom: '0', flexGrow: 1 }}>{building.buildingName}</Typography>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Edit button */}
                <IconButton
                  aria-label="edit"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event propagation
                    handleEditBuilding(building);
                  }}
                >
                  <EditIcon />
                </IconButton>
                {/* Delete button */}
                <IconButton
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event propagation
                    handleDeleteBuilding(building);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '5px' }}>
              <LocationOnIcon style={{ fontSize: '2rem' }} />
              <Typography variant="body2" style={{ marginLeft: '5px' }}>{building.address}</Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
              <LocationOnIcon style={{ fontSize: '2rem' }} />
              <Typography variant="body2" style={{ marginLeft: '5px' }}>
                {building.latitude} / {building.longitude}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
