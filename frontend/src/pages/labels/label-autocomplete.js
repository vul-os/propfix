import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

export default function LabelAutocomplete({ labels, selectedLabels, setSelectedLabels, textFieldProps }) {
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
          value.map((option) => (
            <Chip
              key={option?.id}
              label={option?.name}
              style={{ backgroundColor: option?.color, color: '#fff' }}
              {...getTagProps({ index: 0 })}
              {...textFieldProps}
            />
          ))
        }
      />
    </Stack>
  );
}
