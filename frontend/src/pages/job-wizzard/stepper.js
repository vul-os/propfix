import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import UnitInfoStep from './unitinfo';
import JobInfoStep from './jobinfo';
import ReviewSubmitStep from './reviewsubmit';

const steps = ['UNIT INFO', 'JOB INFO', 'REVIEW & SUBMIT'];

export default function HorizontalLinearStepper() {
  const initialUnitInfo = {
    unitName: '',
    // Initialize other fields as needed
  };

  const initialJobInfo = {
    title: '',
    description: '',
    // Initialize other fields as needed
  };

  const [activeStep, setActiveStep] = useState(0);
  const [unitInfo, setUnitInfo] = useState(initialUnitInfo);
  const [jobInfo, setJobInfo] = useState(initialJobInfo);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = () => {
    if (activeStep === steps.length - 1) {
      // Process the form data and submit

      // Reset the state to initial values
      setUnitInfo(initialUnitInfo);
      setJobInfo(initialJobInfo);

      // Reset the active step to the first step
      setActiveStep(0);
    } else {
      handleNext();
    }
  };

  const handleUnitInfoChange = (newUnitInfo) => {
    setUnitInfo(newUnitInfo);
  };

  const handleJobInfoChange = (newJobInfo) => {
    setJobInfo(newJobInfo);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return unitInfo.unitName !== ''; // Validate other fields as needed
      case 1:
        return jobInfo.title !== '' && jobInfo.description !== ''; // Validate other fields as needed
      default:
        return true;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <UnitInfoStep unitInfo={unitInfo} handleUnitInfoChange={handleUnitInfoChange} />;
      case 1:
        return <JobInfoStep jobInfo={jobInfo} handleJobInfoChange={handleJobInfoChange} />;
      case 2:
        return <ReviewSubmitStep unitInfo={unitInfo} jobInfo={jobInfo} />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          return (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
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
            <Button onClick={() => setActiveStep(0)}>Reset</Button>
          </Box>
        </>
      ) : (
        // Render step content and navigation buttons
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
          {getStepContent(activeStep)}
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
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid()}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
