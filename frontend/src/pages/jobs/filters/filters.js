import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import dayjs, { Dayjs } from 'dayjs';
import { Drawer, Box, LocalizationProvider, Autocomplete, TextField } from '@mui/material';


import { 
    SearchFilter, 
    DateRangeFilter, 
    SliderFilter, 
    CheckboxFilter 
} from './filter-components';

function Filter({ sidebarOpen, toggleSidebar, toFilter, labels, buildings, members, priorities }) {
    const cost = toFilter?.cost ? [Math.min(...toFilter?.cost), Math.max(...toFilter?.cost)] : [0, 1000]
    const hours = toFilter?.hours ? [Math.min(...toFilter?.hours), Math.max(...toFilter?.hours)] : [0, 24]
    const isValidDate = (d) => {
    return dayjs(d).isValid();
    };

    const validDates = (toFilter?.createdAt || [])
    .map(date => dayjs(date))
    .filter(isValidDate);

    const minDate = validDates.length ? validDates.reduce((a, b) => a.isBefore(b) ? a : b) : null;
    const maxDate = validDates.length ? validDates.reduce((a, b) => a.isAfter(b) ? a : b) : null;
    const creationDate = [minDate, maxDate];
    console.log(toFilter)

    const initialFilterState = {
          name: [],
          priority: [],
          reporterID: [],
          assigneeIDs: [],
          unitIdentifier: [],
          buildingID: [], 
          labels: [],
          attachments: [],
          cost,
          hours,
          rentPaid: false,
          creationDate,
        };
    
    const [filter, setFilter] = useState(initialFilterState);
    const handleChange = (field, value) => {
        setFilter(prev => ({ ...prev, [field]: value }));
    };

    console.log(filter)
    console.log(priorities);


    useEffect(() => {
        // Here we reset the filter state when toFilter changes
        setFilter({
            name: [],
            priority: [],
            reporterID: [],
            assigneeIDs: [],
            unitIdentifier: [],
            buildingID: [],
            labelIDs: [],
            attachments: [],
            cost,
            hours,
            rentPaid: false,
            dueDate: [null, null],
            creationDate,
        });
    }, [toFilter]);

    const setSelectedLabels = (selectedLabel) => {
      setFilter(prev => ({ ...prev, 'labels': selectedLabel }));
    }

    if (!toFilter) {
      return <></>
    }
    return (
      
        <Drawer anchor="right" open={sidebarOpen} onClose={toggleSidebar}>
            <Box sx={{ /* ... styling ... */ }}>

                <Autocomplete
                    multiple
                    options={labels ? Object.values(labels).map(label => label.name) : []}
                    value={filter?.labelIDs? filter?.labelIDs : []}
                    onChange={(event, newValue) => handleChange('labelIDs', newValue)} // Corrected onChange
                    renderInput={(params) => (
                    <TextField {...params} label="Labels" variant="outlined" fullWidth />
                    )}
                  />
                <Autocomplete
                    multiple
                    options={toFilter?.name || []} // Ensure this is an array or fallback to empty array
                    value={filter?.name || []}    // Ensure this is an array or fallback to empty array
                    onChange={(event, newValue) => handleChange('name', newValue)} // Corrected onChange
                    renderInput={(params) => (
                    <TextField {...params} label={"Job Names"} variant="outlined" fullWidth />
                    )}
                />
                <Autocomplete
                    multiple
                    options={toFilter?.name || []} // Ensure this is an array or fallback to empty array
                    value={filter?.name || []}    // Ensure this is an array or fallback to empty array
                    onChange={(event, newValue) => handleChange('name', newValue)} // Corrected onChange
                    renderInput={(params) => (
                    <TextField {...params} label={"Job Names"} variant="outlined" fullWidth />
                    )}
                />
                <Autocomplete
                    multiple
                    options={toFilter?.priority || []} // Ensure this is an array or fallback to empty array
                    value={filter?.priority || []}    // Ensure this is an array or fallback to empty array
                    onChange={(event, newValue) => handleChange('priority', newValue)} // Corrected onChange
                    renderInput={(params) => (
                    <TextField {...params} label={"Priority"} variant="outlined" fullWidth />
                    )}
                />
                <Autocomplete
                    multiple
                    options={toFilter?.unitIdentifier || []} // Ensure this is an array or fallback to empty array
                    value={filter?.unitIdentifier || []}    // Ensure this is an array or fallback to empty array
                    onChange={(event, newValue) => handleChange('unitIdentifer', newValue)} // Corrected onChange
                    renderInput={(params) => (
                    <TextField {...params} label={"Unit Number"} variant="outlined" fullWidth />
                    )}
                />
                <Autocomplete
                    multiple
                    options={buildings ? Object.values(buildings).map(building => building.buildingName) : []}
                    value={filter?.buildingID ? filter?.buildingID : []}
                    onChange={(event, newValue) => handleChange('buildingID', newValue)} // Corrected onChange
                    renderInput={(params) => (
                    <TextField {...params} label="Buildings" variant="outlined" fullWidth />
                    )}
                  />
                <Autocomplete
                    multiple
                    options={members ? Object.values(members) : []}
                    value={filter?.assigneeIDs || []}    // Ensure this is an array or fallback to empty array
                    getOptionLabel={(option) => option?.displayName} // Modify this to match the structure of your 'members' data
                    onChange={(event, newValue) => handleChange('assigneeIDs', newValue)} // Corrected onChange
                    renderInput={(params) => (
                    <TextField {...params} label="Assignees" variant="outlined" fullWidth />
                  )}
                />
                <DateRangeFilter
                    value={filter?.creationDate}
                    onChange={(value) => handleChange('creationDate', value)}
                    label="Creation Date Range"
                />
                <SliderFilter 
                    value={filter?.cost} 
                    onChange={(value) => handleChange('costRange', value)} 
                    label="Cost Range"
                    min={cost[0]}
                    max={cost[1]}
                />
                <SliderFilter 
                    value={filter?.hours} 
                    onChange={(value) => handleChange('hoursRange', value)} 
                    label="Hours Range"
                    min={hours[0]}
                    max={hours[1]}
                />
                  <CheckboxFilter 
                    value={filter?.rentPaid}
                    onChange={(value) => handleChange('rentPaid', value)}
                    options={["Rent Paid"]}
                    label="Rent Paid"
                />
            </Box>
        </Drawer>
    );
}

export default Filter;
