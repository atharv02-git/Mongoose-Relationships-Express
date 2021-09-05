const express = require('express');
const methodOverride = require('method-override')
const app = express();
const path = require('path')
const Product = require('./models/product');
const Farm = require('./models/farm');


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/farmStandRelationship', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB!!!")
    })
    .catch(err => {
        console.log("Error connecting to MongoDB")
        console.log(err)
    })

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

app.use(express.urlencoded({ extended: true }));
// It is necessary so that user can create new post
app.use(methodOverride('_method'))

// setting Categories array
const categories = ['fruit', 'vegetable', 'dairy']

// Farm Routes
// Create new post
app.get('/farms', async(req, res) => {
    const farms = await Farm.find({});
    res.render('farms/index', { farms })
})

app.get('/farms/new', (req, res) => {
    res.render('farms/new');
})

app.post('/farms', async(req, res) => {
    const farm = new Farm(req.body);
    await farm.save();
    res.redirect('/farms');
})

// Deleting products and farm using mongoose middleware
app.delete('/farms/:id', async(req, res) => {
    const farm = await Farm.findByIdAndDelete(req.params.id);
    res.redirect('/farms');
})

// creating products for a farm 
app.get('/farms/:id', async(req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id).populate('products');
    res.render('farms/show', { farm })
})

app.get('/farms/:id/products/new', async(req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    res.render('products/new', { categories, farm })
})

app.post('/farms/:id/products', async(req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    const { name, price, category } = req.body;
    const product = new Product({ name, price, category });
    farm.products.push(product);
    product.farm = farm;
    await farm.save();
    await product.save();
    res.redirect(`/farms/${id}`)
})

// Product Routes


// render home page
app.get('/products', async(req, res) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category })
            // Find all products related to category and then render them
        res.render('products/index', { products, category })
    } else {
        const products = await Product.find({})
        res.render('products/index', { products, category: 'All' })
    }
})

//To create new post 
app.get('/products/new', (req, res) => {
    res.render('products/new', { categories })
})

app.post('/products', async(req, res) => {
    // To make new product
    const newProduct = new Product(req.body)
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`)
})


// To show product details wrt id page
app.get('/products/:id', async(req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate('farm', 'name');
    console.log(product)
    res.render('products/show', { product })
})

// To update any products
app.get('/products/:id/edit', async(req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product, categories })
})

// Creating an endpoint that will submit our updated form
app.put('/products/:id', async(req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/products/${product._id}`);
})

// Deleting a Product
app.delete('/products/:id', async(req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.redirect('/products')
})

app.listen(3000, () => {
    console.log('Listening on port 3000!!')
})