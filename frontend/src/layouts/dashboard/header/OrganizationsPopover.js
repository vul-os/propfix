import React, { useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, MenuItem, Stack, IconButton, Popover, Typography } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business'; // Import the Business icon
import { useAuthContext } from '../../../contexts/auth';

export default function OrganizationsPopover() {
  const { organizations, activeOrganization, setActiveOrganization } = useAuthContext();
  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleOrganizationClick = (organizationValue) => {
    setActiveOrganization(organizationValue);
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.focusOpacity),
          }),
        }}
      >
        {/* Use the Business icon as the icon */}
        <BusinessIcon fontSize="small" />
      </IconButton>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 2,
            mt: 1.5,
            ml: 0.75,
            width: 250,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <Stack spacing={0.75}>
          {organizations.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === activeOrganization}
              onClick={() => handleOrganizationClick(option.value)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start', // Align content to the left
              }}
            >
              <Typography variant="body1" sx={{ marginBottom: 0.5 }}>
                {option.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {option.id}
              </Typography>
            </MenuItem>
          ))}
        </Stack>
      </Popover>
    </>
  );
}
