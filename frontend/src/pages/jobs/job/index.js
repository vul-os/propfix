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
import InputName from '../../../components/input-name';
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

export default function JobDetails({ job, setJob, members, labels }) {
  const contacts = useBoolean();
  const assignees = useMemo(() => job?.assigneeIds?.map((jobId) => members && members[jobId]), [job?.assigneeIds, members]);

  console.log("yooooooooooo", members, labels, job?.labels?.map((id) => labels[id]))
  const handleUpdateField = useCallback((field) => {
    return (event) => {
      const value = event.target ? event.target.value : event;
      setJob(prevJob => ({
        ...prevJob,
        [field]: value,
      }));
    };
  }, []);

  const renderName = useMemo(() => (
    <InputName
      placeholder="Task name"
      value={job.name}
      onChange={handleUpdateField('name')}
    />
  ), [job.name, handleUpdateField]);

  const renderPriority = useMemo(() => (
    <Stack direction="row" alignItems="center">
      <StyledLabel>Priority</StyledLabel>
      <Priority priority={job?.priority?.toLowerCase()} onChangePriority={handleUpdateField('priority')} />
    </Stack>
  ), [job.priority, handleUpdateField]);

  const renderLabel = useMemo(() => (
    <Stack direction="row">
      <StyledLabel sx={{ height: 24, lineHeight: '24px' }}>Labels</StyledLabel>
      <LabelAutocomplete 
        labels={labels ? Object.values(labels) : []}
        selectedLabels={job?.labels ? job.labels.map(id => labels[id]) : []}
        setSelectedLabels={(newSelectedLabels) => {
          const newSelectedLabelIds = newSelectedLabels.map(label => label.id); // Assuming the label object has an 'id' field
          setJob(prevJob => ({
            ...prevJob,
            labels: newSelectedLabelIds,
          }));
        }}
        textFieldProps={{size: "small"}}
      />
    </Stack>
  ), [job.labels, setJob, labels]);
  
  
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
        value={job?.dueDate && dayjs.utc(job.dueDate).toDate()}
        onChange={ (newDD) => {
          setJob(prevJob => ({
            ...prevJob,
            dueDate: newDD,
          }));
        }}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </Stack>
  ), [job.dueDate, handleUpdateField]);

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
        value={job.description}
        onChange={handleUpdateField('description')}
      />
    </Stack>
  ), [job.description, handleUpdateField]);

  const renderUnitIdentifier = useMemo(() => (
    <Stack direction="row">
      <StyledLabel> Unit Number </StyledLabel>
      <TextField
        fullWidth
        size="small"
        InputProps={{
          sx: { typography: 'body2' },
        }}
        value={job.unitIdentifier}
        onChange={handleUpdateField('unitIdentifier')}
      />
    </Stack>
  ), [job.unitIdentifier, handleUpdateField]);

  const renderAttachments = useMemo(() => (
    <Stack direction="row">
      <StyledLabel>Attachments</StyledLabel>
      <Attachments jobId={job.id} attachments={job.attachmenturls} />
    </Stack>
  ), [job.id, job.attachmenturls]);

  return (
    job && members && labels && <Stack
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
