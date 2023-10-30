import React, { useState } from 'react';
import {
  IconButton,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

export default function InspectionTemplateItems({
  templateId,
  activeOrganization,
  items,
  addItem,
  removeItem,
  updateItem,
}) {
  const [editItemId, setEditItemId] = useState(null);
  const [editedItem, setEditedItem] = useState({
    id: '',
    item: '',
    order_index: 0,
    inspection_template_id: templateId,
  });

  const [newItemData, setNewItemData] = useState({
    item: '',
    order_index: 0,
    inspection_template_id: templateId,
  });

  const [openAddDialog, setOpenAddDialog] = useState(false);

  const handleEditClick = (itemId, item, orderIndex, inspectionTemplateID) => {
    setEditItemId(itemId);
    setEditedItem({
      id: itemId,
      item,
      order_index: orderIndex,
      inspection_template_id: inspectionTemplateID,
    });
  };

  const handleCancelEdit = () => {
    setEditItemId(null);
  };

  const handleSaveEdit = () => {
    updateItem(editedItem)
      .then((response) => {
        console.log('Item updated successfully:', response);
        setEditItemId(null);
      })
      .catch((error) => {
        console.error('Error updating inspection template item:', error);
      });
  };

  const handleDeleteItem = (id) => {
    removeItem(id)
      .then(() => {
        console.log('Item deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting inspection template item:', error);
      });
  };

  const handleAddItem = () => {
    setOpenAddDialog(true);
  };

  const handleAddDialogClose = () => {
    setOpenAddDialog(false);
  };

  const handleAddDialogSave = (newItemData) => {
    addItem(newItemData)
      .then((response) => {
        console.log('Item added successfully:', response);
        setOpenAddDialog(false);
      })
      .catch((error) => {
        console.error('Error adding inspection template item:', error);
      });
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Order Index</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {editItemId === item.id ? (
                    <TextField
                      value={editedItem.item}
                      variant="outlined"
                      onChange={(e) => setEditedItem({ ...editedItem, item: e.target.value })}
                    />
                  ) : (
                    item.item
                  )}
                </TableCell>
                <TableCell>
                  {editItemId === item.id ? (
                    <TextField
                      value={editedItem.order_index}
                      variant="outlined"
                      onChange={(e) => {
                        const orderIndex = parseInt(e.target.value, 10);
                        setEditedItem({ ...editedItem, order_index: orderIndex  });
                      }}
                    />
                  ) : (
                    item.order_index
                  )}
                </TableCell>
                <TableCell>{item.created_at}</TableCell>
                <TableCell>
                  {editItemId === item.id ? (
                    <>
                      <IconButton onClick={handleSaveEdit} aria-label="Save">Save</IconButton>
                      <IconButton onClick={handleCancelEdit} aria-label="Cancel">Cancel</IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        onClick={() => handleEditClick(item.id, item.item, item.order_index, item.inspection_template_id)}
                        aria-label="Edit"
                      >Edit</IconButton>
                      <IconButton onClick={() => handleDeleteItem(item.id)} aria-label="Remove">Delete</IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" color="primary" onClick={handleAddItem}>
        Add New Row
      </Button>
      <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Name"
            variant="outlined"
            fullWidth
            value={newItemData.item}
            onChange={(e) => setNewItemData({ ...newItemData, item: e.target.value })}
          />
          <TextField
            label="Order Index"
            variant="outlined"
            fullWidth
            value={newItemData.orderIndex}
            onChange={(e) => {
              const orderIndex = parseInt(e.target.value, 10);
              setNewItemData({ ...newItemData, order_index: orderIndex });
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose} color="primary">Cancel</Button>
          <Button onClick={() => handleAddDialogSave(newItemData)} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
