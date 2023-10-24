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
  const { activeOrganization, haveFetchedOrganizations } = useAuthContext();
  const [board, setBoard] = useState(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (haveFetchedOrganizations) {
          const boardData = await getBoard(activeOrganization);
          setBoard(boardData);

          if (boardData?.jobs) {
            setJobs(Object.values(boardData.jobs));
            // Get unique values for each key and set it to the toFilter state
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
  }, [haveFetchedOrganizations, activeOrganization]);

  return (
    <BoardContext.Provider value={{ board, setBoard, boardLoading, jobs, setJobs}}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = () => useContext(BoardContext);
