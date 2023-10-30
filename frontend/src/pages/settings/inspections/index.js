import React, { useState, useEffect } from 'react';
import { 
  IconButton, Typography, Table, TableHead, TableRow, 
  TableCell, TableBody, TableContainer, Paper, Dialog, 
  DialogTitle, DialogContent, DialogActions, Button, TextField 
} from '@mui/material';
// Corrected Icon imports
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save'; 
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close'; 
import RefreshIcon from '@mui/icons-material/Refresh'; 
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from '../../../contexts/auth';
import { 
  getAllInspectionTemplateGroups, deleteInspectionTemplateGroup, 
  updateInspectionTemplateGroup, createInspectionTemplateGroup 
} from '../../../api/inspections/inspectionTemplateGroups';
import InspectionTemplate from './inspection-template';


export default function InspectionTemplateGroups() {
  const theme = useTheme();
  const [groups, setGroups] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedGroup, setEditedGroup] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { getIdToken, activeOrganization } = useAuthContext();
  const [viewingId, setViewingId] = useState(null);

  useEffect(() => {
    if (activeOrganization) {
        fetchInspectionTemplateGroups();
    }
  }, [activeOrganization]);

  const fetchInspectionTemplateGroups = async () => {
    try {
      const response = await getAllInspectionTemplateGroups(activeOrganization);
      setGroups(response || []);
    } catch (error) {
      console.error('Error fetching inspection template groups:', error);
    }
  };

  const handleSave = async () => {
    try {
      const token = await getIdToken();
      if (isEditing) {
        await updateInspectionTemplateGroup(editedGroup, token);
      } else {
        const eg = {...editedGroup, organizationId: activeOrganization}
        await createInspectionTemplateGroup(eg, token);
      }
      fetchInspectionTemplateGroups();
      handleClose();
    } catch (error) {
      console.error('Error saving inspection template group:', error);
    }
  };

  // Add this new function to handle the editing process
  const handleEdit = (group) => {
    setEditing(group.id);
    setEditedGroup(group); // Set the current group's data to editedGroup
    setIsEditing(true); // Set to editing mode
    setOpenDialog(true); // Open the dialog
  };

  const handleClose = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setEditedGroup({});
  };

  const handleView = (group) => {
    console.log(group.id)
    setEditedGroup(group);   
    setViewingId(group.id);
    setIsEditing(false);
    setOpenDialog(true);     
  };

  if (viewingId) {
    return <InspectionTemplate viewingId={viewingId} />;
  }

  return (
    <div className="inspection-template-groups-page">
      <Typography variant="h4">Inspection Template Groups ({groups.length})</Typography>
      <TableContainer sx={{ marginTop: theme.spacing(2) }} component={Paper}>
        <Table aria-label="inspection template groups table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(group)} aria-label="View">
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleEdit(group)} aria-label="Edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => null} aria-label="Delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <IconButton
        color="primary"
        aria-label="Add Inspection Template Group"
        onClick={() => setOpenDialog(true)}
        style={{
          position: 'fixed',
          bottom: '75px',
          right: '16px',
          backgroundColor: '#fff',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
        }}
      >
        <AddIcon />
      </IconButton>
      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>{isEditing ? 'Edit Group' : 'Add Group'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Group Name"
            value={editedGroup.name || ''}
            onChange={(e) => setEditedGroup({ ...editedGroup, name: e.target.value })}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
