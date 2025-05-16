const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RatingSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, { _id: false });

const PostSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    enum: ['Veg Pizza', 'Non-Veg Pizza', 'Pasta', 'Salad', 'Starters', 'Dessert', 'Sandwich', 'Milkshakes', 'Beverages']
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
  likeCount: {
    type: Number,
    default: 0
  },
  ratings: [RatingSchema],
  averageRating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average rating before saving
PostSchema.pre('save', function(next) {
  // Filter out any invalid ratings before calculation
  this.ratings = this.ratings.filter(rating => 
    rating && 
    rating.user && 
    rating.value !== undefined && 
    rating.value >= 1 && 
    rating.value <= 5
  );

  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((total, rating) => total + rating.value, 0);
    this.averageRating = sum / this.ratings.length;
    this.ratingCount = this.ratings.length;
  } else {
    this.averageRating = 0;
    this.ratingCount = 0;
  }
  next();
});

module.exports = mongoose.model('Post', PostSchema);