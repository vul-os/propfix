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
          costRange: [0, 10],
          hoursRange: [0, 10],
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
            costRange: [0, 10],
            hoursRange: [0, 10],
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
            <Box sx={{ width: 350, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', gap: '25px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: '0', padding: '0'}}>Filters</h2>
                    <div style={{ display: 'flex', gap: '30px' }}>
                    <Icon icon="material-symbols:refresh" style={{ fontSize: '22px' }} />
                    <Icon icon="ph:x" style={{ fontSize: '22px' }} />
                    </div>
                </div>              
                <div>
    <h4 style={{ fontWeight: 'lighter' }}>Labels</h4>
    <Autocomplete
        multiple
        options={labels ? Object.values(labels).map(label => label.name) : []}
        value={filter?.labelIDs? filter?.labelIDs : []}
        onChange={(event, newValue) => handleChange('labelIDs', newValue)}
        renderInput={(params) => (
            <TextField {...params} label="Labels" variant="outlined" fullWidth />
        )}
    />
</div>
<div>
    <h4 style={{ fontWeight: 'lighter' }}>Priority</h4>
    <Autocomplete
        multiple
        options={toFilter?.priority || []}
        value={filter?.priority || []}
        onChange={(event, newValue) => handleChange('priority', newValue)}
        renderInput={(params) => (
            <TextField {...params} label="Priority" variant="outlined" fullWidth />
        )}
    />
</div>
<div>
    <h4 style={{ fontWeight: 'lighter' }}>Job Names</h4>
    <Autocomplete
        multiple
        options={toFilter?.name || []}
        value={filter?.name || []}
        onChange={(event, newValue) => handleChange('name', newValue)}
        renderInput={(params) => (
            <TextField {...params} label="Job Names" variant="outlined" fullWidth />
        )}
    />
</div>
<div>
    <h4 style={{ fontWeight: 'lighter' }}>Unit Number</h4>
    <Autocomplete
        multiple
        options={toFilter?.unitIdentifier || []}
        value={filter?.unitIdentifier || []}
        onChange={(event, newValue) => handleChange('unitIdentifer', newValue)}
        renderInput={(params) => (
            <TextField {...params} label="Unit Number" variant="outlined" fullWidth />
        )}
    />
</div>
<div>
    <h4 style={{ fontWeight: 'lighter' }}>Buildings</h4>
    <Autocomplete
        multiple
        options={buildings ? Object.values(buildings).map(building => building.buildingName) : []}
        value={filter?.buildingID ? filter?.buildingID : []}
        onChange={(event, newValue) => handleChange('buildingID', newValue)}
        renderInput={(params) => (
            <TextField {...params} label="Buildings" variant="outlined" fullWidth />
        )}
    />
</div>
<div>
    <h4 style={{ fontWeight: 'lighter' }}>Assignees</h4>
    <Autocomplete
        multiple
        options={members ? Object.values(members) : []}
        value={filter?.assigneeIDs || []}
        getOptionLabel={(option) => option?.displayName}
        onChange={(event, newValue) => handleChange('assigneeIDs', newValue)}
        renderInput={(params) => (
            <TextField {...params} label="Assignees" variant="outlined" fullWidth />
        )}
    />
</div>

              <div style={{ width: '100%' }}>
              <DateRangeFilter
                  value={filter?.creationDate}
                  onChange={(value) => handleChange('creationDate', value)}
                  label="Creation Date Range"
                  style={{ margin: '30px 0' }}
              />
              </div>
              <div>
              <h4 style={{ fontWeight: 'lighter' }}>Cost</h4>
                <SliderFilter 
                    value={filter?.costRange} 
                    onChange={(value) => handleChange('costRange', value)} 
                    label="Cost Range"
                    min={cost[0]}
                    max={cost[1]}
                />
            </div>
            <div>
            <h4 style={{ fontWeight: 'lighter' }}>Hours</h4>
                <SliderFilter 
                    value={filter?.hoursRange} 
                    onChange={(value) => handleChange('hoursRange', value)} 
                    label="Hours Range"
                    min={hours[0]}
                    max={hours[1]}
                />
            </div>
                  {/* <CheckboxFilter 
                    value={filter?.rentPaid}
                    onChange={(value) => handleChange('rentPaid', value)}
                    options={["Rent Paid"]}
                    label="Rent Paid"
                /> */}
            </Box>
        </Drawer>
    );
}

export default Filter;
