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
import AddIcon from '@mui/icons-material/Add'; // Import the Add icon
import { DataGrid } from '@mui/x-data-grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuthContext } from '../../contexts/auth';
import { useBoardContext } from '../../contexts/board';
import {
  getAllInspectionTemplateItems,
  createInspectionTemplateItem,
  updateInspectionTemplateItem,
  deleteInspectionTemplateItem,
} from '../../api/inspectionTemplateItems';
import { getAllInspectionTemplates, createInspectionTemplate } from '../../api/inspectionTemplates';

import InspectionTemplateItems from './inspection-template-items';

export default function InspectionTemplate() {
  const [templates, setTemplates] = useState([]);
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '' }); // Provide an initial state
  const [newItem, setNewItem] = useState({});
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const { getIdToken, activeOrganization } = useAuthContext();
  const { board } = useBoardContext();

  const fetchTemplates = useCallback(async () => {
    try {
      const token = await getIdToken();
      const response = await getAllInspectionTemplates(activeOrganization, token);
      console.log(response);
      setTemplates(response.templates || []);
    } catch (error) {
      console.error('Error fetching inspection templates:', error);
    }
  }, [getIdToken, activeOrganization]);

  const fetchItems = useCallback(async () => {
    try {
      const token = await getIdToken();
      const response = await getAllInspectionTemplateItems(activeOrganization, token);
      console.log(response);
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

  const handleRemoveItem = async (itemId) => {
    try {
      const token = await getIdToken();
      await deleteInspectionTemplateItem(itemId, token);
      // If the API call was successful, you can update the state or re-fetch data
      // Example: fetchItems();
    } catch (error) {
      console.error('Error removing an inspection template item:', error);
    }
  };

  const handleUpdateItem = async (updatedData) => {
    try {
      console.log(updatedData)
      const token = await getIdToken();
      await updateInspectionTemplateItem(updatedData, token);
      // If the API call was successful, you can update the state or re-fetch data
      // Example: fetchItems();
    } catch (error) {
      console.error('Error updating an inspection template item:', error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const templateToCreate = {
        ...newTemplate,
        organizationId: activeOrganization,
      };
      const token = await getIdToken();
      await createInspectionTemplate(templateToCreate, token);
      setOpenDialog(false);
      fetchTemplates();
      fetchItems();
    } catch (error) {
      console.error('Error creating a new inspection template:', error);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4">Inspection Templates</Typography>
        <IconButton onClick={fetchItems} aria-label="Refresh">
          <RefreshIcon />
        </IconButton>
        <IconButton onClick={() => setOpenDialog(true)} aria-label="Add">
          <AddIcon />
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
              activeOrganization={activeOrganization}
              templateId={template.id}
              items={groupItemsByTemplate()[template.id] || []}
              removeItem={handleRemoveItem}
              updateItem={handleUpdateItem}
            />
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Inspection Template</DialogTitle>
        <DialogContent>
          <TextField
            label="Template Name"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateTemplate} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
