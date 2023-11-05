import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Box, Container, IconButton, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from '../../contexts/auth';
import { getAllInspections } from '../../api/inspections/inspections';
import CreateInspectionDialog from './create-inspection';
import WidgetSummaryComponent from "../../components/widget-summary";

export default function Inspections() {
    const theme = useTheme();
    const [inspections, setInspections] = useState([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingInspection, setEditingInspection] = useState(null);
    const { activeOrganization } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (activeOrganization) {
            fetchInspections();
        }
    }, [activeOrganization]);

    const fetchInspections = async () => {
        try {
            const response = await getAllInspections(activeOrganization);
            setInspections(response || []);
        } catch (error) {
            console.error('Error fetching inspections:', error);
        }
    };

    const handleSaveInspection = (newInspection) => {
        console.log(newInspection);
        setIsCreateDialogOpen(false);
    };

    const handleEdit = (id) => {
        const inspection = inspections.find(i => i.id === id);
        setEditingInspection(inspection);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (id) => {
        console.log('Delete inspection with ID:', id);
        // Handle delete logic here
    };

    const handleNavigateToInspection = (id) => {
        // Navigate to the inspection page
        navigate(`/inspections/${id}`);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 150 },
        { field: 'unit_identifier', headerName: 'Unit Number', width: 200 },
        // ...other columns
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200, // Adjust width as necessary
            renderCell: (params) => (
                <>
                    <IconButton color="primary" onClick={() => handleEdit(params.id)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDelete(params.id)}>
                        <DeleteIcon />
                    </IconButton>
                    <IconButton color="default" onClick={() => handleNavigateToInspection(params.id)}>
                        <VisibilityIcon />
                    </IconButton>
                </>
            ),
        },
    ];

    const handleSaveEdit = async () => {
        try {
            // Assuming updateInspection is an async function that sends the updated data to the server
            // const updated = await updateInspection(editingInspection);
            // if (updated) {
            //     // Assuming the API call returns the updated inspection, you might want to update the state to reflect this
            //     setInspections(inspections.map((insp) => (insp.id === updated.id ? updated : insp)));
            //     setIsEditDialogOpen(false);
            // }
        } catch (error) {
            console.error('Error updating inspection:', error);
        }
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: "20px" }}>
                <Typography variant="h3" sx={{ color: theme.palette.text.primary }}>Inspections</Typography>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setIsCreateDialogOpen(true)}>Add Inspection</Button>
            </Box>
            
            <CreateInspectionDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onSave={handleSaveInspection} />

            <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
                <DialogTitle>Edit Inspection</DialogTitle>
                <DialogContent>
                    <TextField label="Name" value={editingInspection?.name || ''} onChange={e => setEditingInspection({ ...editingInspection, name: e.target.value })} />
                    {/* Add other fields for inspection properties here */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveEdit}>Save</Button>
                </DialogActions>
            </Dialog>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <WidgetSummaryComponent
                        title="Total Inspections"
                        icon={'ant-design:code-sandbox-outlined'}
                        total={inspections.length}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <WidgetSummaryComponent
                        title="Completed Inspections"
                        icon={'ant-design:code-sandbox-outlined'}
                        total={inspections.filter(insp => insp.completedDate).length}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <WidgetSummaryComponent
                        title="Upcoming Inspections Today"
                        icon={'ant-design:code-sandbox-outlined'}
                        total={10}  // Placeholder - you might want to calculate this based on the current date and the `scheduleDate`
                    />
                </Grid>
                <Grid item xs={12}>
                    <DataGrid rows={inspections} columns={columns} pageSize={5} rowsPerPageOptions={[5]} checkboxSelection />
                </Grid>
            </Grid>
        </Container>
    );
}
