import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import UnitInfoStep from './unitinfo'; 
import JobInfoStep from './jobinfo'; 
import ReviewSubmitStep from './reviewsubmit'; // Make sure to import ReviewSubmitStep

const steps = ['Unit Info', 'Job Info', 'Review & Submit'];

export default function HorizontalLinearStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [unitInfo, setUnitInfo] = useState({
    unitName: '',
    // Add more unit info fields as needed
  });
  const [jobInfo, setJobInfo] = useState({
    title: '',
    description: '',
    // Add more job info fields as needed
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setOpen(true); // Open the review and submit dialog
    } else {
      setOpen(true); // Open the dialog for the current step
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setOpen(true); // Open the dialog for the previous step
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    setOpen(false);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleUnitInfoChange = (newUnitInfo) => {
    setUnitInfo(newUnitInfo);
  };

  const handleJobInfoChange = (newJobInfo) => {
    setJobInfo(newJobInfo);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <UnitInfoStep unitInfo={unitInfo} handleUnitInfoChange={handleUnitInfoChange} />
        );
      case 1:
        return (
          <JobInfoStep jobInfo={jobInfo} handleJobInfoChange={handleJobInfoChange} />
        );
      case 2:
        return (
          <ReviewSubmitStep unitInfo={unitInfo} jobInfo={jobInfo} />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel
                {...labelProps}
                onClick={handleNext} // Open the dialog for the clicked step
              >
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        // Render completed message and reset button
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </>
      ) : (
        // Render step content and navigation buttons
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </>
      )}
      {/* Pop-up dialog for step content */}
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>{steps[activeStep]}</DialogTitle>
        <DialogContent>
          {getStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Next</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
