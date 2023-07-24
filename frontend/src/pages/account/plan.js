import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CancelIcon from '@mui/icons-material/Cancel';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const PlanCard = ({ planCode, name, price, logo, onCancel }) => {
  const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);

  const handleCancel = () => {
    setIsConfirmationOpen(true);
  };

  const handleConfirmCancel = () => {
    setIsConfirmationOpen(false);
    onCancel(planCode);
  };

  const handleCancelConfirmation = () => {
    setIsConfirmationOpen(false);
  };

  return (
    <Card sx={{ maxWidth: 400 }}>
      <CardContent>
        {logo ? (
          <img src={logo} alt="Plan Logo" width="50" height="50" />
        ) : (
          <CardMembershipIcon />
        )}
        <Typography variant="h6" component="div">
          {name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Price: {price}
        </Typography>
        { name !== "Free" &&
          <Button
          variant="contained"
          startIcon={<CancelIcon />}
          onClick={handleCancel}
          >
            Cancel
          </Button>
        }
        <Dialog open={isConfirmationOpen} onClose={handleCancelConfirmation}>
          <DialogTitle>Confirm Cancellation</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to cancel this plan?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelConfirmation}>No</Button>
            <Button onClick={handleConfirmCancel}>Yes, Cancel</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
