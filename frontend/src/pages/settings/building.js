import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
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
      <div className="building-cards" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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
              width: 'calc(33.33% - 10px)', // Three cards per row with 10px gap
              cursor: 'pointer',
              boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              padding: '10px',
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" style={{ flexGrow: 1 }}>{building.buildingName}</Typography>
              <div style={{ display: 'flex', gap: '8px' }}>
                <IconButton aria-label="edit">
                  <EditIcon />
                </IconButton>
                <IconButton aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <LocationOnIcon style={{ fontSize: '2rem', marginRight: '5px' }} />
              <Typography variant="body2">{building.address}</Typography>
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
