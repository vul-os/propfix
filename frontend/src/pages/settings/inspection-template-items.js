import React, { useState } from 'react';
import { IconButton, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function InspectionTemplateItems({
  templateId,
  items,
  columns,
  createNewItem,
  deleteInspectionTemplateItem,
  updateInspectionTemplateItem,
  idToken,
}) {
  const [updatedItemData, setUpdatedItemData] = useState({}); // Define the state for updated item data

  const handleUpdateItem = async (itemId) => {
    try {
      // Call the updateInspectionTemplateItem function with the item ID, updatedItemData, and idToken
      const updatedItem = await updateInspectionTemplateItem(itemId, updatedItemData, idToken);
      // Handle the updated item as needed, e.g., update the local state.
    } catch (error) {
      console.error('Error updating inspection template item:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      // Call the deleteInspectionTemplateItem function with the item ID and idToken
      await deleteInspectionTemplateItem(itemId, idToken);
      // You may also update the local state to remove the deleted item.
      // For example, you can use a setState function to update the 'items' array.
    } catch (error) {
      console.error('Error deleting inspection template item:', error);
    }
  };

  return (
    <div>
      <DataGrid rows={items} columns={columns} autoHeight />
      <Button
        variant="contained"
        color="primary"
        onClick={() => createNewItem(templateId)}
      >
        Add New Row
      </Button>
      {items.map((item) => (
        <div key={item.id}>
          <IconButton
            onClick={() => handleUpdateItem(item.id)}
            aria-label="Update"
          >
            Update
          </IconButton>
          <IconButton
            onClick={() => handleRemoveItem(item.id)}
            aria-label="Remove"
          >
            Remove
          </IconButton>
        </div>
      ))}
    </div>
  );
}
