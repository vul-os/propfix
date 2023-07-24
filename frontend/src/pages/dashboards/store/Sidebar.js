import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  Typography,
  TextField
} from '@mui/material';

import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateRange } from '@mui/x-date-pickers-pro';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';

import Scrollbar from '../../../components/scrollbar';
import Iconify from '../../../components/iconify';
import { ColorMultiPicker } from '../../../components/color-utils';

FilterSidebar.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  selectedDate: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  setSelectedDate: PropTypes.func,
  stores: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      image: PropTypes.string,
    })
  ),
  setStores: PropTypes.func,
};

export default function FilterSidebar({
  open,
  setOpen,
  selectedDate,
  setSelectedDate,
  stores,
  setStores,
}) {
  const [selectedStores, setSelectedStores] = useState([]);

  const handleStoreChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedStores((prevSelectedStores) => [...prevSelectedStores, value]);
    } else {
      setSelectedStores((prevSelectedStores) =>
        prevSelectedStores.filter((store) => store !== value)
      );
    }
  };

  const handleDateChange = (dateRange) => {
    setSelectedDate(dateRange);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClearAll = () => {
    setSelectedStores([]);
    setSelectedDate([null, null]);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 280, border: 'none', overflow: 'hidden' },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, py: 2 }}>
          <Typography variant="subtitle1" sx={{ ml: 1 }}>
            Filters
          </Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>

        <Divider />

        <Scrollbar>
          <Stack spacing={3} sx={{ p: 3 }}>
            <div>
              <Typography variant="subtitle1" gutterBottom>
                Stores
              </Typography>
              <FormGroup>
                {stores.map((store) => (
                  <FormControlLabel
                    key={store.id}
                    control={
                      <Checkbox
                        checked={selectedStores.includes(store.id)}
                        onChange={handleStoreChange}
                        value={store.id}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <img
                          src={store.image}
                          alt={store.name}
                          style={{ width: '20px', height: '20px', marginRight: '8px' }}
                        />
                        {store.name}
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </div>

            <div>
              <Typography variant="subtitle1" gutterBottom>
                Date Range
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}> {/* Update to AdapterDayjs */}
                <DateRangePicker
                  value={selectedDate}
                  onChange={(newValue) => handleDateChange(newValue)}
                />
              </LocalizationProvider>
            </div>
          </Stack>
        </Scrollbar>

        <Box sx={{ p: 3 }}>
          <Button
            fullWidth
            size="large"
            type="submit"
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="ic:round-clear-all" />}
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
