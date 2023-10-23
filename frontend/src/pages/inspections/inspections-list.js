import React, { useState, useEffect } from 'react';
import { Grid, Box, Container } from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from '../../contexts/auth';
import { getAllInspections } from '../../api/inspections';
import CreateInspectionDialog from './create-inspection'; // Assuming it's in the same folder
import WidgetSummaryComponent from "../../components/widget-summary"

export default function Inspections() {
    const theme = useTheme();
    const [inspections, setInspections] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { getIdToken, activeOrganization } = useAuthContext();

    useEffect(() => {
        if (activeOrganization) {
            fetchInspections();
        }
    }, [activeOrganization]);

    const fetchInspections = async () => {
        try {
            const token = await getIdToken();
            const response = await getAllInspections(activeOrganization, token);
            setInspections(response?.inspections || []);
        } catch (error) {
            console.error('Error fetching inspections:', error);
        }
    };

    const handleSaveInspection = (newInspection) => {
        // Handle saving the new inspection (e.g., API call)
        // For now, just log it
        console.log(newInspection);
        setIsDialogOpen(false);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 150 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'scheduleDate', headerName: 'Schedule Date', width: 250 },
        { field: 'completedDate', headerName: 'Completed Date', width: 250 },
        { field: 'assigneeIds', headerName: 'Assignee IDs', width: 250 },
    ];

    return (
        <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: "20px" }}>
                <Box sx={{ display: 'flex', alignItems: 'start', flexDirection: 'column' }}>
                    <Typography variant="h3" sx={{ color: theme.palette.text.primary }}>
                        Inspections
                    </Typography>

                </Box>
            </Box>
            <CreateInspectionDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveInspection}
            />
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <WidgetSummaryComponent
                        title="Total Inspections"
                        icon={'ant-design:code-sandbox-outlined'}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <WidgetSummaryComponent
                        title="Completed Inspections"
                        icon={'ant-design:code-sandbox-outlined'}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <WidgetSummaryComponent
                        title="Upcoming Inspections Today"
                        icon={'ant-design:code-sandbox-outlined'}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    <DataGrid
                        rows={inspections}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        checkboxSelection
                    />
                </Grid>         
            </Grid>
        </Container>
    );
}
