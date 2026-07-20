import React, { useState, useCallback, useEffect, useRef } from 'react';
import _ from 'lodash';
import {
  styled,
  Box,
  Modal,
  Input,
  Slide,
  IconButton,
  InputAdornment,
  ClickAwayListener,
} from '@mui/material';
import Iconify from '../../../components/iconify';
import config from '../../../config/config';

const HEADER_MOBILE = 64;
const HEADER_DESKTOP = 92;

const StyledSearchbar = styled('div')(({ theme, open }) => ({
  top: 0,
  left: 0,
  zIndex: 99,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  height: HEADER_MOBILE,
  padding: theme.spacing(0, 3),
  boxShadow: open ? theme.customShadows.z8 : 'none',
  [theme.breakpoints.up('md')]: {
    height: HEADER_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

const EscButtonContainer = styled(Box)({
  marginLeft: 'auto',
  marginRight: '12%',
});

const EscButton = styled(IconButton)(({ theme }) => ({
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: '4px',
  width: 40,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#c7ffd6',
  '& span': {
    color: '#000000',
    fontSize: '12px',
  },
}));

const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  overflow: 'auto',
  '& .MuiBackdrop-root': {
    height: '100%',
  },
}));

const StyledContainer = styled(Box)({
  backgroundColor: '#c7ffd6',
  padding: '0',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ScrollableProductContainer = styled(Box)(({ theme }) => ({
  maxHeight: 'calc(100vh - 32px)',
  overflowY: 'auto',
  position: 'relative',
  padding: '16px',
  '&::-webkit-scrollbar': {
    width: 8,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: 4,
  },
  '&:after': {
    content: '""',
    position: 'sticky',
    top: 0,
    left: 0,
    height: HEADER_MOBILE,
    pointerEvents: 'none',
    zIndex: 1,
    background: 'white',
    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))',
  },
}));


export default function Searchbar() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  const searchbarRef = useRef(null);

  const handleOpen = () => {
    setOpen(true);
    setOpenModal(false); // Close the product container modal when opening the search bar
  };

  const handleClose = () => {
    setOpen(false);
    setOpenModal(false); // Close the product container modal when closing the search bar
    setSelectedProduct(null);
    setSelectedStore(null);
  };

  const handleFileOpen = (item) => {
    if (item.ProductIdentifier === 'product') {
      setSelectedProduct(item);
    } else if (item.SiteIdentifier === 'store') {
      setSelectedStore(item);
    }
  };

  
  const handleChange = (event) => {
    const { value } = event.target;
    if (value.trim() === '') {
      setItems([]);
      setOpenModal(false);
    }
  };

  const handleProductDetailsClose = () => {
    setSelectedProduct(null);
  };

  const handleStoreDetailsClose = () => {
    setSelectedStore(null);
  };

  const handleEscButton = () => {
    handleClose();
  };

  const handleEscKeyPress = useCallback(
    (event) => {
      if (event.keyCode === 27) {
        // ESC key pressed
        handleClose();
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscKeyPress);
    return () => {
      document.removeEventListener('keydown', handleEscKeyPress);
    };
  }, [handleEscKeyPress]);

  useEffect(() => {
    const handleClickAway = (event) => {
      if (searchbarRef.current && !searchbarRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickAway);
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div ref={searchbarRef}>
        <StyledSearchbar open={open} onClick={handleOpen}>
          {!open && (
            <IconButton>
              <Iconify icon="eva:search-fill" />
            </IconButton>
          )}
          <Slide direction="down" in={open} mountOnExit unmountOnExit>
            <Input
              autoFocus={open}
              fullWidth
              disableUnderline
              placeholder="Search..."
              onChange={handleChange}
              startAdornment={
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />
                </InputAdornment>
              }
              sx={{ flexGrow: 1, fontWeight: 'fontWeightBold' }}
            />
          </Slide>
          {open && (
            <EscButtonContainer>
              <EscButton onClick={handleEscButton}>
                <span style={{ textTransform: 'lowercase' }}>esc</span>
              </EscButton>
            </EscButtonContainer>
          )}
        </StyledSearchbar>
      </div>
    </ClickAwayListener>
  );
}
