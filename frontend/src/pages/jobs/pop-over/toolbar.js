import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
// hooks
import { useBoolean } from '../../../hooks/use-boolean';
import { useResponsive } from '../../../hooks/use-responsive';
// components
import Iconify from '../../../components/iconify';
import { ConfirmDialog } from '../../../components/custom-dialog';
import CustomPopover, { usePopover } from '../../../components/custom-popover';

// ----------------------------------------------------------------------

export default function Toolbar({
  job,
  onDelete,
  onClosePopUp,
  onChangeColumn,
  columns,
  selectedColumnMap,
  setColumnByJobId,
  members,
}) {
  const smUp = useResponsive('up', 'sm');
  const confirm = useBoolean();
  const popover = usePopover();

  const selectedColumn = job && job.id && selectedColumnMap[job.id]
  
  const handleChangeCol = useCallback(
    (newValue) => {
      popover.onClose();
      if (job && job.id) {
        onChangeColumn(job.id, newValue, selectedColumn)
        setColumnByJobId(job.id, newValue);
      }
    },
    [popover]
  );

  const handleSelectedCheck = (k) => {
    console.log(k, selectedColumn, columns)
    return selectedColumn && (selectedColumn.name === columns[k].name)
  }

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          p: (theme) => theme.spacing(2.5, 1, 2.5, 2.5),
        }}
      >
        {!smUp && (
          <Tooltip title="Back">
            <IconButton onClick={() => onClosePopUp(job.id, selectedColumn)} sx={{ mr: 1 }}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
          </Tooltip>
        )}

        <Button
          size="small"
          variant="soft"
          endIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} sx={{ ml: -0.5 }} />}
          onClick={popover.onOpen}
        >
          {selectedColumn && selectedColumn.name}
        </Button>

        <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
          <Tooltip title="Delete job">
            <IconButton onClick={confirm.onTrue}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-right"
        sx={{ width: 140 }}
      >
        {columns && Object.keys(columns).map((k) => {
          return <MenuItem
            key={columns[k].id}
            selected={handleSelectedCheck(k)}
            onClick={() => {
              handleChangeCol(columns[k]);
            }}
          >
            {columns[k].name}
          </MenuItem>
        })
        }
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {job.name} </strong>?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Delete
          </Button>
        }
      />
    </>
  );
}

Toolbar.propTypes = {
  jobName: PropTypes.string,
  jobStatus: PropTypes.string,
  onClosePopUp: PropTypes.func,
  onDelete: PropTypes.func,
};
