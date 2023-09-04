import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthContext } from './auth'; // Make sure to update this path
import { getBoard } from '../api/jobs'; // Make sure to update this path

export const BoardContext = createContext(undefined);

export const BoardProvider = ({ children }) => {
    const { getIdToken, activeOrganization } = useAuthContext();
    const [board, setBoard] = useState(null);
    const [boardLoading, setBoardLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [reloadBoard, setReloadBoard] = useState(0); // New state variable
  
    useEffect(() => {
      async function fetchData() {
        try {
          if (activeOrganization) {
            const token = await getIdToken();
            const boardData = await getBoard(token, activeOrganization);
            setBoard(boardData.board);
            if (boardData.board && boardData.board.jobs) {
              setJobs(Object.values(boardData.board.jobs));
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
    }, [getIdToken, activeOrganization, reloadBoard]); // Add reloadBoard to the dependency list
  
    const reFetchBoard = () => {
      setReloadBoard(prev => prev + 1); // Trigger a re-fetch
    };
  
    return (
      <BoardContext.Provider value={{ board, setBoard, boardLoading, jobs, reFetchBoard }}> 
        {children}
      </BoardContext.Provider>
    );
};
  
  

export const useBoardContext = () => useContext(BoardContext);
