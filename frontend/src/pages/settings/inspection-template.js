import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuthContext } from '../../contexts/auth';
import { getAllInspectionTemplateItems, deleteInspectionTemplateItem, createInspectionTemplateItem } from '../../api/inspectionTemplateItems';
import { useBoardContext } from '../../contexts/board';

export default function InspectionTemplate() {
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { board, setBoard, boardLoading, jobs, setJobs } = useBoardContext();
  const { getIdToken, activeOrganization, organizations } = useAuthContext();
  const iconButtonStyle = { color: '#637381' };

  const fetchItems = useCallback(async () => {
    try {
      const token = await getIdToken();
      const response = await getAllInspectionTemplateItems(activeOrganization, token);
      console.log(response);
      setItems(response.items || []);
    } catch (error) {
      console.error('Error fetching inspection template items:', error);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (activeOrganization) {
      fetchItems();
    }
  }, [activeOrganization]);

  const handleRefreshItems = async () => {
    await fetchItems();
  };

  const handleAddNewRow = () => {
    setOpenDialog(true);
  };

  const initialNewItem = {
    orderIndex: 0,
    item: '',
    areaID: '98d9cbff-77f3-4431-aee0-0284e916a155',
    inspectionTemplateID: '98d9cbff-77f3-4431-aee0-0284e916a155',
    createdAt: new Date().toISOString(),
  };

  const [newItem, setNewItem] = useState(initialNewItem);

  const handleCloseDialog = () => {
    setNewItem(initialNewItem);
    setOpenDialog(false);
  };

  const handleCreateNewItem = async () => {
    try {
      const it = {...newItem, 'organizationId': activeOrganization}
      console.log(newItem, it)
      const token = await getIdToken();
      await createInspectionTemplateItem(it, token);
      await fetchItems();
      handleCloseDialog();
    } catch (error) {
      console.error('Error creating a new inspection template item:', error);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'orderIndex', headerName: 'Order Index', flex: 1 },
    { field: 'item', headerName: 'Item', flex: 1 },
    { field: 'areaID', headerName: 'Area ID', flex: 1 },
    { field: 'inspectionTemplateID', headerName: 'Template ID', flex: 1 },
    { field: 'createdAt', headerName: 'Created At', flex: 1 },
  ];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4">Data Grid</Typography>
        <IconButton onClick={handleRefreshItems} aria-label="Refresh">
          <RefreshIcon />
        </IconButton>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddNewRow} aria-label="AddNewRow">
        
          Add New Row
        </Button>
      </div>

      <DataGrid
        rows={items}
        columns={columns}
        autoHeight
      />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Row</DialogTitle>
        <DialogContent>
          <TextField
            label="Order Index"
            type="number"
            value={newItem.orderIndex}
            onChange={(e) => setNewItem({ ...newItem, orderIndex: e.target.value })}
          />
          <TextField
            label="Item"
            value={newItem.item}
            onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
          />
          <TextField
            label="Area ID"
            value={newItem.areaID}
            onChange={(e) => setNewItem({ ...newItem, areaID: e.target.value })}
          />
          <TextField
            label="Template ID"
            value={newItem.inspectionTemplateID}
            onChange={(e) => setNewItem({ ...newItem, inspectionTemplateID: e.target.value })}
          />
          <TextField
            label="Created At"
            type="datetime-local"
            value={newItem.createdAt}
            onChange={(e) => setNewItem({ ...newItem, createdAt: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateNewItem} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
