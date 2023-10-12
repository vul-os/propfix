import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid } from '@mui/x-data-grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuthContext } from '../../contexts/auth';
import { useBoardContext } from '../../contexts/board';
import { getAllInspectionTemplateItems, createInspectionTemplateItem } from '../../api/inspectionTemplateItems';
import { getAllInspectionTemplates } from '../../api/inspectionTemplates';

import InspectionTemplateItems from './inspection-template-items';

export default function InspectionTemplate() {
  const [templates, setTemplates] = useState([]);
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const { getIdToken, activeOrganization } = useAuthContext();
  const { board } = useBoardContext();

  const fetchTemplates = useCallback(async () => {
    try {
      const token = await getIdToken();
      const response = await getAllInspectionTemplates(activeOrganization, token);
      console.log(response)
      setTemplates(response.templates || []);
    } catch (error) {
      console.error('Error fetching inspection templates:', error);
    }
  }, [getIdToken, activeOrganization]);

  const fetchItems = useCallback(async () => {
    try {
      const token = await getIdToken();
      const response = await getAllInspectionTemplateItems(activeOrganization, token);
      console.log(response)
      setItems(response.items || []);
    } catch (error) {
      console.error('Error fetching inspection template items:', error);
    }
  }, [getIdToken, activeOrganization]);

  useEffect(() => {
    if (activeOrganization) {
      fetchTemplates();
      fetchItems();
    }
  }, [activeOrganization, fetchTemplates, fetchItems]);

  const groupItemsByTemplate = () => {
    const groupedItems = {};
  
    // Map the templates to their respective items
    templates.forEach((template) => {
      const templateId = template.id;
      groupedItems[templateId] = items.filter((item) => item.inspectionTemplateID === templateId);
    });
  
    return groupedItems;
  };
  

  const handleAddNewRow = (templateId) => {
    setNewItem({
      orderIndex: 0,
      item: '',
      inspectionTemplateID: templateId,
      createdAt: new Date().toISOString(),
    });
    setSelectedTemplateId(templateId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreateNewItem = async () => {
    try {
      const itemToCreate = {
        ...newItem,
        organizationId: activeOrganization,
      };
      const token = await getIdToken();
      await createInspectionTemplateItem(itemToCreate, token);
      fetchItems();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating a new inspection template item:', error);
    }
  };

  const handleRemoveItem = (itemId) => {
    try {
      // Implement item removal logic here
      // You may call an API or update the state directly
    } catch (error) {
      console.error('Error removing an inspection template item:', error);
    }
  };

  const handleUpdateItem = (itemId, templateId) => {
    try {
      // Implement item update logic here
      // You may call an API or update the state directly
    } catch (error) {
      console.error('Error updating an inspection template item:', error);
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
        <Typography variant="h4">Inspection Templates</Typography>
        <IconButton onClick={fetchItems} aria-label="Refresh">
          <RefreshIcon />
        </IconButton>
      </div>

      {templates.map((template) => (
        <Accordion key={template.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{template.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Template ID: {template.id}</Typography>
            <InspectionTemplateItems
              templateId={template.id}
              items={groupItemsByTemplate()[template.id] || []}
              columns={columns}
              removeItem={handleRemoveItem}
              updateItem={handleUpdateItem}
            />
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Row</DialogTitle>
        <DialogContent>
          <TextField
            label="Order Index"
            type="number"
            value={newItem.orderIndex}
            onChange={(e) =>
              setNewItem({ ...newItem, orderIndex: e.target.value })
            }
          />
          <TextField
            label="Item"
            value={newItem.item}
            onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
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
