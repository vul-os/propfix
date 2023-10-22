import React, { createContext, useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useAuthContext } from './auth'; // Make sure to update this path
import { getBoard } from '../api/board'; // Make sure to update this path

// Function to get unique values for each key in a list of jobs
const getUniqueValuesForJobs = (jobs) => {
  const uniqueValues = {};

  if (jobs && jobs.length > 0) {
    jobs.forEach((job) => {
      Object.keys(job).forEach((key) => {
        const value = job[key];

        if (!uniqueValues[key]) {
          uniqueValues[key] = new Set();
        }

        if (Array.isArray(value)) {
          // If the value is an array, add its elements to the set
          value.forEach((element) => {
            uniqueValues[key].add(element);
          });
        } else {
          // Otherwise, add the value itself to the set
          uniqueValues[key].add(value);
        }
      });
    });
  }

  // Convert sets to arrays and return the result
  const uniqueValuesArray = {};
  Object.keys(uniqueValues).forEach((key) => {
    uniqueValuesArray[key] = [...uniqueValues[key]];
  });
  

  return uniqueValuesArray;
};

export const BoardContext = createContext(undefined);

export const BoardProvider = ({ children }) => {
  const { getIdToken, activeOrganization, haveFetchedOrganizations } = useAuthContext();
  const [board, setBoard] = useState(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [toFilter, setTwoFilter] = useState({});

  const isValidDate = (d) => {
    return dayjs(d).isValid();
  };

  const validDates = (toFilter?.createdAt || []).map((date) => dayjs(date)).filter(isValidDate);
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
    costRange: [0, 10],
    hoursRange: [0, 10],
    rentPaid: false,
    creationDate,
  };

  const [filter, setFilter] = useState(initialFilterState);

  useEffect(() => {
    async function fetchData() {
      try {
        if (haveFetchedOrganizations) {
          const token = await getIdToken();
          const boardData = await getBoard(token, activeOrganization);
          setBoard(boardData.board);

          if (boardData.board && boardData.board.jobs) {
            setJobs(Object.values(boardData.board.jobs));
            // Get unique values for each key and set it to the toFilter state
            const uniqueValues = getUniqueValuesForJobs(Object.values(boardData.board.jobs));
            setTwoFilter(uniqueValues);
          }
        }
        setBoardLoading(false);
      } catch (error) {
        console.error('Error fetching board:', error);
        setBoard(null);
        setBoardLoading(false);
      }
    }
    fetchData();
  }, [getIdToken, haveFetchedOrganizations]);

  useEffect(() => {
    console.log(filter, jobs);
  }, [filter]);

  return (
    <BoardContext.Provider value={{ board, setBoard, boardLoading, jobs, setJobs, filter, setFilter, toFilter }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = () => useContext(BoardContext);
