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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete'; // Import the Delete icon
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
import { getAllInspectionTemplates, createInspectionTemplate, deleteInspectionTemplate, updateInspectionTemplate } from '../../api/inspectionTemplates';

import InspectionTemplateItems from './inspection-template-items';

export default function InspectionTemplate() {
  const [templates, setTemplates] = useState([]);
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '' });
  const [newItem, setNewItem] = useState({});
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null); // Add a state for editing template
  const [editedTemplate, setEditedTemplate] = useState({});
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);

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
    setDeleteTemplateId(null); // Reset deleteTemplateId
    setEditedTemplate({});
    setEditingTemplateId(null);
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
      fetchTemplates();
      fetchItems();
    } catch (error) {
      console.error('Error removing an inspection template item:', error);
    }
  };

  const handleAddItem = async (item) => {
    try {
      const token = await getIdToken();
      await createInspectionTemplateItem(item, token);
      fetchTemplates();
      fetchItems();
    } catch (error) {
      console.error('Error adding an inspection template item:', error);
    }
  };

  const handleUpdateItem = async (updatedData) => {
    try {
      const token = await getIdToken();
      await updateInspectionTemplateItem(updatedData, token);
      fetchTemplates();
      fetchItems();
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

  const handleDeleteTemplate = async (template) => {
    try {
      console.log(template);
      const token = await getIdToken();
      await deleteInspectionTemplate(template, token);
      setTemplates((prevTemplates) => prevTemplates.filter((t) => t.id !== template));
      fetchTemplates();
      fetchItems();
    } catch (error) {
      console.error('Error deleting an inspection template:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = await getIdToken();
      await updateInspectionTemplate(editedTemplate, token);
      setEditingTemplateId(null);
      setEditedTemplate({});
      setOpenDialog(false);
      fetchTemplates();
      fetchItems();
    } catch (error) {
      console.error('Error saving edited inspection template:', error);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4">Inspection Templates</Typography>
        <IconButton onClick={fetchItems} aria-label="Refresh">
          <RefreshIcon />
        </IconButton>
        <IconButton
          onClick={() => {
            // Set the name of the new template as empty string initially
            setNewTemplate({ name: '' });
            setEditingTemplateId(null);
            setOpenDialog(true);
          }}
          aria-label="Add"
        >
          <AddIcon />
        </IconButton>
      </div>

      {templates.map((template) => (
        <Accordion key={template.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              {editingTemplateId === template.id ? (
                <TextField
                  label="Template Name"
                  value={editedTemplate.name}
                  onChange={(e) =>
                    setEditedTemplate({ ...editedTemplate, name: e.target.value })
                  }
                  fullWidth
                  margin="dense"
                />
              ) : (
                // Display the template name if not in editing mode
                template.name
              )}
            </Typography>
            <IconButton
              onClick={() => {
                setDeleteTemplateId(template.id);
                setOpenDialog(true);
              }}
              aria-label="Delete"
            >
              <DeleteIcon />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Template ID: {template.id}</Typography>
            <InspectionTemplateItems
              activeOrganization={activeOrganization}
              templateId={template.id}
              items={groupItemsByTemplate()[template.id] || []}
              removeItem={handleRemoveItem}
              updateItem={handleUpdateItem}
              addItem={handleAddItem}
            />
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {deleteTemplateId
            ? 'Delete Inspection Template'
            : editingTemplateId
            ? 'Edit Inspection Template'
            : 'Add New Inspection Template'}
        </DialogTitle>
        <DialogContent>
          {deleteTemplateId ? (
            <Typography>
              Are you sure you want to delete this template?
            </Typography>
          ) : (
            <TextField
              label="Template Name"
              value={newTemplate.name}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, name: e.target.value })
              }
              fullWidth
              margin="dense"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          {deleteTemplateId ? (
            <Button onClick={() => handleDeleteTemplate(deleteTemplateId)} color="primary">
              Delete
            </Button>
          ) : (
            <>
              {editingTemplateId ? (
                <Button onClick={handleSaveEdit} color="primary">
                  Save
                </Button>
              ) : (
                <Button onClick={handleCreateTemplate} color="primary">
                  Save
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
