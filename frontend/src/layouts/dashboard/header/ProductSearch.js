import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product.ProductIdentifier}`);
  };

  // Parse the ImageURLs string into an array of URLs
  const urls = JSON.parse(product.ImageURLs);

  // Get the first URL from the array
  const firstUrl = urls[0];

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea onClick={handleCardClick}>
        <CardMedia component="img" height="140" image={firstUrl} alt="Product Image" />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {product.Name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.SKU}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    ProductIdentifier: PropTypes.string.isRequired,
    Name: PropTypes.string.isRequired,
    SKU: PropTypes.string.isRequired,
    URL: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProductCard;
