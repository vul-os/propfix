import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import PropTypes from 'prop-types'; // Import PropTypes for prop validation


export default function LabelAutocomplete({ labels, selectedLabels, setSelectedLabels, textFieldProps }) {
  console.log('Labels received:', labels); // Debug log
  console.log('Selected labels:', selectedLabels); // Debug log

  return (
    <Stack spacing={3} sx={{ width: 500 }}>
      <Autocomplete
        multiple
        id="label-autocomplete"
        options={labels}
        getOptionLabel={(option) => option.name}
        value={selectedLabels}
        onChange={(_, newValue) => {
          setSelectedLabels(newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Labels"
            {...textFieldProps}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={option?.name || index.toString()} // Add a unique "key" prop
              label={option?.name}
              style={{ backgroundColor: option?.color, color: '#fff' }}
              {...getTagProps({ index })}
              {...textFieldProps}
            />
          ))
        }
      />
    </Stack>
  );
}

// Prop type validation
LabelAutocomplete.propTypes = {
  labels: PropTypes.array.isRequired,
  selectedLabels: PropTypes.array.isRequired,
  setSelectedLabels: PropTypes.func.isRequired,
  textFieldProps: PropTypes.object.isRequired,
};
