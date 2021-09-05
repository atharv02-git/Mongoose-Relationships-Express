const mongoose = require('mongoose');
const Product = require('./product')
const { Schema } = mongoose;

const farmSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Farm must have a name']
    },
    city: {
        type: String
    },
    email: {
        type: String
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }]
});

farmSchema.post('findOneAndDelete', async function(farm) {
    // We are looking on an array i.e products: [12232adasd,213123asdasd,3903asdasd] and deleting products from this array
    if (farm.products.length) {
        const res = await Product.deleteMany({ _id: { $in: farm.products } })
            // deleting all products assosciated by id in farm.products array
        console.log(res);
    }
})

const Farm = mongoose.model('Farm', farmSchema);
module.exports = Farm;