import React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

function EmailAutocomplete({ values, setValues }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const trimmedEmail = event.target.value.trim();
      if (trimmedEmail && !values.includes(trimmedEmail)) {
        setValues([...values, trimmedEmail]);
        event.target.value = '';
      }
    }
  };

  return (
    <Autocomplete
      sx={{ width: '100%' }}
      multiple
      value={values}
      options={[]}
      onChange={(event, newValue) => setValues(newValue)}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="Emails"
          placeholder="Type and press Enter"
          onKeyDown={handleKeyDown}
        />
      )}
    />
  );
}

export default EmailAutocomplete;
