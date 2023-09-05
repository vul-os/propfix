import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { styled, alpha } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from '../../../hooks/use-boolean';
import InputName from './input-name';
import Priority from './priority';
import Attachments from './attachments';
import EventsList from '../events/events-list';
import Iconify from '../../../components/iconify';
import MembersDialog from './members-dialog';

import LabelAutocomplete from '../../labels/label-autocomplete';

// ----------------------------------------------------------------------

dayjs.extend(utc);

// ----------------------------------------------------------------------

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

// ----------------------------------------------------------------------

export default function JobDetails({ job, members, labels }) {
  const assignees = job?.assigneeIds?.map((jobId) => members && members[jobId])
  console.log("assignees", assignees)

  const contacts = useBoolean();

  const [priority, setPriority] = useState(job.priority.toLowerCase());
  const [jobName, setJobName] = useState(job.name);
  const [jobDescription, setJobDescription] = useState(job.description);
  const [dueDate, setDueDate] = useState(new Date()); // Initialize with today's date
  const [selectedLabels, setSelectedLabels] = useState([]);


  const handleChangeJobDescription = useCallback((event) => {
    setJobDescription(event.target.value);
  }, []);

  const handleChangePriority = useCallback((newValue) => {
    setPriority(newValue);
  }, []);

  const handleUpdateJob = useCallback(async (jobData) => {
    try {
      // const token = await getIdToken(); // Get the JWT token from the auth context
      // updateJob(jobData, token); // Pass the token to the updateJob function
    } catch (error) {
      console.error(error);
    }
  }, []);

  const renderName = (
    <InputName
      placeholder="Task name"
      value={jobName}
      onChange={(event) => setJobName(event.target.value)}
      onKeyUp={handleUpdateJob}
    />
  );

  const renderPriority = (
    <Stack direction="row" alignItems="center">
      <StyledLabel>Priority</StyledLabel>
      <Priority priority={priority} onChangePriority={handleChangePriority} />
    </Stack>
  );

  const renderLabel = (
    <Stack direction="row">
      <StyledLabel sx={{ height: 24, lineHeight: '24px' }}>Labels</StyledLabel>
      <LabelAutocomplete 
        labels={Object.values(labels)}
        selectedLabels={selectedLabels}
        setSelectedLabels={setSelectedLabels}
        textFieldProps={{size: "small"}}
      />
      {/* {job.labels && job.labels.length && (
        <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
          {job.labels.map((label) => (
            <Chip key={label} color="info" label={label} size="small" variant="soft" />
          ))}
        </Stack>
      )} */}
    </Stack>
  );

  const renderAssignee = (
    <Stack direction="row">
      <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Assignee</StyledLabel>

      <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
        {assignees && assignees.map((user) => (<Avatar key={user?.id} alt={user?.displayName} src={user?.photoUrl} />))}

        <Tooltip title="Add assignee">
          <IconButton
            onClick={contacts.onTrue}
            sx={{
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
              border: (theme) => `dashed 1px ${theme.palette.divider}`,
            }}
          >
            <Iconify icon="mingcute:add-line" />
          </IconButton>
        </Tooltip>

        <MembersDialog
          members={Object.values(members)}
          assignees={assignees}
          open={contacts.value}
          onClose={contacts.onFalse}
        />
      </Stack>
    </Stack>
  );

  const renderDueDate = (
    <Stack direction="row" alignItems="center">
      <StyledLabel> Due date </StyledLabel>
      <DatePicker
        value={dueDate}
        onChange={(newValue) => setDueDate(newValue)}
        renderInput={(params) => <TextField {...params} />}
      />
    </Stack>
  );

  const renderDescription = (
    <Stack direction="row">
      <StyledLabel> Description </StyledLabel>

      <TextField
        fullWidth
        multiline
        size="small"
        InputProps={{
          sx: { typography: 'body2' },
        }}
        value={jobDescription}
        onChange={handleChangeJobDescription}
      />
    </Stack>
  );

  const renderAttachments = (
    <Stack direction="row">
      <StyledLabel>Attachments</StyledLabel>
      <Attachments jobId={job.id} attachments={job.attachmenturls} />
    </Stack>
  );

  return (
    <Stack
      spacing={3}
      sx={{
        pt: 3,
        pb: 5,
        px: 2.5,
      }}
    >
      {renderName}
      {renderPriority}
      {renderLabel}
      {renderDueDate}
      {/* {renderReporter} */}
      {renderAssignee}
      {renderAttachments}
      {renderDescription}
    </Stack>
  );
}

JobDetails.propTypes = {
  job: PropTypes.object,
};
