import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State for products, loading, and error
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect to fetch data when the component mounts
  useEffect(() => {
    // Fetch data from the backend API
    axios.get('http://localhost:5001/api/products')
      .then(response => {
        // On success, update the products state
        setProducts(response.data);
      })
      .catch(err => {
        // On error, set an error message
        setError('Failed to fetch data. Make sure the backend server is running.');
        console.error(err);
      })
      .finally(() => {
        // Set loading to false after the request finishes
        setLoading(false);
      });
  }, []); // The empty array [] means this runs only once

  // Show a loading message
  if (loading) {
    return <h1>Loading...</h1>;
  }

  // Show an error message
  if (error) {
    return <h1 style={{ color: 'red' }}>{error}</h1>;
  }

  // Render the product list
  return (
    <div className="App">
      <h1>Product List</h1>
      <div className="product-container">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h2>{product.name}</h2>
            <p>Price: ${product.price}</p>
            <button>Buy Now</button>
          </div>
        ))}
      </div>
      
      <footer>
        <p>made by virappan</p>
      </footer>
      
    </div>
  );
}

export default App;