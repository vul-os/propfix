import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Checkbox, TextField, List, ListItem, ListItemText,
  Typography, Box, Button, FormControlLabel, ListSubheader
} from '@mui/material';

import { getAllInspection } from '../../api/inspections/inspectionItems';

function InspectionListItem({ item, onCheckedChange, onCommentChange }) {
    const [showComment, setShowComment] = useState(false);
  
    return (
      <ListItem divider sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
          <ListItemText 
            primary={item.item} 
            secondary={item.id} 
            sx={{ mr: 2, cursor: 'pointer' }} 
            onClick={() => setShowComment(!showComment)} // Toggle comment on click
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={item.checked}
                onChange={(e) => onCheckedChange(item.id, e.target.checked)}
              />
            }
            label="Checked"
          />
        </Box>
        {showComment && (
          <TextField
            label="Comment"
            fullWidth
            multiline
            value={item.comment || ''}
            onChange={(e) => onCommentChange(item.id, e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{ mt: 2 }} // Add some margin on top for spacing
          />
        )}
      </ListItem>
    );
}

function InspectionPage() {
  const { inspectionId } = useParams();
  const [inspectionData, setInspectionData] = useState({ items: [], data: {} });

  useEffect(() => {
    const fetchInspectionData = async () => {
      try {
        const response = await getAllInspection(inspectionId);
        if (response) {
          setInspectionData(response);
        } else {
          setInspectionData({ items: [], data: {} });
        }
      } catch (error) {
        console.error('Error fetching inspection details:', error);
      }
    };

    fetchInspectionData();
  }, [inspectionId]);

  const handleCompletion = () => {
    // Implement completion logic here
  };

  const handleCheckedChange = (itemId, checked) => {
    console.log(`Checked Change - Item ID: ${itemId}, Checked: ${checked}`);
    setInspectionData(prevData => {
      const newData = { ...prevData.data };
  
      if (newData[itemId]) {
        newData[itemId].checked = checked;
      } else {
        console.error('Item ID not found in data state:', itemId);
      }
  
      return { ...prevData, data: newData };
    });
  };
  
  const handleCommentChange = (itemId, comment) => {
    console.log(`Comment Change - Item ID: ${itemId}, Comment: ${comment}`);
    setInspectionData(prevData => {
      const newData = { ...prevData.data };
  
      if (newData[itemId]) {
        newData[itemId].comment = comment;
      } else {
        console.error('Item ID not found in data state:', itemId);
      }
  
      return { ...prevData, data: newData };
    });
  };
  
  
  // Function to organize items into groups
  const getGroupedItems = () => {
    const groups = inspectionData.items.reduce((groupMap, group) => {
      groupMap[group.id] = {
        name: group.name,
        items: []
      };
      return groupMap;
    }, {});

    Object.values(inspectionData.data).forEach(item => {
      if (groups[item.inspectionTemplateId]) {
        groups[item.inspectionTemplateId].items.push({
          id: item.inspectionItemId,
          ...item
        });
      }
    });

    // Sort the items in each group by orderIndex
    Object.values(groups).forEach(group => {
      group.items.sort((a, b) => a.orderIndex - b.orderIndex);
    });

    return groups;
  };

  const renderItems = () => {
    const groupedItems = getGroupedItems();
  
    return Object.values(groupedItems).map(group => (
      <React.Fragment key={group.id}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', my: 2 }}>
          {group.name}
        </Typography>
        {group.items.map(item => (
          <InspectionListItem
            key={item.id}
            item={item}
            onCheckedChange={handleCheckedChange}
            onCommentChange={handleCommentChange}
          />
        ))}
      </React.Fragment>
    ));
  };
  
  return (
    <Container>
      <Typography variant="h4" sx={{ my: 4 }}>Inspection Details</Typography>
      <List>
        {renderItems()}
      </List>
      <Box textAlign="center" my={4}>
        <Button variant="contained" color="primary" onClick={handleCompletion}>
          Complete Inspection
        </Button>
      </Box>
    </Container>
  );
}

export default InspectionPage;
