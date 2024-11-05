// src/pages/Catalog.js

import React, { useState, useEffect } from 'react';
import data from '../../data/data.json';
import './Catalog.css';

const Catalog = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(data.products);
  }, []);

  return (
    <div className="catalog">
      <h2>Каталог товарів</h2>
      <ul>
        {products.map((product, index) => (
          <li key={index} className="product-item">
            <span className="product-name">{product.name}</span>
            {product.isNew && (
              <span className="new-label">
                {"Новинка!".split("").map((char, i) => (
                  <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                    {char}
                  </span>
                ))}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Catalog;
