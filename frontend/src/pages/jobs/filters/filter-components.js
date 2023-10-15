import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { TextField, Box, Slider, Autocomplete, Checkbox } from '@mui/material';
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
    console.log(value)
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ marginTop: 3, width: '100%' }}>
        <DatePicker label="From" value={value[0]} onChange={(newDate) => onChange([newDate, value[1]])} />
      </Box>
      <Box sx={{ marginTop: 3, width: '100%' }}>
        <DatePicker label="To" value={value[1]} onChange={(newDate) => onChange([value[0], newDate])} />
      </Box>
    </LocalizationProvider>
  );
}

export function SliderFilter({ value, min, max, onChange, labelFormat }) {
  return (
    <Slider
      value={value}
      onChange={onChange}
      valueLabelDisplay="auto"
      valueLabelFormat={labelFormat}
      min={min}
      max={max}
    />
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