import { useTheme } from '@mui/material/styles';
import { GlobalStyles } from '@mui/material';
import * as Charts from 'react-chartjs-2';

export function StyledChart() {
  const theme = useTheme();

  const inputGlobalStyles = (
    <GlobalStyles
      styles={{
        '.chartjs-render-monitor': {
          color: theme.palette.text.primary,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[4],
          transition: theme.transitions.create(['background-color', 'box-shadow'])
        }
      }}
    />
  );

  return inputGlobalStyles;
}

export default Charts;
