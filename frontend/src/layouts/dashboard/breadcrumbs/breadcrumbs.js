import React from 'react';
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const StyledRoot = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
});

const Main = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

const BreadcrumbsContainer = styled('div')({
  marginBottom: '16px',
});

const BreadcrumbsWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    marginLeft: '1rem',
  },
}));

const BreadcrumbsText = styled(Typography)({
  marginLeft: '0.5rem',
});

export default function RouterBreadcrumbs({ navConfig }) {
  const location = useLocation();

  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap = {};
  navConfig.forEach((item) => {
    breadcrumbNameMap[item.path] = item.title;
  });

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength).concat('...');
  };

  return (
    <BreadcrumbsContainer>
      <Breadcrumbs aria-label="breadcrumb">
        <Link color="inherit" component={RouterLink} to="/">
          <BreadcrumbsWrapper>
            {navConfig.find((item) => item.path === '/')?.breadcrumbsIcon}
            <BreadcrumbsText variant="body1">Home</BreadcrumbsText>
          </BreadcrumbsWrapper>
        </Link>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const breadcrumbName = breadcrumbNameMap[to];
          const truncatedText = truncateText(breadcrumbName || value, 10);

          return (
            <Link
              key={to}
              color={last ? 'text.primary' : 'inherit'}
              component={RouterLink}
              to={to}
            >
              {truncatedText}
            </Link>
          );
        })}
      </Breadcrumbs>
    </BreadcrumbsContainer>
  );
}
