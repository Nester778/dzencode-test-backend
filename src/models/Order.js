import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true
    },
    symbol: {
        type: String,
        required: true,
        enum: ['USD', 'UAH', 'EUR']
    },
    isDefault: {
        type: Boolean,
        default: false
    }
});

const guaranteeSchema = new mongoose.Schema({
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    }
});

const productSchema = new mongoose.Schema({
    serialNumber: {
        type: Number,
        required: true
    },
    isNew: {
        type: Boolean,
        default: true
    },
    photo: {
        type: String,
        default: 'pathToFile.jpg'
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    specification: {
        type: String,
        required: true
    },
    guarantee: {
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        }
    },
    price: [{
        value: {
            type: Number,
            required: true
        },
        symbol: {
            type: String,
            required: true
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const orderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        default: '',
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

orderSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'order'
});

orderSchema.methods.calculateTotal = function() {
    if (!this.products) return { USD: 0, UAH: 0 };

    return this.products.reduce((total, product) => {
        product.price.forEach(price => {
            total[price.symbol] = (total[price.symbol] || 0) + price.value;
        });
        return total;
    }, { USD: 0, UAH: 0 });
};

export const Order = mongoose.model('Order', orderSchema);
export const Product = mongoose.model('Product', productSchema);