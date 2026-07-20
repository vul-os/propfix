import React from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

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
        width: '80%',
        margin: '10px',
        cursor: 'pointer',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
      }}
    >
      {/* Icon and Name Row */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
        <AccountCircleIcon style={{ fontSize: '24px', marginRight: '10px' }} />
        <h3 style={{ fontSize: '18px', margin: '0' }}>{building.name}</h3>
      </div>

      {/* Location Icon and Address Row */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <LocationOnIcon style={{ fontSize: '24px', marginRight: '10px' }} />
        <p style={{ fontSize: '16px', margin: '0' }}>{building.address}</p>
      </div>
    </div>
  );
}

export default BuildingCard;
