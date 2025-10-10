const express = require('express');
const app = express()
var cookieParser = require("cookie-parser");
var cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require('./config/mongoDB');
const swaggerDocs = require('./config/swagger');
const authRoutes = require('./routes/authRoute');
const companyRoutes = require('./routes/companyRoute');
const categoriesRoutes = require('./routes/categoryRoute');
const productRoutes = require('./routes/productRoute');

const port = process.env.PORT || 3000;

connectDB.connect();  // Connect to MongoDB

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
swaggerDocs(app); // Initialize Swagger documentation

app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productRoutes);
app.use(cookieParser());



app.get('/healthcheck',(req, res) => {
    res.send('API is running...')
})


app.listen(port , () =>{
    console.log(`App listening on port ${port}`);
})