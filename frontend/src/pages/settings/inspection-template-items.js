import React, { useState, useEffect } from 'react';
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
import { useAuthContext } from '../../contexts/auth';

import {
  createInspectionTemplateItem,
  deleteInspectionTemplateItem,
  updateInspectionTemplateItem,
  getAllInspectionTemplateItems,
} from '../../api/inspectionTemplateItems';

export default function InspectionTemplateItems() {
  const { getIdToken, activeOrganization } = useAuthContext();
  const [items, setItems] = useState([]);
  const [editItemId, setEditItemId] = useState(null);
  const [newItemData, setNewItemData] = useState({
    itemName: '', // Initialize with default data for a new item
    orderIndex: '',
    createdAt: '',
  });

  const fetchItems = async () => {
    try {
      const token = await getIdToken();
      const result = await getAllInspectionTemplateItems(activeOrganization, token);
      setItems(result.items);
    } catch (error) {
      console.error('Error fetching inspection template items:', error);
    }
  };

  useEffect(() => {
    if (activeOrganization) {
      fetchItems();
    }
  }, [activeOrganization]);

  const handleEditClick = (itemId) => {
    setEditItemId(itemId);
  };

  const handleCancelEdit = () => {
    setEditItemId(null);
  };

  const handleSaveEdit = async (itemId, updatedData) => {
    try {
      const token = await getIdToken();
      await updateInspectionTemplateItem(itemId, updatedData, token);
      setEditItemId(null);
      fetchItems();
    } catch (error) {
      console.error('Error updating inspection template item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const token = await getIdToken();
      await deleteInspectionTemplateItem(itemId, token);
      fetchItems();
    } catch (error) {
      console.error('Error deleting inspection template item:', error);
    }
  };

  const handleAddItem = async () => {
    try {
      const token = await getIdToken();
      await createInspectionTemplateItem(newItemData, token);
      setNewItemData({
        itemName: '',
        orderIndex: '',
        createdAt: '',
      });
      fetchItems();
    } catch (error) {
      console.error('Error creating inspection template item:', error);
    }
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
                      defaultValue={item.itemName}
                      variant="outlined"
                      onChange={(e) => {
                        const updatedValue = e.target.value;
                        setNewItemData((prevData) => ({
                          ...prevData,
                          itemName: updatedValue,
                        }));
                      }}
                    />
                  ) : (
                    item.itemName
                  )}
                </TableCell>
                <TableCell>
                  {editItemId === item.id ? (
                    <TextField
                      defaultValue={item.orderIndex}
                      variant="outlined"
                      onChange={(e) => {
                        const updatedValue = e.target.value;
                        setNewItemData((prevData) => ({
                          ...prevData,
                          orderIndex: updatedValue,
                        }));
                      }}
                    />
                  ) : (
                    item.orderIndex
                  )}
                </TableCell>
                <TableCell>
                  {editItemId === item.id ? (
                    <TextField
                      defaultValue={item.createdAt}
                      variant="outlined"
                      onChange={(e) => {
                        const updatedValue = e.target.value;
                        setNewItemData((prevData) => ({
                          ...prevData,
                          createdAt: updatedValue,
                        }));
                      }}
                    />
                  ) : (
                    item.createdAt
                  )}
                </TableCell>
                <TableCell>
                  {editItemId === item.id ? (
                    <>
                      <IconButton
                        onClick={() =>
                          handleSaveEdit(item.id, {
                            itemName: newItemData.itemName,
                            orderIndex: newItemData.orderIndex,
                            createdAt: newItemData.createdAt,
                          })
                        }
                        aria-label="Save"
                      >
                        Save
                      </IconButton>
                      <IconButton
                        onClick={handleCancelEdit}
                        aria-label="Cancel"
                      >
                        Cancel
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        onClick={() => handleEditClick(item.id)}
                        aria-label="Edit"
                      >
                        Edit
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteItem(item.id)}
                        aria-label="Delete"
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
    </div>
  );
}
