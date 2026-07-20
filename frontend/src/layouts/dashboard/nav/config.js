import HomeIcon from '@mui/icons-material/Home';
import ListItemIcon from '@mui/material/ListItemIcon';
import StoreIcon from '@mui/icons-material/Store';
import { Icon } from '@iconify/react';
import SvgColor from '../../../components/svg-color';
import { StyledNavItemIcon } from '../../../components/nav-section/styles';


const icon = (name) =>
<StyledNavItemIcon><SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} /> </StyledNavItemIcon> 

const urlIcon = (url) => 
<ListItemIcon>
  <img src={url} alt={`my icon ${url}`} />
</ListItemIcon>

const navConfig = (role) => {
  console.log(role)
  if (role === 'admin') {
    return  [
      {
        title: 'Analytics',
        path: '/',
        breadcrumbsIcon: <HomeIcon />,
        icon: <Icon icon="carbon:dashboard" style={{ marginRight: '18px', fontSize: '22px' }} />
      },
      {
        title: 'Jobs Board',
        path: '/board',
        breadcrumbsIcon:  <StoreIcon />,
        icon: <Icon icon="system-uicons:clipboard" style={{ marginRight: '18px', fontSize: '22px' }} />

      },
      {
        title: 'Jobs',
        path: '/jobs',
        breadcrumbsIcon:  <StoreIcon />,
        icon: <Icon icon="ph:briefcase-thin" style={{ marginRight: '18px', fontSize: '22px' }} />
      },
      {
        title: 'Inspections (Beta)',
        path: '/inspections',
        breadcrumbsIcon:  <StoreIcon />,
        icon: <Icon icon="fa-solid:search" style={{ marginRight: '18px', fontSize: '22px' }} />
      },
    ]
  }
  if (role === 'basic') {
    return  [
    {
      title: 'Board',
      path: '/',
      breadcrumbsIcon:  <StoreIcon />,
      icon: <Icon icon="system-uicons:clipboard" style={{ marginRight: '18px', fontSize: '22px' }} />
    },
    {
      title: 'Jobs',
      path: '/jobs',
      breadcrumbsIcon:  <StoreIcon />,
      icon: <Icon icon="ph:briefcase-thin" style={{ marginRight: '18px', fontSize: '22px' }} />
    },
  ]
  }
  return  [
    {
      title: 'Jobs',
      path: '/',
      breadcrumbsIcon:  <StoreIcon />,
      icon: <Icon icon="ph:briefcase-thin" style={{ marginRight: '18px', fontSize: '22px' }} />
    },
  ]
} 

export default navConfig;
