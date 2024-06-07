const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); 

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'xm_bakeries'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database.');
});

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send('Unauthorized');
  }
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    req.user = decoded;
    next();
  });
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).send('Forbidden');
    }
  };
};

app.post('/register', (req, res) => {
  const { email, password, role } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  const query = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
  db.query(query, [email, hash, role], (err) => {
    if (err) return res.status(500).send(err);
    res.status(200).send('User registered successfully.');
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(401).send('Invalid email or password');
    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid email or password');
    }
    const token = jwt.sign({ id: user.id, role: user.role }, 'secretkey', { expiresIn: '1h' });
    res.status(200).json({ token });
    console.log(`${email} logged in`)
  });
});

app.post('/products', authenticate, (req, res) => {
  const { name, price, category, quantity } = req.body;
  const query = 'INSERT INTO products (name, price, category, quantity) VALUES (?, ?, ?, ?)';
  db.query(query, [name, price, category, quantity], (err) => {
    if (err) return res.status(500).send(err);
    res.status(200).send('Product added successfully.');
  });
});


app.get('/products', (req, res) => {
  const { priceMin, priceMax, category, quantity, search } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  if (priceMin) query += ` AND price >= ${db.escape(priceMin)}`;
  if (priceMax) query += ` AND price <= ${db.escape(priceMax)}`;
  if (category) query += ` AND category = ${db.escape(category)}`;
  if (quantity) query += ` AND quantity >= ${db.escape(quantity)}`;
  if (search) query += ` AND (name LIKE ${db.escape('%' + search + '%')} OR category LIKE ${db.escape('%' + search + '%')})`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
});


app.delete('/products/:productId', authenticate, authorize(['admin']), (req, res) => {
  const { productId } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  db.query(query, [productId], (err) => {
    if (err) return res.status(500).send('Error deleting product');
    res.status(200).send('Product deleted successfully');
  });
});


app.get('/orders/:id', authenticate, (req, res) => {
  const orderId = req.params.id;
  const query = 'SELECT * FROM orders WHERE id = ?';
  db.query(query, [orderId], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(result);
  });
});


app.get('/customers/:id/orders', authenticate, (req, res) => {
  const customerId = req.params.id;
  const query = 'SELECT * FROM orders WHERE customer_id = ?';
  db.query(query, [customerId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
});


app.get('/inventory', authenticate, (req, res) => {
  const query = 'SELECT * FROM inventory';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
});


app.get('/products', authenticate, (req, res) => {
  const query = 'SELECT id, name, price, category, quantity FROM products';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
});



app.get('/reports/sales', authenticate, authorize(['admin']), (req, res) => {
  const query = 'SELECT * FROM sales_report';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
});


app.put('/orders/:orderId/fulfill', authenticate, authorize(['admin']), (req, res) => {
  const { orderId } = req.params;
  const updateOrderStatus = 'UPDATE orders SET status = ? WHERE id = ?';

  db.query(updateOrderStatus, ['fulfilled', orderId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.affectedRows === 0) return res.status(404).send('Order not found');
    res.status(200).send('Order status updated to fulfilled');
  });
});


app.get('/reports/inventory', authenticate, authorize(['admin']), (req, res) => {
  const query = `
    SELECT 
      p.name AS product_name,
      p.quantity AS available_quantity,
      COALESCE(MAX(oh.order_date), 'Never') AS last_updated
    FROM 
      products p
    LEFT JOIN 
      order_history oh ON p.id = oh.product_id
    GROUP BY 
      p.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching inventory report:', err);
      return res.status(500).send('Error fetching inventory report');
    }
    res.status(200).json(results);
  });
});


app.get('/productfilter', (req, res) => {
  const { priceMin, priceMax, category, quantity } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (priceMin) {
    query += ' AND price >= ?';
    params.push(priceMin);
  }
  if (priceMax) {
    query += ' AND price <= ?';
    params.push(priceMax);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (quantity) {
    query += ' AND quantity >= ?';
    params.push(quantity);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
});


app.post('/customer-login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND role = "customer"';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(401).send('Invalid email or password');
    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid email or password');
    }
    const token = jwt.sign({ id: user.id, role: user.role }, 'secretkey', { expiresIn: '2h' });
    res.status(200).json({ token, role: user.role });
  });
});


app.get('/orders', authenticate, authorize(['admin']), (req, res) => {
  const query = `
    SELECT 
      o.id, 
      p.name AS product_name, 
      o.quantity, 
      o.delivery_location, 
      o.order_date, 
      u.email AS customer_email 
    FROM orders o
    JOIN products p ON o.product_id = p.id
    JOIN users u ON o.customer_id = u.id
    WHERE o.order_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).send('Error fetching orders');
    }
    res.status(200).json(results);
  });
});


app.get('/order_history', authenticate, authorize(['admin']), (req, res) => {
  const query = `
    SELECT 
      o.id, 
      o.product_id, 
      p.name AS product_name, 
      o.quantity, 
      o.delivery_location, 
      o.order_date, 
      u.email AS customer_email, 
      NULL AS deleted_at
    FROM orders o
    JOIN products p ON o.product_id = p.id
    JOIN users u ON o.customer_id = u.id
    WHERE o.order_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
    UNION
    SELECT 
      h.id, 
      h.product_id, 
      p.name AS product_name, 
      h.quantity, 
      h.delivery_location, 
      h.order_date, 
      h.customer_email, 
      h.deleted_at
    FROM order_history h
    JOIN products p ON h.product_id = p.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching order history:', err);
      return res.status(500).send('Error fetching order history');
    }
    res.status(200).json(results);
  });
});


app.delete('/orders/:orderId', authenticate, authorize(['admin']), (req, res) => {
  const { orderId } = req.params;

  const moveOrderToHistory = (order, callback) => {
    const { id, product_id, quantity, delivery_location, order_date, customer_email } = order;
    const query = 'INSERT INTO order_history (order_id, product_id, quantity, delivery_location, order_date, customer_email) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [id, product_id, quantity, delivery_location, order_date, customer_email], callback);
  };

  const fetchOrder = `
    SELECT o.id, o.product_id, o.quantity, o.delivery_location, o.order_date, u.email AS customer_email, p.quantity AS product_quantity 
    FROM orders o 
    JOIN users u ON o.customer_id = u.id 
    JOIN products p ON o.product_id = p.id 
    WHERE o.id = ?`;

  db.query(fetchOrder, [orderId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send('Order not found');

    const order = results[0];
    const newQuantity = order.product_quantity + order.quantity;

    const updateProduct = 'UPDATE products SET quantity = ? WHERE id = ?';
    db.query(updateProduct, [newQuantity, order.product_id], (err) => {
      if (err) return res.status(500).send(err);

      moveOrderToHistory(order, (err) => {
        if (err) return res.status(500).send(err);

        const deleteOrder = 'DELETE FROM orders WHERE id = ?';
        db.query(deleteOrder, [orderId], (err) => {
          if (err) return res.status(500).send(err);
          res.status(200).send('Order deleted and product quantity updated successfully.');
        });
      });
    });
  });
});



app.get('/products/:id', authenticate, (req, res) => {
  const productId = req.params.id;
  const query = 'SELECT id, name, price, category, quantity FROM products WHERE id = ?';
  db.query(query, [productId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send('Product not found');
    res.status(200).json(results[0]);
  });
});


app.post('/orders', authenticate, authorize(['customer', 'admin']), (req, res) => {
  const { customerId, productId, quantity, deliveryLocation } = req.body;


  const fetchProductQuery = 'SELECT quantity FROM products WHERE id = ?';
  db.query(fetchProductQuery, [productId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send('Product not found');

    const availableQuantity = results[0].quantity;
    if (quantity > availableQuantity) {
      return res.status(400).send('Requested quantity exceeds available stock');
    }


    const insertOrderQuery = 'INSERT INTO orders (customer_id, product_id, quantity, delivery_location) VALUES (?, ?, ?, ?)';
    db.query(insertOrderQuery, [customerId, productId, quantity, deliveryLocation], (err) => {
      if (err) return res.status(500).send(err);


      const updateProductQuery = 'UPDATE products SET quantity = quantity - ? WHERE id = ?';
      db.query(updateProductQuery, [quantity, productId], (err) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('Order placed successfully and product quantity updated');
      });
    });
  });
});

app.get('/customers', authenticate, authorize(['admin']), (req, res) => {
  const query = 'SELECT id, email, role FROM users WHERE role = "customer"';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
});

app.get('/customers/:customerId/orders', authenticate, authorize(['customer', 'admin']), (req, res) => {
  const { customerId } = req.params;
  const query = 'SELECT * FROM orders WHERE customer_id = ?';
  db.query(query, [customerId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
});


app.get('/users', authenticate, (req, res) => {
  const { email } = req.query;
  const query = 'SELECT * FROM users WHERE email = ? AND role = "customer"';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send('User not found');
    res.status(200).json(results[0]);
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
