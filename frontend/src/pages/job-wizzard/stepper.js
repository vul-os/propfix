import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';
import { createJob } from '../../api/jobs';
import { useAuthContext } from '../../contexts/auth';
import BuildingSelectorStep from './building-selector-step'; // Import the BuildingSelector component
import JobCreateStep from './job-create-step'; // Import the JobCreateStep component
import ReviewSubmitStep from './review-submit-step';
import { getAllBuildings } from '../../api/buildings';
import { getAllLabels } from '../../api/labels';
import { uploadFile, deleteFile } from '../../api/attachments';

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  // ... (styles for BootstrapInput)
}));

const steps = ['BUILDING SELECTION', 'JOB CREATION', 'REVIEW & SUBMIT'];

export default function HorizontalLinearStepper() {
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

  const { getIdToken } = useAuthContext();

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    fetchBuildings();
  }, [searchValue, userLocation]);

  useEffect(() => {
    fetchLabels();
  }, [selectedBuilding]);

  const fetchBuildings = async () => {
    try {
      const idToken = await getIdToken();
      const fetchedBuildings = await getAllBuildings(
        userLocation?.latitude,
        userLocation?.longitude,
        searchValue,
        idToken
      );

      // Update the building state with fetched buildings
      setBuildings(fetchedBuildings.buildings );
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const fetchLabels = async () => {
    try {
      if (selectedBuilding && selectedBuilding.organizationId) {
        const idToken = await getIdToken();
        const fetchedLabels = await getAllLabels(
          selectedBuilding.organizationId,
          idToken
        );
        setLabels(fetchedLabels.labels);
      }
      // Update the building state with fetched buildings
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  function containsFilename(filename) {
    console.log(attachments, filename);
  
    // Use the find() method to find the first string in the array that contains the filename
    return attachments.find((attachment) => attachment.includes(filename));
  }

  function extractStringBeforeSlash(inputString) {
    const parts = inputString.split('/');
    
    if (parts.length > 0) {
      return parts[0];
    }
    
    return inputString; // Return the original string if there are no slashes
  }    
  function extractStringAfterLastSlash(inputString) {
    const parts = inputString.split('/');
    const lastIndex = parts.length - 1;
    
    if (lastIndex >= 0) {
      return parts[lastIndex];
    }
    
    return inputString; // Return the original string if there are no slashes
  }
  
  const removeFile = async (file) => {
    try {
      const idToken = await getIdToken();
      console.log(file);
      const res = containsFilename(file.name);
      const resId = extractStringBeforeSlash(res);
      const resFilename = extractStringAfterLastSlash(res);
      console.log(resId);
      if (res) {
        const deletedFile = await deleteFile(
          resId,
          file.name,
          idToken
        );
  
        // Remove the file from attachments
        const updatedAttachments = attachments.filter((attachment) => attachment !== res);
  
        // Set attachments to the updatedAttachments array
        setAttachments(updatedAttachments);
  
        // Remove the file from files list based on resFilename using filter
        const updatedFiles = files.filter((f) => extractStringAfterLastSlash(f.name) !== resFilename);
  
        // Update the state or variables using setFiles function
        setFiles(updatedFiles);
      }
      // Update the building state with fetched buildings if needed
    } catch (error) {
      console.error('Error removing file:', error);
    }
  };
  
  
  

  const getUserLocation = () => {
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
  }; //

  const handleDrop = async (acceptedFiles) => {
    try {
      const idToken = await getIdToken();
      const fetchedLabels = await uploadFile(
          "tennant",
          acceptedFiles[0],
          idToken
      );
      const updatedFiles = [...files, ...acceptedFiles];
      const updatedAttachments = [...attachments, fetchedLabels.objectName]
      console.log(fetchedLabels.objectName, acceptedFiles, updatedAttachments)
      setFiles(updatedFiles);
      setAttachments(updatedAttachments);
      // Update the building state with fetched buildings
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
    const idToken = await getIdToken();
    console.log("kkkkkkk", selectedBuilding)
    const jobData = {...job, 
      labels: selectedLabels ? selectedLabels.map((l) => l.id) : [],
      buildingId: selectedBuilding.id,
      organizationId: selectedBuilding.organizationId
    }

    const createdJob = await createJob(jobData, idToken);

    if (createdJob) {
      console.log('Job created successfully:', createdJob);
    } else {
      console.error('Job creation failed.');
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return selectedBuilding.buildingId !== '';
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
            setSelectedBuilding={setSelectedBuilding} // Use setSelectedBuilding directly
            buildings={buildings} // Change buildingInfoData to building
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
        return <ReviewSubmitStep building={selectedBuilding} job={job} />;
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
        <div>
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
