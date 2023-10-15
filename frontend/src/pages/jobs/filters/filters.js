import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import dayjs, { Dayjs } from 'dayjs';
import { Drawer, Box, LocalizationProvider } from '@mui/material';
import { 
    SearchFilter, 
    DateRangeFilter, 
    SliderFilter, 
    DropdownFilter, 
    CheckboxFilter 
} from './filter-components';

function Filter({ sidebarOpen, toggleSidebar, toFilter }) {
    const cost = toFilter?.cost ? [Math.min(...toFilter?.cost), Math.max(...toFilter?.cost)] : [0, 1000]
    const hours = toFilter?.hours ? [Math.min(...toFilter?.hours), Math.max(...toFilter?.hours)] : [0, 24]
    // Utility function to check if a value is a valid dayjs date
    const isValidDate = (d) => {
      return dayjs(d).isValid();
    };

    const validDates = (toFilter?.createdAt || [])
        .map(date => dayjs(date))
        .filter(isValidDate);

    const minDate = validDates.length ? validDates.reduce((a, b) => a.isBefore(b) ? a : b) : null;
    const maxDate = validDates.length ? validDates.reduce((a, b) => a.isAfter(b) ? a : b) : null;

    const creationDate = [minDate, maxDate];


    const initialFilterState = {
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
      creationDate,
  };

    const [filter, setFilter] = useState(initialFilterState);
    const handleChange = (field, value) => {
        setFilter(prev => ({ ...prev, [field]: value }));
    };

    console.log(filter)

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

    if (!toFilter) {
      return <></>
    }
    return (
        <Drawer anchor="right" open={sidebarOpen} onClose={toggleSidebar}>
            <Box sx={{ /* ... styling ... */ }}>

                <DropdownFilter 
                    value={filter?.name} 
                    onChange={(value) => handleChange('name', value)} 
                    options={toFilter?.name}
                    label="Organization ID" 
                />
                <DropdownFilter 
                    value={filter?.organizationID} 
                    onChange={(value) => handleChange('organizationID', value)} 
                    options={toFilter?.organizationIDs}
                    label="Organization ID" 
                />
                <DropdownFilter 
                    value={filter?.priority}
                    onChange={(value) => handleChange('priority', value)}
                    options={toFilter?.priorities}
                    label="Priority"
                />
                <DropdownFilter 
                    value={filter?.reporterID}
                    onChange={(value) => handleChange('reporterID', value)}
                    options={toFilter?.reporterIDs}
                    label="Reporter ID"
                />
                <DropdownFilter 
                    value={filter?.assigneeIDs}
                    onChange={(value) => handleChange('assigneeIDs', value)}
                    options={toFilter?.assigneeIDs}
                    label="Assignee IDs"
                    multiple
                />
                <DropdownFilter 
                    value={filter?.unitIdentifier}
                    onChange={(value) => handleChange('unitIdentifier', value)}
                    options={toFilter?.unitIdentifiers}
                    label="Unit Identifier"
                />
                <DropdownFilter 
                    value={filter?.buildingID}
                    onChange={(value) => handleChange('buildingID', value)}
                    options={toFilter?.buildingIDs}
                    label="Building ID"
                />
                <DropdownFilter 
                    value={filter?.labelIDs}
                    onChange={(value) => handleChange('labelIDs', value)}
                    options={toFilter?.labelIDs}
                    multiple
                    label="Label IDs"
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
                <DateRangeFilter
                    value={filter?.creationDate}
                    onChange={(value) => handleChange('creationDate', value)}
                    label="Creation Date Range"
                />
                {/* ... and so on for the other filters ... */}
            </Box>
        </Drawer>
    );
}

export default Filter;
