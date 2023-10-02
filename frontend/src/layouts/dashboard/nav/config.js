import HomeIcon from '@mui/icons-material/Home';
import ListItemIcon from '@mui/material/ListItemIcon';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AppsIcon from '@mui/icons-material/Apps';
import WorkIcon from '@mui/icons-material/Work';
import { StyledNavItemIcon } from '../../../components/nav-section/styles';
import SvgColor from '../../../components/svg-color';


const icon = (name) =>
<StyledNavItemIcon><SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} /> </StyledNavItemIcon> 


const urlIcon = (url) => 
<ListItemIcon>
  <img src={url} alt={`my icon ${url}`} />
</ListItemIcon>

const navConfig = (role) => {

  if (role === 'admin') {
    return  [{
        title: 'Dashboard',
        path: '/',
        breadcrumbsIcon: <HomeIcon />,
        icon: <DashboardIcon />,
      },
      {
        title: 'Board',
        path: '/board',
        breadcrumbsIcon: <AppsIcon />,
        icon: <AppsIcon />,
      },
      {
        title: 'Jobs',
        path: '/jobs',
        breadcrumbsIcon: <WorkIcon />,
        icon: <WorkIcon />,
      },
    ]
  }
  if (role === 'basic') {
    return  [
    {
      title: 'Board',
      path: '/',
      breadcrumbsIcon: <AppsIcon />,
      icon: <AppsIcon />,
    },
    {
      title: 'Jobs',
      path: '/jobs',
      breadcrumbsIcon: <WorkIcon />,
      icon: <workIcon />,
    },
  ]
  }
  return  [
    {
      title: 'Jobs',
      path: '/',
      breadcrumbsIcon: <WorkIcon />,
      icon: <WorkIcon />,
    },
  ]
} 

export default navConfig;
