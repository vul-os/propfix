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
} from '@mui/material';

export default function InspectionTemplateItems({ activeOrganization, items, addItem, removeItem, updateItem }) {
  const [editItemId, setEditItemId] = useState(null);
  const [editedItem, setEditedItem] = useState({
    id: '',
    itemName: '',
    orderIndex: '',
    createdAt: '',
    organizationId: activeOrganization,
    inspectionTemplateID: '',
  });

  const handleEditClick = (itemId, item, orderIndex, createdAt, inspectionTemplateID) => {
    setEditItemId(itemId);
    setEditedItem({
      id: itemId,
      item,
      orderIndex,
      createdAt,
      organizationId: activeOrganization,
      inspectionTemplateID, // Set this field as needed
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

  const handleDeleteItem = () => {
    // Send a request to delete the item using the removeItem function
    removeItem(editItemId)
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
    // Create a new item object with default values
    const newItemData = {
      id: '', // Assign a unique ID, e.g., generated on the server
      item: '', // Set the default item name
      orderIndex: '', // Set the default order index
      createdAt: '', // Set the default created date
      inspectionTemplateID: '',
      organizationId: activeOrganization,
    };

    // Send a request to add the new item using the addItem function
    addItem(newItemData)
      .then((response) => {
        // Handle success: You can perform additional actions if needed
        console.log('Item added successfully:', response);
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
                      onChange={(e) =>
                        setEditedItem({ ...editedItem, orderIndex: e.target.value })
                      }
                    />
                  ) : (
                    item.orderIndex
                  )}
                </TableCell>
                <TableCell>
                    {item.createdAt}
                </TableCell>
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
                          handleEditClick(item?.id, item?.item, item?.orderIndex, item?.createdAt, item?.inspectionTemplateID)
                        }
                        aria-label="Edit"
                      >
                        Edit
                      </IconButton>
                      <IconButton onClick={handleDeleteItem} aria-label="Delete">
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
    </div>
  );
}
