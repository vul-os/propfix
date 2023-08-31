import React, { useState, useEffect } from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useAuthContext } from '../../contexts/auth';
import { getAllBuildings } from '../../api/buildings';

export default function UnitInfoStep({ unitInfo, handleUnitInfoChange }) {
  const { getIdToken } = useAuthContext();
  const [buildings, setBuildings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [useLocation, setUseLocation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

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
      setBuildings(fetchedBuildings);
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
      getUserLocation();
      setUseLocation(true);
    }
  };

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLatitude = position.coords.latitude;
          const userLongitude = position.coords.longitude;
          setUserLocation({ latitude: userLatitude, longitude: userLongitude });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported in this browser.');
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
      {buildings && buildings.map((building) => (
        <div key={building.id}>
          <h3>{building.name}</h3>
          <p>Address: {building.address}</p>
          {/* Other building information */}
        </div>
      ))}
    </div>
  );
}
