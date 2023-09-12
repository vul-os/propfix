import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuthContext } from '../../contexts/auth';
import { getAllBuildings } from '../../api/buildings';

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
              flex: '1 0 calc(33.33% - 20px)', // Three cards per row with 20px gap
              cursor: 'pointer',
              boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)', // Added a subtle shadow
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0', // Lighter border color
              overflow: 'hidden', // Prevent content from overflowing
              transition: 'box-shadow 0.3s ease-in-out', // Smooth hover effect
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between', // Space between title and actions
              padding: '20px',
              minHeight: '250px', // Set a minimum height for consistent card size
              textDecoration: 'none', // Remove underline from links
              color: '#333', // Text color
            
              // Add a hover effect
              ':hover': {
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Slightly raised shadow on hover
                transform: 'translateY(-4px)', // Lift the card on hover
              },
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                <AccountCircleIcon style={{ fontSize: '1.5rem', marginRight: '5px' }} /> {/* Profile icon */}
                <Typography variant="h6" style={{ marginBottom: '0', flexGrow: 1 }}>{building.buildingName}</Typography>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <IconButton aria-label="edit">
                  <EditIcon />
                </IconButton>
                <IconButton aria-label="delete">
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

  function handleBuildingClick(building) {
    // Handle building click here, e.g., navigate to a detailed view.
    console.log('Building clicked:', building);
  }
}
