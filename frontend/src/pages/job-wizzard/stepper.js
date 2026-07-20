import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { v4 as uuidv4 } from 'uuid';
import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';
import { createJob } from '../../api/jobs';
import BuildingSelectorStep from './building-selector-step';
import JobCreateStep from './job-create-step';
import ReviewSubmitStep from './review-submit-step';
import { getAllBuildings } from '../../api/buildings';
import { getAllLabels } from '../../api/labels';
import { uploadFile, deleteFile } from '../../api/files';
import { useAuthContext } from '../../contexts/auth'; 

const steps = ['Building Selection', 'Job Creation', 'Review & Submit'];

export default function ExoStepper({ handleClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [buildings, setBuildings] = useState({});
  const [selectedBuilding, setSelectedBuilding] = useState([]);
  const [job, setJob] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [labels, setLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [files, setFiles] = useState([]);
  const [usingLocation, setUsingLocation] = useState(true);  // default to true if you want to start with user location
  const [newJobId, setNewJobId] = useState(null);  // default to true if you want to start with user location
  const { activeOrganization } = useAuthContext(); 

  const navigate = useNavigate(); // Import useNavigate hook

  useEffect(() => {
    getUserLocation();
    setNewJobId(uuidv4())
  }, []);

  useEffect(() => {
    fetchBuildings();
  }, [searchValue, userLocation]);

  useEffect(() => {
    fetchLabels();
  }, [selectedBuilding]);

  const fetchBuildings = async () => {
    try {
      let fetchedBuildings;
      if (userLocation) {
        fetchedBuildings = await getAllBuildings(
          userLocation?.latitude,
          userLocation?.longitude,
          searchValue,
          activeOrganization
        );
      } else {
        fetchedBuildings = await getAllBuildings(null, null, searchValue, activeOrganization);
      }
      console.log(fetchedBuildings)
      setBuildings(fetchedBuildings);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const fetchLabels = async () => {
    try {
      if (selectedBuilding?.organization_id) {
        const fetchedLabels = await getAllLabels(
          selectedBuilding?.organization_id,
        );
        setLabels(fetchedLabels);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  function containsFilename(filename) {
    return attachments.find((attachment) => attachment.includes(filename));
  }

  function extractStringBeforeSlash(inputString) {
    const parts = inputString.split('/');
    if (parts.length > 0) {
      return parts[0];
    }
    return inputString;
  }

  function extractStringAfterLastSlash(inputString) {
    const parts = inputString.split('/');
    const lastIndex = parts.length - 1;
    if (lastIndex >= 0) {
      return parts[lastIndex];
    }
    return inputString;
  }

  const removeFile = async (file) => {
    try {
      const res = containsFilename(file.name);
      const resId = extractStringBeforeSlash(res);
      const resFilename = extractStringAfterLastSlash(res);
      if (res) {
        const deletedFile = await deleteFile(
          resId,
          file.name,
        );
        const updatedAttachments = attachments.filter((attachment) => attachment !== res);
        setAttachments(updatedAttachments);
        const updatedFiles = files.filter((f) => extractStringAfterLastSlash(f.name) !== resFilename);
        setFiles(updatedFiles);
      }
    } catch (error) {
      console.error('Error removing file:', error);
    }
  };

  const getUserLocation = () => {
    if (usingLocation) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLatitude = position.coords.latitude;
            const userLongitude = position.coords.longitude;
            setUserLocation({ latitude: userLatitude, longitude: userLongitude });
          },
          (error) => {
            console.error('Error getting user location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported in this browser.');
      }
    } else {
      setUserLocation(null);  // reset userLocation when not using location
    }
  
    // Toggle the usingLocation state
    setUsingLocation(prevState => !prevState);
  };
  
  const handleDrop = async (acceptedFiles) => {
    try {
      if (selectedBuilding?.organization_id) {
        const uped = await uploadFile(
          selectedBuilding?.organization_id,
          newJobId,
          acceptedFiles[0],
        );
        if (uped) {
          const fileNames = acceptedFiles.map(file => file.name);
  
          const updatedFiles = [...files, ...acceptedFiles];
          const updatedAttachments = [...attachments, ...fileNames]
          setFiles(updatedFiles);
          setAttachments(updatedAttachments);
        }
      }
    } catch (error) {
      console.error('Error adding file:', error);
    }
  };

  const handleNext = () => {
    if (isStepValid()) setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleFinish = async () => {
    // Calculate due date two weeks from now
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    const jobData = {
      ...job,
      id: newJobId,
      // labels: selectedLabels ? selectedLabels.map((l) => l.id) : [],
      attachments,
      building_id: selectedBuilding.id,
      organization_id: selectedBuilding.organization_id,
      priority: 'low',
      due_date: twoWeeksFromNow.toISOString(), // Convert to ISO string format
    };
    console.log(jobData)

    const createdJob = await createJob(jobData);
    console.log(createdJob)
    if (createdJob) {
      console.log('Job created successfully:', createdJob);
      handleClose();
    } else {
      console.error('Job creation failed.');
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return selectedBuilding.id !== '';
      case 1:
        return job.title !== '' && job.description !== '';
      default:
        return true;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BuildingSelectorStep
            selectedBuilding={selectedBuilding}
            setSelectedBuilding={setSelectedBuilding}
            buildings={buildings}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            handleLocationButtonClick={getUserLocation}
            nextStep={handleNext}
          />
        );
      case 1:
        return (
          <JobCreateStep
            job={job}
            setJob={setJob}
            labels={labels}
            selectedLabels={selectedLabels}
            setSelectedLabels={setSelectedLabels}
            handleDrop={handleDrop}
            handleDelete={removeFile}
            files={files}
            setFiles={setFiles}
          />
        );
      case 2:
        return <ReviewSubmitStep building={selectedBuilding} job={job} files={files} />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%', height: "100%" }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length ? (
        <div>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={() => setActiveStep(0)}>Reset</Button>
          </Box>
        </div>
      ) : (
        <div style={{ padding: '16px' }}>
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
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleFinish : handleNext}
              disabled={!isStepValid()}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </div>
      )}
    </Box>
  );
}
