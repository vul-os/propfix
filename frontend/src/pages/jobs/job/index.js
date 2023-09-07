import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { styled, alpha } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from '../../../hooks/use-boolean';
import InputName from './input-name';
import Priority from './priority';
import Attachments from './attachments';
import Iconify from '../../../components/iconify';
import MembersDialog from './members-dialog';
import LabelAutocomplete from '../../labels/label-autocomplete';

dayjs.extend(utc);

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export default function JobDetails({ job, members, labels }) {
  const [newJob, setNewJob] = useState({
    ...job,
    priority: job.priority.toLowerCase(),
    dueDate: dayjs.utc(job.dueDate).toDate(),
    createdAt: dayjs.utc(job.createdAt).toDate()
  });
  
  const handleUpdateField = useCallback((field) => {
    return (event) => {
      const value = event.target ? event.target.value : event;
      setNewJob(prevJob => ({
        ...prevJob,
        [field]: value,
      }));
    };
  }, []);

  const contacts = useBoolean();
  const assignees = useMemo(() => newJob?.assigneeIds?.map((jobId) => members && members[jobId]), [newJob?.assigneeIds, members]);

  const renderName = useMemo(() => (
    <InputName
      placeholder="Task name"
      value={newJob.name}
      onChange={handleUpdateField('name')}
    />
  ), [newJob.name, handleUpdateField]);

  const renderPriority = useMemo(() => (
    <Stack direction="row" alignItems="center">
      <StyledLabel>Priority</StyledLabel>
      <Priority priority={newJob.priority} onChangePriority={handleUpdateField('priority')} />
    </Stack>
  ), [newJob.priority, handleUpdateField]);

  const renderLabel = useMemo(() => (
    <Stack direction="row">
      <StyledLabel sx={{ height: 24, lineHeight: '24px' }}>Labels</StyledLabel>
      <LabelAutocomplete 
        labels={Object.values(labels)} // Assuming `labels` prop is also an object with label IDs as keys
        selectedLabels={newJob?.labels?.map((id) => labels[id])} // Assuming `newJob.labels` is an array of label IDs
        setSelectedLabels={(newSelectedLabels) => {
          const newSelectedLabelIds = newSelectedLabels.map(label => label.id); // Assuming the label object has an 'id' field
          setNewJob(prevJob => ({
            ...prevJob,
            labels: newSelectedLabelIds,
          }));
        }}
        textFieldProps={{size: "small"}}
      />
    </Stack>
  ), [newJob.labels, handleUpdateField, labels]);
  
  
  const renderAssignee = useMemo(() => (
    <Stack direction="row">
      <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Assignee</StyledLabel>
      <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
        {assignees && assignees.map((user) => (
          <Avatar key={user?.id} alt={user?.displayName} src={user?.photoUrl} />
        ))}
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
  ), [assignees, contacts]);

  const renderDueDate = useMemo(() => (
    <Stack direction="row" alignItems="center">
      <StyledLabel> Due date </StyledLabel>
      <DatePicker
        value={newJob.dueDate}
        onChange={handleUpdateField('dueDate')}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </Stack>
  ), [newJob.dueDate, handleUpdateField]);

  const renderDescription = useMemo(() => (
    <Stack direction="row">
      <StyledLabel> Description </StyledLabel>
      <TextField
        fullWidth
        multiline
        size="small"
        InputProps={{
          sx: { typography: 'body2' },
        }}
        value={newJob.description}
        onChange={handleUpdateField('description')}
      />
    </Stack>
  ), [newJob.description, handleUpdateField]);

  const renderUnitIdentifier = useMemo(() => (
    <Stack direction="row">
      <StyledLabel> Unit Number </StyledLabel>
      <TextField
        fullWidth
        size="small"
        InputProps={{
          sx: { typography: 'body2' },
        }}
        value={newJob.unitIdentifier}
        onChange={handleUpdateField('unitIdentifier')}
      />
    </Stack>
  ), [newJob.unitIdentifier, handleUpdateField]);

  const renderAttachments = useMemo(() => (
    <Stack direction="row">
      <StyledLabel>Attachments</StyledLabel>
      <Attachments jobId={newJob.id} attachments={newJob.attachmenturls} />
    </Stack>
  ), [newJob.id, newJob.attachmenturls]);

  return (
    newJob && members && labels && <Stack
      spacing={3}
      sx={{
        pt: 3,
        pb: 5,
        px: 2.5,
      }}
    >
      {renderName}
      {renderUnitIdentifier}
      {renderPriority}
      {renderLabel}
      {renderDueDate}
      {renderAssignee}
      {renderDescription}
      {renderAttachments}
    </Stack>
  );
}

JobDetails.propTypes = {
  job: PropTypes.object,
  members: PropTypes.object,
  labels: PropTypes.object,
};
