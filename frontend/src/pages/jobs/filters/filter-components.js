import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { TextField, Box, Slider, Autocomplete, Checkbox, Typography  } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


export function SearchFilter({ value, onChange }) {
  return (
    <TextField
      label="Search Jobs"
      variant="outlined"
      fullWidth
      value={value}
      onChange={onChange}
      sx={{ marginTop: 3, marginBottom: 2 }}
    />
  );
}

export function DateRangeFilter({ value, onChange }) {
  console.log(value);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ marginTop: 1, width: '100%', maxWidth: '100%' }}>
        <DatePicker
          label="From"
          value={value[0]}
          onChange={(newDate) => onChange(newDate, value[1])}
          style={{ width: '100%' }}
          placeholder="" 
        />
      </Box>
      <Box sx={{ marginTop: 2, width: '100%', maxWidth: '100%' }}>
        <DatePicker
          label="To"
          value={value[1]}
          onChange={(newDate) => onChange([value[0], newDate])}
          style={{ width: '100%' }}
          placeholder="" 
        />
      </Box>
    </LocalizationProvider>
  );
}






export function SliderFilter({ value, min, max, onChange, label }) {
  return (
    <div>
      <Typography id={`${label}-slider`} gutterBottom>
        {label}
      </Typography>
      <Slider
        value={value}
        onChange={onChange}
        valueLabelDisplay="auto"
        aria-labelledby={`${label}-slider`}
        min={min}
        max={max}
      />
    </div>
  );
}



export function CheckboxFilter({ checked, onChange, label }) {
    return (
        <Checkbox
            checked={checked}
            onChange={onChange}
            inputProps={{ 'aria-label': label }}
        />
    );
}