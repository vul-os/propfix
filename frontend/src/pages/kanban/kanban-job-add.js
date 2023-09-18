import PropTypes from 'prop-types';
import { useState, useCallback, useMemo } from 'react';
// @mui
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';
// _mock
// utils

// ----------------------------------------------------------------------

export default function KanbanJobAdd({ columnId, onAddJob, openAddJob }) {
  const [name, setName] = useState('');

  const handleKeyUpAddJob = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        if (name) {
          openAddJob.onFalse()
          onAddJob(name, columnId);
        }
      }
    },
    [columnId, name, onAddJob, openAddJob]
  );

  const handleClickAddJob = useCallback(() => {
    if (name) {
      openAddJob.onFalse()
      onAddJob(name, columnId);
    } else {
      openAddJob.onFalse()
    }
  }, [columnId, name, onAddJob, openAddJob]);

  const handleChangeName = useCallback((event) => {
    setName(event.target.value);
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClickAddJob}>
      <Paper
        sx={{
          borderRadius: 1.5,
          bgcolor: 'background.default',
          boxShadow: (theme) => theme.customShadows.z1,
        }}
      >
        <InputBase
          autoFocus
          multiline
          fullWidth
          placeholder="Job name"
          value={name}
          onChange={handleChangeName}
          onKeyUp={handleKeyUpAddJob}
          sx={{
            px: 2,
            height: 56,
            [`& .${inputBaseClasses.input}`]: {
              typography: 'subtitle2',
            },
          }}
        />
      </Paper>
    </ClickAwayListener>
  );
}