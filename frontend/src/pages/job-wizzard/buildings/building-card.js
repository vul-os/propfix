import React from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function BuildingCard({ building, onSelectBuilding }) {
  const handleClick = () => {
    onSelectBuilding(building);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onSelectBuilding(building);
        }
      }}
      style={{
        width: '300px', // Set a fixed width for the cards
        margin: '10px',
        cursor: 'pointer',
        boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
      }}
    >
      <h3 style={{ marginBottom: '10px' }}>{building.name}</h3>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <LocationOnIcon style={{ marginRight: '5px' }} />
        <p style={{ fontSize: '0.8rem' }}>{building.address}</p>
      </div>
    </div>
  );
}

export default BuildingCard;
