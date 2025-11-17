const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  // category: {
  //   type: String,
  //   required: true,
  //   enum: ['Veg Pizza', 'Non-Veg Pizza', 'Pasta', 'Salad', 'Starters', 'Dessert', 'Sandwich', 'Milkshakes', 'Beverages']
  // },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

});


module.exports = mongoose.model('Post', PostSchema);