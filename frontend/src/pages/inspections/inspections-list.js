import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from '../../contexts/auth';
import { getAllInspections } from '../../api/inspections';
import CreateInspectionDialog from './create-inspection'; // Assuming it's in the same folder

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
        <div style={{ height: 500, width: '100%' }}>
            <Typography variant="h4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Inspections ({inspections.length})
                <div>
                    <IconButton onClick={fetchInspections} aria-label="Refresh">
                        <RefreshIcon />
                    </IconButton>
                    <IconButton onClick={() => setIsDialogOpen(true)} aria-label="Add Inspection">
                        <AddIcon />
                    </IconButton>
                </div>
            </Typography>
            <DataGrid
                rows={inspections}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
            />
            <CreateInspectionDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveInspection}
            />
        </div>
    );
}
