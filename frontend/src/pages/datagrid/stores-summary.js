import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { Card, Typography, Box, Button, IconButton, Modal } from '@mui/material';
import UpdateIcon from '@mui/icons-material/Update';
import PlansIcon from '@mui/icons-material/EventNote';

const StyledIcon = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  width: theme.spacing(8),
  height: theme.spacing(8),
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
}));

StoresSummary.propTypes = {
  updateStores: PropTypes.func.isRequired,
  maxProducts: PropTypes.number.isRequired,
  numSelectedProducts: PropTypes.number.isRequired,
};


export default function StoresSummary({ updateStores, maxProducts, numSelectedProducts, sx }) {
  const theme = useTheme();
  const isExceeded = numSelectedProducts >= maxProducts;
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  const cardStyles = {
    py: 4,
    px: 3,
    boxShadow: 0,
    textAlign: 'center',
    ...sx,
    backgroundColor: isExceeded ? '#FFCDD2' : theme.palette.primary.lighter,
    width: '85%', // Mobile width
    '@media (min-width: 600px)': {
      width: 200, // Desktop width
    },
  };

  const buttonStyles = {
    marginTop: '8px', // Adjust the marginTop value to increase or decrease the space
  };

  const handlePlansClick = () => {
    navigate('/account/plans');
  };

  const handleUpdateClick = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleModalConfirm = () => {
    updateStores();
    setOpenModal(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        '@media (min-width: 600px)': {
          flexDirection: 'row',
        },
      }}
    >
      <Card sx={cardStyles}>
        <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
          Max Products
        </Typography>
        <Typography variant="h3">{maxProducts}</Typography>
        <Button variant="contained" startIcon={<PlansIcon />} sx={buttonStyles} onClick={handlePlansClick}>
          Plans
        </Button>
      </Card>
      <Card sx={cardStyles}>
        <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
          Selected Products
        </Typography>
        <Typography variant="h3">{numSelectedProducts}</Typography>
        <Button variant="contained" startIcon={<UpdateIcon />} sx={buttonStyles} onClick={handleUpdateClick}>
          Update Stores
        </Button>
      </Card>
      <Modal open={openModal} onClose={handleModalClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4 }}>
          <Typography variant="h6">Confirmation</Typography>
          <Typography variant="body1">You are about to update the stores you have access to. This will override your current list of stores.</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" onClick={handleModalClose} sx={{ mr: 2 }}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleModalConfirm}>Confirm</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
