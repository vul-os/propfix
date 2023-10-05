import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import SearchNotFound from '../../../components/search-not-found';

const ITEM_HEIGHT = 64;

export default function BuildingsDialog({ buildings = [], selectedBuildings = [], handleBuildingToggle, open, onClose }) {
  const [searchBuilding, setSearchBuilding] = useState('');

  const handleSearchBuilding = useCallback((event) => {
    setSearchBuilding(event.target.value);
  }, []);

  const dataFiltered = applyFilter({
    inputData: buildings,
    query: searchBuilding,
  });

  const notFound = !dataFiltered.length && !!searchBuilding;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 0 }}>
        Buildings <Typography component="span">({buildings.length})</Typography>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2.5 }}>
        <TextField
          fullWidth
          value={searchBuilding}
          onChange={handleSearchBuilding}
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {notFound ? (
          <SearchNotFound query={searchBuilding} sx={{ mt: 3, mb: 10 }} />
        ) : (
          <Scrollbar
            sx={{
              px: 2.5,
              height: ITEM_HEIGHT * 6,
            }}
          >
            {dataFiltered.map((building) => {
              const checked = selectedBuildings.map((selected) => selected?.id).includes(building?.id);

              return (
                <ListItem
                  key={building.id}
                  disableGutters
                  secondaryAction={
                    <Button
                      size="small"
                      onClick={() => handleBuildingToggle(building)}
                      color={checked ? 'primary' : 'inherit'}
                      startIcon={
                        <Iconify
                          width={16}
                          icon={checked ? 'eva:checkmark-fill' : 'mingcute:add-line'}
                          sx={{ mr: -0.5 }}
                        />
                      }
                    >
                      {checked ? 'Selected' : 'Select'}
                    </Button>
                  }
                  sx={{ height: ITEM_HEIGHT }}
                >
                  <ListItemAvatar>
                    <Avatar src={building.photoUrl} />
                  </ListItemAvatar>

                  <ListItemText
                    primaryTypographyProps={{
                      typography: 'subtitle2',
                      sx: { mb: 0.25 },
                    }}
                    secondaryTypographyProps={{ typography: 'caption' }}
                    primary={building.aname}
                    secondary={building.location}
                  />
                </ListItem>
              );
            })}
          </Scrollbar>
        )}
      </DialogContent>
    </Dialog>
  );
}

function applyFilter({ inputData, query }) {
  if (query) {
    inputData = inputData.filter(
      (building) =>
        building.aname.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        building.location.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;
}

BuildingsDialog.propTypes = {
  buildings: PropTypes.array.isRequired,
  selectedBuildings: PropTypes.array.isRequired,
  handleBuildingToggle: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
