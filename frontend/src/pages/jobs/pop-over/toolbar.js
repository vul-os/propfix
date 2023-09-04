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
  jobName,
  jobStatus,
  onDelete,
  onClosePopUp,
  columns,
  column,
  setColumn
}) {
  const smUp = useResponsive('up', 'sm');
  const confirm = useBoolean();
  const popover = usePopover();

  const handleChangeColumn = useCallback(
    (newValue) => {
      popover.onClose();
      setColumn(newValue);
    },
    [popover]
  );

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
            <IconButton onClick={onClosePopUp} sx={{ mr: 1 }}>
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
          {column}
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
            selected={column === columns[k].name}
            onClick={() => {
              handleChangeColumn(column);
            }}
          >
            {column}
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
            Are you sure want to delete <strong> {jobName} </strong>?
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
