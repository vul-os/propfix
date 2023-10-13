import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [filters, setFilters] = useState({});
  const [toFilter, setTwoFilter] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("heree", haveFetchedOrganizations)
        if (haveFetchedOrganizations) {
          const token = await getIdToken();
          const boardData = await getBoard(token, activeOrganization);
          setBoard(boardData.board);
          console.log(boardData.board);
          if (boardData.board && boardData.board.jobs) {
            setJobs(Object.values(boardData.board.jobs));
            // Get unique values for each key and set it to the toFilter state
            const uniqueValues = getUniqueValuesForJobs(Object.values(boardData.board.jobs));
            setTwoFilter(uniqueValues);
            console.log(uniqueValues);
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

  return (
    <BoardContext.Provider value={{ board, setBoard, boardLoading, jobs, setJobs, filters, setFilters, toFilter }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = () => useContext(BoardContext);
