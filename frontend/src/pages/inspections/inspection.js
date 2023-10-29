import React, { useState, useEffect } from 'react';
import { Container, Checkbox, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, Button, Typography, Box } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { getAllInspectionItems } from '../../api/inspectionItems';

function InspectionPage({ inspection }) {
    const [inspectionItems, setInspectionItems] = useState([]);

    useEffect(() => {
        // Fetch inspection items for the given ID when the component mounts or when the inspection prop changes
        if (inspection?.id) {
            fetchInspectionItems(inspection.id);
        }
    }, [inspection.id]);

    const fetchInspectionItems = async (inspectionId) => {
        try {
            const token = await getIdToken();
            const response = await getAllInspectionItems(inspectionId, token);
            setInspections(response?.inspections || []);
        } catch (error) {
            console.error('Error fetching inspections:', error);
        }
    };

    const handleCompletion = () => {
        // TODO: Implement logic to mark inspection as complete and update the backend
    };

    return (
        <Container>
            <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                <Typography variant="h4">{inspection.name}</Typography>
                <Box display="flex" alignItems="center" mt={2}>
                    <ScheduleIcon color="action" />
                    <Typography variant="body1" ml={1}>Scheduled: {new Date(inspection.scheduleDate).toLocaleDateString()}</Typography>
                </Box>
                {inspection.completedDate ? (
                    <Box display="flex" alignItems="center" mt={2}>
                        <EventAvailableIcon color="action" />
                        <Typography variant="body1" ml={1}>Completed: {new Date(inspection.completedDate).toLocaleDateString()}</Typography>
                    </Box>
                ) : (
                    <Button variant="contained" color="primary" onClick={handleCompletion} mt={2}>
                        Complete
                    </Button>
                )}
            </Box>

            <List>
                {inspectionItems.map((item, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={item.id} />
                        <ListItemSecondaryAction>
                            <Checkbox
                                checked={item.checked}
                                onChange={(event) => handleCheckedChange(index, event)}
                            />
                            <TextField
                                label="Comments"
                                value={item.comments}
                                onChange={(event) => handleCommentChange(index, event)}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}

export default InspectionPage;
