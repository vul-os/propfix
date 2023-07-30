import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Link } from '@mui/material';

const Logo = forwardRef(({ disabledLink = false, sx, ...other }, ref) => {
  const theme = useTheme();

  const PRIMARY_LIGHT = theme.palette.primary.light;
  const PRIMARY_MAIN = theme.palette.primary.main;
  const PRIMARY_DARK = theme.palette.primary.dark;

  const logo = (
    <Box
      ref={ref}
      component="div"
      sx={{
        width: 40,
        height: 40,
        display: 'inline-flex',
        ...sx,
      }}
      {...other}
    >
      
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 31.91 32">
      <path fill={PRIMARY_MAIN} d="M15.69.09h.58c.1.07.21.11.31.19.32.29.64.57,1,.88l3.25,3.15,2.44,2.32L26,9.32l2.63,2.5c.74.71,1.49,1.41,2.23,2.13A3.37,3.37,0,0,1,32,15.36v.75a1.81,1.81,0,0,1-1.83,1.28c-.63,0-1.26,0-1.89,0-.21,0-.26.06-.26.33Q28,23.37,28,29a5.1,5.1,0,0,1-.18,1.25,1.59,1.59,0,0,1-.3.58A2.65,2.65,0,0,1,25.26,32H6.72a2.56,2.56,0,0,1-1.17-.26A2.85,2.85,0,0,1,4,29c.05-3.77,0-7.54,0-11.31,0-.25,0-.3-.23-.3h-2a1.76,1.76,0,0,1-1.26-.46,1.63,1.63,0,0,1-.12-2.29c.51-.58,1.08-1.06,1.63-1.58l3.07-3L8,7.43l3.23-3.14c.88-.84,1.76-1.69,2.65-2.51A17.22,17.22,0,0,1,15.69.09Z" transform="translate(-0.05 0)"/>
      <path fill={"#000000"} d="M24,32c0-1.92,0-3.8,0-5.69a.71.71,0,0,0-.37-.76c-.75-.43-1.47-.93-2.22-1.37a.47.47,0,0,0-.43,0c-.8.47-1.58,1-2.37,1.46a.47.47,0,0,0-.22.48c0,1.82,0,3.63,0,5.44V32A5.48,5.48,0,0,1,17,30.74a9.2,9.2,0,0,1-2-5.26A9.25,9.25,0,0,1,18,17.39a.52.52,0,0,0,.23-.6,1.85,1.85,0,0,1,0-.41c0-2.43,0-4.86,0-7.29,0-1.7,0-3.4,0-5.1,0-2,1-3.61,2.48-3.94a2.33,2.33,0,0,1,1.91.46,4,4,0,0,1,1.48,3.41c0,2.13,0,4.27,0,6.4s.05,4,0,6a1.45,1.45,0,0,0,.54,1.32,8.63,8.63,0,0,1,2.76,5.76c.39,3.4-1,7-3.31,8.52Z" transform="translate(-0.05 0)"/>
    </svg>
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return (
    <Link to="/" component={RouterLink} sx={{ display: 'contents' }}>
      {logo}
    </Link>
  );
});

Logo.propTypes = {
  sx: PropTypes.object,
  disabledLink: PropTypes.bool,
};

export default Logo;
