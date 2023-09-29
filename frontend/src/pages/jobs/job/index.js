import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { styled, alpha } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
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

export default function JobDetails({ job, setJob, members, labels, files, handleDrop, handleRemoveFile,  }) {
  const contacts = useBoolean();
  const assignees = useMemo(() => job?.assigneeIds?.map((jobId) => members && members[jobId]), [job?.assigneeIds, members]);
  const reporter = useMemo(() => members && job?.reporterId  &&  members[job?.reporterId], [job?.reporterId, members])

  useEffect(() => {
  }, [job?.id, job?.assigneeIds])

  const handleUpdateField = useCallback((field) => {
    return (event) => {
      const value = event.target ? event.target.value : event;
      setJob(prevJob => ({
        ...prevJob,
        [field]: value,
      }));
    };
  }, []);

  const handleToggleAssignee = useCallback((member) => {
    setJob((prevJob) => {
        // Using a fallback for null/undefined assigneeIds
        const currentAssignees = prevJob.assigneeIds || [];

        const isAssigned = currentAssignees.some(personId => personId === member.id);
        
        // If the member is already assigned, filter them out, otherwise add them
        const updatedAssignees = isAssigned 
            ? currentAssignees.filter(personId => personId !== member.id)
            : [...currentAssignees, member.id];

        return {
            ...prevJob,
            assigneeIds: updatedAssignees,
        };
    });
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
        selectedLabels={job?.labelIds ? job.labelIds.map(id => labels[id]) : []}
        setSelectedLabels={(newSelectedLabels) => {
          const newSelectedLabelIds = newSelectedLabels.map(label => label.id); // Assuming the label object has an 'id' field
          setJob(prevJob => ({
            ...prevJob,
            labelIds: newSelectedLabelIds,
          }));
        }}
        textFieldProps={{size: "small"}}
      />
    </Stack>
  ), [job.labelIds, setJob, labels]);
  
  const renderReporter = useMemo(() => (
    <Stack direction="row">
      <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Reporter</StyledLabel>
      <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
        {reporter && 
          <Avatar key={reporter?.id} alt={reporter?.displayName} src={reporter?.photoUrl} />
        }
      </Stack>
    </Stack>
  ), [assignees]);

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
          handleAssignToggle={handleToggleAssignee}
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
      <Attachments files={files} handleDrop={handleDrop} handleRemoveFile={handleRemoveFile} />
    </Stack>
  ), [job.id, files]);

  const renderRentPaid = useMemo(() => (
    <Stack direction="row" alignItems="center">
      <StyledLabel>Rent Paid</StyledLabel>
      <Switch />
    </Stack>
  ), [job.id, files]);

  return (
    job && members && labels && <Stack
      spacing={3}
      sx={{
        pt: 0,
        pb: 5,
        px: 2.5,
      }}
    >
      {renderName}
      {renderReporter}
      {renderUnitIdentifier}
      {renderRentPaid}
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
