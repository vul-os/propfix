import HomeIcon from '@mui/icons-material/Home';
import ListItemIcon from '@mui/material/ListItemIcon';
import StoreIcon from '@mui/icons-material/Store';
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
        icon: icon('ic_analytics'),
      },
      {
        title: 'Board',
        path: '/board',
        breadcrumbsIcon:  <StoreIcon />,
        icon: icon('ic_cart'),
      },
      {
        title: 'Jobs',
        path: '/jobs',
        breadcrumbsIcon:  <StoreIcon />,
        icon: icon('ic_cart'),
      },
    ]
  }
  if (role === 'basic') {
    return  [
    {
      title: 'Board',
      path: '/',
      breadcrumbsIcon:  <StoreIcon />,
      icon: icon('ic_cart'),
    },
    {
      title: 'Jobs',
      path: '/jobs',
      breadcrumbsIcon:  <StoreIcon />,
      icon: icon('ic_cart'),
    },
  ]
  }
  return  [
    {
      title: 'Jobs',
      path: '/',
      breadcrumbsIcon:  <StoreIcon />,
      icon: icon('ic_cart'),
    },
  ]
} 

export default navConfig;
