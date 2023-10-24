import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';

import { useAuthContext } from '../../contexts/auth';
import { getAllSettings, deleteSetting, updateSetting, createSetting } from '../../api/settings';

export default function OtherSettings() {
  const theme = useTheme();
  const [settings, setSettings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedSetting, setEditedSetting] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { activeOrganization } = useAuthContext();

  useEffect(() => {
    if (activeOrganization) {
      fetchSettings(); // Initial data fetch
    }
  }, [activeOrganization]);

  const fetchSettings = async () => {
    try {
      const response = await getAllSettings(activeOrganization);
      setSettings(response || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }

  const startEditing = (setting) => {
    setEditedSetting({ organization_id: activeOrganization, ...setting });
    setIsEditing(true);
    setEditing(setting.id);
  }

  const updateSettingInState = (updatedSetting) => {
    setSettings((prevSettings) =>
      prevSettings.map((setting) =>
        setting.id === updatedSetting.id ? { ...setting, ...updatedSetting } : setting
      )
    );
  }

  const saveEditing = async () => {
    try {
      if (isEditing) {
        await updateSetting(editedSetting);
        updateSettingInState(editedSetting);
      } else {
        await createNewSetting(editedSetting);
      }
      setIsEditing(false);
      setEditing(null);
      setOpenDialog(false);
      fetchSettings(); // Fetch data again after the update
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  }

  const closeEditing = () => {
    setIsEditing(false);
    setEditing(null);
    setOpenDialog(false);
  }

  const handleDeleteSetting = async (setting) => {
    try {
      await deleteSetting(setting.id);
      setSettings((prevSettings) => prevSettings.filter((s) => s.id !== setting.id));
    } catch (error) {
      console.error('Error deleting setting:', error);
    }
  }

  const createNewSetting = async (newSetting, token) => {
    try {
      const defaultSetting = {
        organization_id: activeOrganization,
        type: '',
        data: '',
      };
  
      const createdSetting = await createSetting(newSetting, token);
      if (createdSetting) {
        const updatedSettings = [...settings, { ...defaultSetting, ...createdSetting }];
        setSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Error creating setting:', error);
    }
  }
  
  return (
    <div className="settings-page">
      <Typography variant="h4">
        Settings ({settings.length})
        <IconButton onClick={fetchSettings} aria-label="Refresh">
          <RefreshIcon />
        </IconButton>
        <IconButton
          color=""
          aria-label="Add Setting"
          onClick={() => {
            setEditedSetting({ organization_id: activeOrganization, type: '', data: '' });
            setIsEditing(false);
            setOpenDialog(true);
          }}
          style={{
            position: 'relative',
            backgroundColor: '',
            boxShadow: '',
          }}
        >
          <AddIcon />
        </IconButton>
      </Typography>

      <TableContainer sx={{ marginTop: theme.spacing(2) }} component={Paper}>
        <Table aria-label="settings table">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {settings?.map((setting) => (
              <TableRow key={setting.id}>
                <TableCell>
                  {editing === setting.id ? (
                    <TextField
                      label="Type"
                      value={editedSetting.type}
                      onChange={(e) => setEditedSetting({ ...editedSetting, type: e.target.value })}
                      fullWidth
                      margin="dense"
                    />
                  ) : (
                    setting.type
                  )}
                </TableCell>
                <TableCell>
                  {editing === setting.id ? (
                    <TextField
                      label="Data"
                      value={editedSetting.data}
                      onChange={(e) => setEditedSetting({ ...editedSetting, data: e.target.value })}
                      fullWidth
                      margin="dense"
                    />
                  ) : (
                    setting.data
                  )}
                </TableCell>
                <TableCell>
                  {editing === setting.id ? (
                    <>
                      <IconButton onClick={saveEditing} aria-label="Save">
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={closeEditing} aria-label="Close">
                        <CloseIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton onClick={() => startEditing(setting)} aria-label="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteSetting(setting)} aria-label="Delete">
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={closeEditing}>
        <DialogTitle>{isEditing ? 'Edit Setting' : 'Add New Setting'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Type"
            value={editedSetting.type}
            onChange={(e) => setEditedSetting({ ...editedSetting, type: e.target.value })}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Data"
            value={editedSetting.data}
            onChange={(e) => setEditedSetting({ ...editedSetting, data: e.target.value })}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditing}>Cancel</Button>
          <Button onClick={saveEditing}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
