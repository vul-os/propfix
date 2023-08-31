import React, { useState, useEffect } from 'react';
import { TextField, IconButton, InputAdornment, Card, CardContent, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useAuthContext } from '../../contexts/auth';
import { getAllBuildings } from '../../api/buildings';

export function getUserLocation(onSuccess, onError) {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLatitude = position.coords.latitude;
        const userLongitude = position.coords.longitude;
        onSuccess({ latitude: userLatitude, longitude: userLongitude });
      },
      (error) => {
        console.error('Error getting user location:', error);
        onError(error);
      }
    );
  } else {
    console.error('Geolocation is not supported in this browser.');
    onError(new Error('Geolocation is not supported.'));
  }
}

export default function UnitInfoStep({ unitInfo, handleUnitInfoChange, handleNext, isStepValid }) {
  const { getIdToken } = useAuthContext();
  const [buildings, setBuildings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [useLocation, setUseLocation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    if (useLocation && userLocation) {
      fetchBuildings(userLocation);
    } else if (searchValue.trim() !== '') {
      fetchBuildings(null, searchValue);
    }
  }, [useLocation, userLocation, searchValue]);

  const fetchBuildings = async (location, search) => {
    try {
      setLoading(true);
      const idToken = await getIdToken();
      let fetchedBuildings = [];

      if (useLocation && location) {
        fetchedBuildings = await getAllBuildings(location.latitude, location.longitude, null, idToken);
      } else if (search) {
        fetchedBuildings = await getAllBuildings(null, null, search, idToken);
      }

      setLoading(false);
      setBuildings(fetchedBuildings.buildings);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      setLoading(false);
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSearchButton = () => {
    setUseLocation(false); // Search takes priority over location
    fetchBuildings(null, searchValue);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      setUseLocation(false); // Search takes priority over location
      fetchBuildings(null, searchValue);
    }
  };

  const handleLocationButtonClick = () => {
    const confirmLocation = window.confirm('Allow this app to access your location?');
    if (confirmLocation) {
      getUserLocation(
        (location) => {
          setUserLocation(location);
          setUseLocation(true);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  };

  const handleSelectBuilding = (building) => {
    setSelectedBuilding(building);
    handleNext(); // Proceed to the next step
  };
  

  const handleNextClick = () => {
    if (selectedBuilding) {
      handleNext();
    } else {
      const confirmProceed = window.confirm(
        'You have not selected a building. Do you want to proceed to the next step?'
      );
      if (confirmProceed) {
        handleNext();
      }
    }
  };

  return (
    <div>
      <TextField
        label="Search and Select a Building"
        fullWidth
        value={searchValue}
        onChange={handleSearchInputChange}
        onKeyDown={handleSearchKeyDown}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleLocationButtonClick}>
                <LocationOnIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {/* Display cards with buildings */}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {buildings && buildings.map((building) => (
          <Card key={building.id} style={{ margin: '10px', minWidth: '200px' }}>
            <CardContent>
              <h3>{building.name}</h3>
              <p>Address: {building.address}</p>
              <Button
                variant="contained"
                onClick={() => handleSelectBuilding(building)}
                disabled={!building.address || selectedBuilding !== null}
              >
                Select this Building
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Next button */}
      <Button
        variant="contained"
        onClick={handleNextClick}
        disabled={!isStepValid() && !selectedBuilding}
        style={{ marginTop: '20px' }}
      >
        Next
      </Button>
    </div>
  );
}
