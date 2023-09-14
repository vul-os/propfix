import React, { useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, MenuItem, Stack, IconButton, Popover, Typography } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business'; // Import the Business icon
import { useAuthContext } from '../../../contexts/auth';

// Function to generate a shorter organization ID representation
const generateShortId = (id) => {
  // You can implement your logic here to create a shorter ID
  // For example, you can take the first few characters
  return id.substring(0, 5); // This takes the first 5 characters of the ID
};

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
              key={option.id}
              selected={option.id === activeOrganization}
              onClick={() => handleOrganizationClick(option.id)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start', // Align content to the left
              }}
            >
              <Typography variant="body1" sx={{ marginBottom: 0.5 }}>
                {option.name}
              </Typography>
              <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {option.id}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {generateShortId(option.id)} {/* Display the shorter ID */}
                </Typography>
              </div>
            </MenuItem>
          ))}
        </Stack>
      </Popover>
    </>
  );
}
