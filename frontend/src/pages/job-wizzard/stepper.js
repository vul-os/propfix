import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { createJob } from 'src/api/jobs';
import { useAuthContext } from 'src/contexts/auth'; 
import UnitInfoStep from './unitinfo';
import JobInfoStep from './jobinfo';
import ReviewSubmitStep from './reviewsubmit';

const steps = ['UNIT INFO', 'JOB INFO', 'REVIEW & SUBMIT'];

export default function HorizontalLinearStepper() {
  const initialUnitInfo = {
    unitName: '',
    tenantIdentifier: '',
    unitIdentifier: '',
    buildingId: '',
  };

  const initialJobInfo = {
    title: '',
    description: '',
  };

  const [activeStep, setActiveStep] = useState(0);
  const [unitInfo, setUnitInfo] = useState(initialUnitInfo);
  const [jobInfo, setJobInfo] = useState(initialJobInfo);

  const { getIdToken } = useAuthContext();

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    if (activeStep === steps.length - 1) {
      try {
        const idToken = await getIdToken();

        const createdJob = await createJob(jobInfo, idToken);

        if (createdJob) {
          console.log('Job created successfully:', createdJob);
        } else {
          console.error('Error creating job');
        }

        setUnitInfo(initialUnitInfo);
        setJobInfo(initialJobInfo);
        setActiveStep(0);
      } catch (error) {
        console.error('Error creating job:', error);
      }
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
        return (
          unitInfo.unitName !== '' &&
          unitInfo.tenantIdentifier !== '' &&
          unitInfo.unitIdentifier !== '' &&
          unitInfo.buildingId !== ''
        );
      case 1:
        return (
          jobInfo.title !== '' && jobInfo.description !== ''
        );
      default:
        return true;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <UnitInfoStep
            unitInfo={unitInfo}
            handleUnitInfoChange={handleUnitInfoChange}
          />
        );
      case 1:
        return (
          <JobInfoStep jobInfo={jobInfo} handleJobInfoChange={handleJobInfoChange} />
        );
      case 2:
        return <ReviewSubmitStep unitInfo={unitInfo} jobInfo={jobInfo} />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length ? (
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
            <Button onClick={handleSubmit} disabled={!isStepValid()}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
