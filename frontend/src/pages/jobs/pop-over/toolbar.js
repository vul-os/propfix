import React, { useState } from 'react'; // Import useState
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Iconify from '../../../components/iconify';
import { ConfirmDialog } from '../../../components/custom-dialog';
import CustomPopover from '../../../components/custom-popover';

export default function Toolbar({
  job,
  onDelete,
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

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleChangeCol = (newValue) => {
    handleClosePopover();
    if (job && job.id) {
      onChangeColumn(job.id, newValue, selectedColumn);
    }
  };

  const handleSelectedCheck = (k) => {
    return selectedColumn && selectedColumn.name === columns[k].name;
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
        <Button
          size="small"
          variant="soft"
          endIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} sx={{ ml: -0.5 }} />}
          onClick={onOpen}
        >
          {selectedColumn && selectedColumn.name}
        </Button>

        <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
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
        open={openPopover}
        onClose={handleClosePopover}
        arrow="top-right"
        sx={{ width: 140 }}
      >
        {columns &&
          Object.keys(columns).map((k) => {
            return (
              <MenuItem
                key={columns[k].id}
                selected={handleSelectedCheck(k)}
                onClick={() => {
                  handleChangeCol(columns[k]);
                }}
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
