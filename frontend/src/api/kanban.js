import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
// utils
import { fetcher, endpoints } from '../utils/axios';
import config from '../config/config';

const URL = `${config.apiUrl}/board`;
const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useGetBoard() {
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, options);

  const memoizedValue = useMemo(
    () => ({
      board: data?.board,
      boardLoading: isLoading,
      boardError: error,
      boardValidating: isValidating,
      boardEmpty: !isLoading && !data?.board.ordered.length,
    }),
    [data?.board, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createColumn(columnData) {
  /**
   * Work on server
   */
  // const data = { columnData };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'create-column' } });

  /**
   * Work in local
   */
  mutate(
    URL,
    (currentData) => {
      const { board } = currentData;

      const columns = {
        ...board.columns,
        // add new column in board.columns
        [columnData.id]: columnData,
      };

      // add new column in board.ordered
      const ordered = [...board.ordered, columnData.id];

      return {
        ...currentData,
        board: {
          ...board,
          columns,
          ordered,
        },
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function updateColumn(columnId, columnName) {
  /**
   * Work on server
   */
  // const data = { columnId, columnName };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'update-column' } });

  /**
   * Work in local
   */
  mutate(
    URL,
    (currentData) => {
      const { board } = currentData;

      // current column
      const column = board.columns[columnId];

      const columns = {
        ...board.columns,
        // update column in board.columns
        [column.id]: {
          ...column,
          name: columnName,
        },
      };

      return {
        ...currentData,
        board: {
          ...board,
          columns,
        },
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function moveColumn(newOrdered) {
  /**
   * Work in local
   */
  mutate(
    URL,
    (currentData) => {
      const { board } = currentData;

      // update ordered in board.ordered
      const ordered = newOrdered;

      return {
        ...currentData,
        board: {
          ...board,
          ordered,
        },
      };
    },
    false
  );

  /**
   * Work on server
   */
  // const data = { newOrdered };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'move-column' } });
}

// ----------------------------------------------------------------------

export async function clearColumn(columnId) {
  /**
   * Work on server
   */
  // const data = { columnId };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'clear-column' } });

  /**
   * Work in local
   */
  mutate(
    URL,
    (currentData) => {
      const { board } = currentData;

      const { jobs } = board;

      // current column
      const column = board.columns[columnId];

      // delete jobs in board.jobs
      column.jobIds.forEach((key) => {
        delete jobs[key];
      });

      const columns = {
        ...board.columns,
        [column.id]: {
          ...column,
          // delete job in column
          jobIds: [],
        },
      };

      return {
        ...currentData,
        board: {
          ...board,
          columns,
          jobs,
        },
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function deleteColumn(columnId) {
  /**
   * Work on server
   */
  // const data = { columnId };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'delete-column' } });

  /**
   * Work in local
   */
  mutate(
    URL,
    (currentData) => {
      const { board } = currentData;

      const { columns, jobs } = board;

      // current column
      const column = columns[columnId];

      // delete column in board.columns
      delete columns[columnId];

      // delete jobs in board.jobs
      column.jobIds.forEach((key) => {
        delete jobs[key];
      });

      // delete column in board.ordered
      const ordered = board.ordered.filter((id) => id !== columnId);

      return {
        ...currentData,
        board: {
          ...board,
          columns,
          jobs,
          ordered,
        },
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function createJob(columnId, jobData) {
  /**
   * Work on server
   */
  // const data = { columnId, jobData };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'create-job' } });

  /**
   * Work in local
   */
  mutate(
    URL,
    (currentData) => {
      const { board } = currentData;

      // current column
      const column = board.columns[columnId];

      const columns = {
        ...board.columns,
        [columnId]: {
          ...column,
          // add job in column
          jobIds: [...column.jobIds, jobData.id],
        },
      };

      // add job in board.jobs
      const jobs = {
        ...board.jobs,
        [jobData.id]: jobData,
      };

      return {
        ...currentData,
        board: {
          ...board,
          columns,
          jobs,
        },
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function updateJob(jobData) {
  /**
   * Work on server
   */
  // const data = { jobData };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'update-job' } });

  /**
   * Work in local
   */
  mutate(
    URL,
    (currentData) => {
      const { board } = currentData;

      const jobs = {
        ...board.jobs,
        // add job in board.jobs
        [jobData.id]: jobData,
      };

      return {
        ...currentData,
        board: {
          ...board,
          jobs,
        },
      };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function moveJob(updateColumns) {
  /**
   * Work in local
   */
  mutate(
    URL,
    (currentData) => {
      const { board } = currentData;

      // update board.columns
      const columns = updateColumns;

      return {
        ...currentData,
        board: {
          ...board,
          columns,
        },
      };
    },
    false
  );

  /**
   * Work on server
   */
  // const data = { updateColumns };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'move-job' } });
}

// ----------------------------------------------------------------------

export async function deleteJob(columnId, jobId) {
  /**
   * Work on server
   */
  // const data = { columnId, jobId };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'delete-job' } });

  /**
   * Work in local
   */
  mutate(
    URL,
    (currentData) => {
      const { board } = currentData;

      const { jobs } = board;

      // current column
      const column = board.columns[columnId];

      const columns = {
        ...board.columns,
        [column.id]: {
          ...column,
          // delete jobs in column
          jobIds: column.jobIds.filter((id) => id !== jobId),
        },
      };

      // delete jobs in board.jobs
      delete jobs[jobId];

      return {
        ...currentData,
        board: {
          ...board,
          columns,
          jobs,
        },
      };
    },
    false
  );
}
