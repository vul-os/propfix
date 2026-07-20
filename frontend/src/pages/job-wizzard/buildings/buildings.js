import React from 'react';
import BuildingCard from './building-card';

function Buildings({ buildings, setSelectedBuilding }) {
  console.log(buildings)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {buildings && buildings.length > 0 && buildings.map((building) => (
        <BuildingCard
          key={building.id}
          building={building}
          onSelectBuilding={setSelectedBuilding}
        />
      ))}
    </div>
  );
}

export default Buildings;
