import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles'; // Import the styled utility
import InputBase from '@mui/material/InputBase';
import { getAllBuildings } from '../../api/buildings';
import { useAuthContext } from '../../contexts/auth';

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  borderRadius: 4,
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  border: '1px solid #ced4da',
  fontSize: 16,
  padding: '10px 26px 10px 12px',
  transition: theme.transitions.create(['border-color', 'box-shadow']),
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  '&:focus': {
    borderRadius: 4,
    borderColor: '#80bdff',
    boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
  },
}));

export default function UnitInfoStep({ unitInfo, handleUnitInfoChange }) {
  const { getIdToken } = useAuthContext();
  const [buildings, setBuildings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [userChoice, setUserChoice] = useState('');

  useEffect(() => {
    fetchBuildings();
    getUserLocation();
  }, []);

  const fetchBuildings = async () => {
    try {
      const idToken = await getIdToken();
      const fetchedBuildings = await getAllBuildings(
        userLocation?.latitude,
        userLocation?.longitude,
        '',
        idToken
      );
      setBuildings(fetchedBuildings);
    } catch (error) {
      console.error('Error fetching buildings:', error);
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
        label="Name"
        value={unitInfo.Name}
        onChange={(e) => handleUnitInfoChange({ ...unitInfo, unitName: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
      <TextField
        label="Tenant Identifier"
        value={unitInfo.tenantIdentifier}
        onChange={(e) => handleUnitInfoChange({ ...unitInfo, tenantIdentifier: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
      <TextField
        label="Unit Identifier"
        value={unitInfo.unitIdentifier}
        onChange={(e) => handleUnitInfoChange({ ...unitInfo, unitIdentifier: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
      <FormControl variant="standard" fullWidth sx={{ marginBottom: '16px' }}>
        <InputLabel id="building-choice-label">Choose an Option...</InputLabel>
        <Select
          labelId="building-choice-label"
          id="building-choice"
          value={userChoice}
          onChange={(event) => {
            setUserChoice(event.target.value);
            if (event.target.value === 'location') {
              getUserLocation();
              handleUnitInfoChange({
                ...unitInfo,
                buildingId: 'use-location',
              });
            } else {
              handleUnitInfoChange({
                ...unitInfo,
                buildingId: '',
              });
            }
          }}
          input={<BootstrapInput />}
        >
          <MenuItem value="">Choose an Option...</MenuItem>
          <MenuItem value="location">Use My Location</MenuItem>
          <MenuItem value="type">Type Building Name</MenuItem>
          {buildings.map((building) => (
            <MenuItem key={building.id} value={building.id}>
              {building.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {userChoice === 'type' && (
        <TextField
          label="Type Building Name"
          value={unitInfo.buildingId}
          onChange={(e) => handleUnitInfoChange({ ...unitInfo, buildingId: e.target.value })}
          fullWidth
          style={{ marginBottom: '16px' }}
        />
      )}
    </div>
  );
}
