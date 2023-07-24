import HomeIcon from '@mui/icons-material/Home';
import ListItemIcon from '@mui/material/ListItemIcon';
import StoreIcon from '@mui/icons-material/Store';

import SvgColor from '../../../components/svg-color';
import { StyledNavItemIcon } from '../../../components/nav-section/styles';


const icon = (name) =>
<StyledNavItemIcon><SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} /> </StyledNavItemIcon> 

const urlIcon = (url) => 
<ListItemIcon>
  <img src={url} alt={`my icon ${url}`} />
</ListItemIcon>

const navConfig = [
  {
    title: 'Home',
    path: '/',
    breadcrumbsIcon: <HomeIcon />,
    icon: icon('ic_analytics'),
  },
  {
    title: 'Products',
    path: '/products',
    breadcrumbsIcon: '/assets/icons/navbar/ic_cart.svg',
    icon: icon('ic_cart'),
  },
  {
    title: 'Stores',
    path: '/stores',
    breadcrumbsIcon: '/assets/icons/navbar/ic_cart.svg',
    icon: <StyledNavItemIcon><StoreIcon/></StyledNavItemIcon>,
  },
  // Add more items if needed
]

export default navConfig;
