// @mui
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

// SETUP COLORS
const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
};

const PRIMARY = {
  lighter: '#D1FECB',
  light: '#76F191',
  main: '#00CC99',
  dark: '#009F6B',
  darker: '#00663F',
  contrastText: '#fff',
};

const SECONDARY = {
  lighter: '#C7FFD6',
  light: '#7FFFB7',
  main: '#33FF99',
  dark: '#00A76B',
  darker: '#00503D',
  contrastText: '#fff',
};

const INFO = {
  lighter: '#CBFED4',
  light: '#6AF18C',
  main: '#00D664',
  dark: '#009B3D',
  darker: '#004F21',
  contrastText: '#fff',
};


const SUCCESS = {
  lighter: '#D4FCE2',
  light: '#7FFAA1',
  main: '#2CE06B',
  dark: '#0F914E',
  darker: '#045A31',
  contrastText: GREY[800],
};

const WARNING = {
  lighter: '#FFF9D4',
  light: '#FFEA7A',
  main: '#FFD500',
  dark: '#B78600',
  darker: '#7A5300',
  contrastText: GREY[800],
};

const ERROR = {
  lighter: '#FFD8D4',
  light: '#FF8C87',
  main: '#FF4842',
  dark: '#B71A1A',
  darker: '#7A0707',
  contrastText: '#fff',
};

const palette = {
  common: { black: '#000', white: '#fff' },
  primary: PRIMARY,
  secondary: SECONDARY,
  info: INFO,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[500], 0.24),
  text: {
    primary: GREY[800],
    secondary: GREY[600],
    disabled: GREY[500],
  },
  background: {
    paper: '#fff',
    default: GREY[100],
    neutral: GREY[200],
  },
  action: {
    active: GREY[600],
    hover: alpha(GREY[500], 0.08),
    selected: alpha(GREY[500], 0.16),
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

export default palette;
