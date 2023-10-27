import PropTypes from 'prop-types';
// @mui
import { alpha } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------
export default function Priority({ priority, onChangePriority }) {
  return (
    <Stack direction="row" flexWrap="wrap" spacing={1}>
      {priority && priority !== '' && ['low', 'medium', 'high'].map((option) => (
        <ButtonBase
          key={option}
          onClick={() => onChangePriority(option)}
          sx={{
            py: 0.5,
            pl: 0.75,
            pr: 1.25,
            fontSize: 12,
            borderRadius: 1,
            lineHeight: '20px',
            textTransform: 'capitalize',
            fontWeight: 'fontWeightBold',
            boxShadow: (theme) => `inset 0 0 0 1px ${alpha(theme.palette.grey[500], 0.24)}`,
            ...(option === priority?.toLowerCase() && {
              boxShadow: (theme) => `inset 0 0 0 2px ${theme.palette.text.primary}`,
            }),
          }}
        >
          <Iconify
            icon={
              (option === 'low' && 'solar:double-alt-arrow-down-bold-duotone') ||
              (option === 'medium' && 'solar:double-alt-arrow-right-bold-duotone') ||
              'solar:double-alt-arrow-up-bold-duotone'
            }
            sx={{
              mr: 0.5,
              ...(option === 'low' && {
                color: 'info.main',
              }),
              ...(option === 'medium' && {
                color: 'warning.main',
              }),
              ...(option === 'hight' && {
                color: 'error.main',
              }),
            }}
          />

          {option}
        </ButtonBase>
      ))}
    </Stack>
  );
}
Priority.propTypes = {
  priority: PropTypes.string,
  onChangePriority: PropTypes.func,
};
