import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import moment from 'moment';

// @mui
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
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
import CustomPopover from '../../../components/custom-popover';

// ----------------------------------------------------------------------

export default function Toolbar({
  job,
  onDelete,
  onCloseJob,
  onReOpenJob,
  columns,
  onChangeColumn,
  selectedColumn,
  onClose, // Function to close the popover
}) {
  const [openPopover, setOpenPopover] = useState(null); // Define openPopover
  const [confirmationOpen, setConfirmationOpen] = useState(false); // Define confirmationOpen

  const onOpen = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const closePopover = useCallback(() => {
    setOpen(false);
  }, []);

  const onDel = () => {
    closePopover();
    confirm.setValue(false);
    onDelete();
  };

  const handleChangeCol = useCallback(
    (newValue) => {
      closePopover();
      if (job && job.id) {
        onChangeColumn(job.id, newValue, selectedColumn);
      }
    },
    [closePopover, job, onChangeColumn, selectedColumn]
  );

  const handleSelectedCheck = (k) => {
    return selectedColumn && selectedColumn.name === columns[k].name;
  };

  const isJobClosed = moment(job.closedAt).year() === 0;

  const handleToggleJobStatus = () => {
    if (isJobClosed) {
      onReOpenJob(job.id);
    } else {
      onCloseJob(job.id);
    }
  };

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
            <IconButton onClick={closePopover} sx={{ mr: 1 }}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
          </Tooltip>
        )}
        <Button
          size="small"
          variant="soft"
          endIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} sx={{ ml: -0.5 }} />}
          onClick={onOpen}
        >
          {selectedColumn && selectedColumn.name}
        </Button>

        <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
          <Tooltip title={isJobClosed ? "Reopen job" : "Close job"}>
            <IconButton onClick={handleToggleJobStatus}>
              <Iconify icon={isJobClosed ? "eva:checkmark-fill" : "eva:close-fill"} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete job">
            <IconButton onClick={() => setConfirmationOpen(true)}> {/* Open confirmation dialog */}
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>

          {/* Add close button here */}
          <Tooltip title="Close">
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>

      </Stack>

      <CustomPopover
        open={open}
        onClose={closePopover}
        arrow="top-right"
        sx={{ width: 140 }}
      >
        {columns && Object.keys(columns).map((k) => {
          return (
            <MenuItem
              key={columns[k].id}
              selected={handleSelectedCheck(k)}
              onClick={() => handleChangeCol(columns[k])}
            >
              {columns[k].name}
            </MenuItem>
          );
        })}
      </CustomPopover>

      <ConfirmDialog
        open={confirmationOpen} // Use confirmationOpen
        onClose={() => setConfirmationOpen(false)} // Close confirmation dialog
        title="Delete"
        content={
          <>
            Are you sure you want to delete <strong>{job.name}</strong>?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={onDel}>
            Delete
          </Button>
        }
      />
    </>
  );
}

Toolbar.propTypes = {
  job: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onReOpen: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  onChangeColumn: PropTypes.func.isRequired,
  selectedColumn: PropTypes.object.isRequired,
};
