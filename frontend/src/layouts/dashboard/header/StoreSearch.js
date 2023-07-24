import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

function StoreCard({ store }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/stores/${store.SiteIdentifier}`);
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea onClick={handleCardClick}>
        <CardMedia component="img" height="140" image={store.Image} alt="Store Image" />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {store.Url}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {store.Location}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

StoreCard.propTypes = {
  store: PropTypes.shape({
    Image: PropTypes.string,
    Name: PropTypes.string,
    RateLimit: PropTypes.string,
    Scraper: PropTypes.string,
    SiteIdentifier: PropTypes.string,
    Technology: PropTypes.string,
    Url: PropTypes.string,
  }).isRequired,
};

export default StoreCard;
