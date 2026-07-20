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
import InputName from '../../../components/input-name';
import { useAuthContext } from '../../../contexts/auth';
import { useBoardContext } from '../../../contexts/board';
import {
  getAllInspectionTemplateItems,
  createInspectionTemplateItem,
  updateInspectionTemplateItem,
  deleteInspectionTemplateItem,
} from '../../../api/inspections/inspectionTemplateItems';
import { getAllInspectionTemplates, createInspectionTemplate, deleteInspectionTemplate, updateInspectionTemplate } from '../../../api/inspections/inspectionTemplates';

import InspectionTemplateItems from './inspection-template-items';

export default function InspectionTemplate({viewingId}) {
  const [templates, setTemplates] = useState([]);
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '' });
  const [newItem, setNewItem] = useState({});
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null); // Add a state for editing template
  const [editedTemplate, setEditedTemplate] = useState({});
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);
  const [editedTemplateName, setEditedTemplateName] = useState(''); // New state for edited template name


  const { activeOrganization } = useAuthContext();

  const fetchTemplates = useCallback(async () => {
    try {
      if (viewingId) {
        const response = await getAllInspectionTemplates(viewingId);
        console.log(response);
        setTemplates(response || []);
      }
    } catch (error) {
      console.error('Error fetching inspection templates:', error);
    }
  }, [viewingId]);

  const fetchItems = useCallback(async () => {
    try {
      if (viewingId) {
        const response = await getAllInspectionTemplateItems(viewingId);
        console.log(response);
        setItems(response || []);
      }
    } catch (error) {
      console.error('Error fetching inspection template items:', error);
    }
  }, [viewingId]);

  useEffect(() => {
    if (viewingId) {
      fetchTemplates();
      fetchItems();
    }
  }, [viewingId, fetchTemplates, fetchItems]);

  const groupItemsByTemplate = () => {
    const groupedItems = {};
    templates.forEach((template) => {
      const templateId = template.id;
      groupedItems[templateId] = items?.filter((item) => item.inspection_template_id === templateId);
    });
    return groupedItems;
  };

  const handleAddNewRow = (templateId) => {
    setNewItem({
      order_index: 0,
      item: '',
      inspection_template_id: templateId,
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
        organization_id: activeOrganization,
      };
      await createInspectionTemplateItem(itemToCreate);
      fetchItems();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating a new inspection template item:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await deleteInspectionTemplateItem(itemId);
      fetchTemplates();
      fetchItems();
    } catch (error) {
      console.error('Error removing an inspection template item:', error);
    }
  };

  const handleAddItem = async (item) => {
    try {
      await createInspectionTemplateItem(item);
      fetchTemplates();
      fetchItems();
    } catch (error) {
      console.error('Error adding an inspection template item:', error);
    }
  };

  const handleUpdateItem = async (updatedData) => {
    try {
      await updateInspectionTemplateItem(updatedData);
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
        organization_id: activeOrganization,
      };
      await createInspectionTemplate(templateToCreate);
      setOpenDialog(false);
      fetchTemplates();
      fetchItems();
    } catch (error) {
      console.error('Error creating a new inspection template:', error);
    }
  };
  const handleEditTemplateName = (templateId, currentName) => {
    setEditingTemplateId(templateId);
    setEditedTemplateName(currentName);
  };

  const handleDeleteTemplate = async (template) => {
    try {
      console.log(template);
      await deleteInspectionTemplate(template);
      setTemplates((prevTemplates) => prevTemplates.filter((t) => t.id !== template));
      fetchTemplates();
      fetchItems();
    } catch (error) {
      console.error('Error deleting an inspection template:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateInspectionTemplate(editedTemplate);
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
          <InputName
            value={editedTemplateName}
            onChange={(newName) => setEditedTemplateName(newName)}
            onSave={() => handleSaveEdit()}
          />
        ) : (
          <span
            onDoubleClick={() => handleEditTemplateName(template.id, template.name)}
          >
            {template.name}
          </span>
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
