const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require('./config/mongoDB');
const swaggerDocs = require('./config/swagger');
const authRoutes = require('./routes/authRoute');
const companyRoutes = require('./routes/companyRoute');
const categoriesRoutes = require('./routes/categoryRoute');
const productRoutes = require('./routes/productRoute');
const userProfileRoutes = require('./routes/userProfileRoute');

const port = process.env.PORT || 3000;

connectDB.connect();  // Connect to MongoDB

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
swaggerDocs(app); // Initialize Swagger documentation

app.use('/api/auth', authRoutes);
app.use('/api/user/profile', userProfileRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productRoutes);
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('API is running...');
});


// ✅ Chỉ chạy listen() khi local, export app cho Vercel
if (require.main === module) {
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}

// ✅ Vercel sẽ dùng app được export ở đây
module.exports = app;
