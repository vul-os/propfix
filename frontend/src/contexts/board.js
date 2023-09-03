import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthContext } from './auth'; // Make sure to update this path
import { getBoard } from '../api/jobs'; // Make sure to update this path

export const BoardContext = createContext(undefined);

export const BoardProvider = ({ children }) => {
  const { getIdToken, activeOrganization } = useAuthContext();
  const [board, setBoard] = useState(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const [jobs, setJobs] = useState([]); // Add a new state for jobs

  useEffect(() => {
    async function fetchData() {
      try {
        if (activeOrganization) {
          const token = await getIdToken();
          const boardData = await getBoard(token, activeOrganization);
          setBoard(boardData.board);
          if (boardData.board && boardData.board.jobs) {
            setJobs(Object.values(boardData.board.jobs)); // Assume board.jobs is a key-value pair object
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
  }, [getIdToken, activeOrganization]);

  return (
    <BoardContext.Provider value={{ board, setBoard, boardLoading, jobs }}> {/* Expose jobs here */}
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = () => useContext(BoardContext);
