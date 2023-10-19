import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import PanToolIcon from '@mui/icons-material/PanTool';
import Box from '@mui/material/Box';

const Toolbar = ({ onSelect, onAddText, onAddImage }) => {
  return (
    <Box display="flex" gap={1}>
      <Tooltip title="Select">
        <IconButton onClick={onSelect} aria-label="select">
          <PanToolIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add Text">
        <IconButton onClick={onAddText} aria-label="add text">
          <TextFieldsIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add Image">
        <IconButton onClick={onAddImage} aria-label="add image">
          <ImageIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Toolbar;
