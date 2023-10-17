// CreateInspectionDialog.js

import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function CreateInspectionDialog({ isOpen, onClose, onSave }) {
    const [inspectionData, setInspectionData] = useState({
        name: '',
        scheduleDate: dayjs(),
        assignees: ''
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setInspectionData((prev) => ({ ...prev, [id]: value }));
    };

    const handleDateChange = (date) => {
        if (date) {
            setInspectionData((prev) => ({ ...prev, scheduleDate: date }));
        }
    };

    const handleSave = () => {
        onSave(inspectionData);
        setInspectionData({
            name: '',
            scheduleDate: dayjs(),
            assignees: ''
        }); // Reset form after saving
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Add Inspection</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Inspection Name"
                    type="text"
                    value={inspectionData.name}
                    onChange={handleInputChange}
                    fullWidth
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Schedule Date"
                        value={inspectionData.scheduleDate}
                        onChange={handleDateChange}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                </LocalizationProvider>
                <TextField
                    margin="dense"
                    id="assignees"
                    label="Assignees (comma separated)"
                    type="text"
                    value={inspectionData.assignees}
                    onChange={handleInputChange}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
