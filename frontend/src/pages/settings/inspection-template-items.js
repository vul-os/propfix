import React from 'react';
import { IconButton, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function InspectionTemplateItems({
  templateId,
  items,
  columns,
  createNewItem,
  removeItem,
  updateItem,
}) {
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
            onClick={() => updateItem(item.id, templateId)}
            aria-label="Update"
          >
            Update
          </IconButton>
          <IconButton
            onClick={() => removeItem(item.id)}
            aria-label="Remove"
          >
            Remove
          </IconButton>
        </div>
      ))}
    </div>
  );
}
