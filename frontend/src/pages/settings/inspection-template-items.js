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
    itemName: '',
    orderIndex: 0, // Treat as an integer
    organizationId: activeOrganization,
    inspectionTemplateID: templateId,
  });

  const [newItemData, setNewItemData] = useState({
    id: '', // Assign a unique ID, e.g., generated on the server
    item: '', // Set the default item name
    orderIndex: 0, // Treat as an integer
    organizationId: activeOrganization,
    inspectionTemplateID: templateId,
  });

  const [openAddDialog, setOpenAddDialog] = useState(false);

  const handleEditClick = (itemId, item, orderIndex, createdAt, inspectionTemplateID) => {
    setEditItemId(itemId);
    setEditedItem({
      id: itemId,
      item,
      orderIndex,
      organizationId: activeOrganization,
      inspectionTemplateID,
    });
  };

  const handleCancelEdit = () => {
    setEditItemId(null);
  };

  const handleSaveEdit = () => {
    // Send a request to update the item using the updateItem function
    updateItem(editedItem)
      .then((response) => {
        // Handle success: You can perform additional actions if needed
        console.log('Item updated successfully:', response);
        setEditItemId(null); // Exit edit mode
      })
      .catch((error) => {
        // Handle errors
        console.error('Error updating inspection template item:', error);
      });
  };

  const handleDeleteItem = (id) => {
    // Send a request to delete the item using the removeItem function
    removeItem(id)
      .then(() => {
        // Handle success: You can perform additional actions if needed
        console.log('Item deleted successfully');
      })
      .catch((error) => {
        // Handle errors
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
    // Send a request to add the new item using the addItem function
    addItem(newItemData)
      .then((response) => {
        // Handle success: You can perform additional actions if needed
        console.log('Item added successfully:', response);
        setOpenAddDialog(false); // Close the dialog
      })
      .catch((error) => {
        // Handle errors
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
                      onChange={(e) =>
                        setEditedItem({ ...editedItem, item: e.target.value })
                      }
                    />
                  ) : (
                    item.item
                  )}
                </TableCell>
                <TableCell>
                  {editItemId === item.id ? (
                    <TextField
                      value={editedItem.orderIndex}
                      variant="outlined"
                      onChange={(e) => {
                        const orderIndex = parseInt(e.target.value, 10);
                        setEditedItem({ ...editedItem, orderIndex });
                      }}
                    />
                  ) : (
                    item.orderIndex
                  )}
                </TableCell>
                <TableCell>{item.createdAt}</TableCell>
                <TableCell>
                  {editItemId === item.id ? (
                    <>
                      <IconButton onClick={handleSaveEdit} aria-label="Save">
                        Save
                      </IconButton>
                      <IconButton onClick={handleCancelEdit} aria-label="Cancel">
                        Cancel
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        onClick={() =>
                          handleEditClick(
                            item?.id,
                            item?.item,
                            item?.orderIndex,
                            item?.createdAt,
                            item?.inspectionTemplateID
                          )
                        }
                        aria-label="Edit"
                      >
                        Edit
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteItem(item.id, item.organizationId)}
                        aria-label="Remove"
                      >
                        Delete
                      </IconButton>
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

      {/* Add Item Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          {/* Form fields for new item data */}
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
              setNewItemData({ ...newItemData, orderIndex });
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleAddDialogSave(newItemData);
            }}
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
