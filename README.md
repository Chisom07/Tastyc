# Restaurant API

A Node.js REST API for managing restaurant menu items and orders, built with Express.js and MongoDB.

## Features

- Manage menu items (CRUD operations)
- Handle customer orders
- Filter menu items by category
- Track order status and history
- CORS enabled for frontend integration

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd restaurant-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/restaurant-api
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000`.

## API Endpoints

### Menu Items

- `POST /api/menu` - Create a new menu item
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get a specific menu item by ID
- `PUT /api/menu/:id` - Update a menu item by ID
- `DELETE /api/menu/:id` - Delete a menu item by ID
- `GET /api/menu/filter?category=<category>` - Filter menu items by category
- `GET /api/menu/available` - Get only available menu items

### Orders

- `POST /api/orders` - Place a new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a specific order by ID
- `PUT /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Cancel an order
- `GET /api/orders/status/:status` - Get orders by status
- `GET /api/orders/customer/:customerId` - Get customer order history

## Data Models

### Menu Item
- `name` (String, required)
- `description` (String, required)
- `price` (String, required)
- `category` (String, required)
- `ingredients` (Array of Strings, required)
- `available` (Boolean, default: true)

### Order
- (Order model details would depend on your Order.js schema)

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- CORS
- dotenv

## License

ISC