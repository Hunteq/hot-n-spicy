const express= require('express');
const router= express.Router();
const Post= require('../models/Post');
const Category = require('../models/Category');

/**
 * GET /
 * HOME
*/

router.get('', async (req, res) => {
  try {
      const locals = {
          title: "Hot n Spicy",
          description: "The Best Place To Satisfy Your Tummy"
      }

      // Check if category filter is applied
      const categoryFilter = req.query.category;
      
      let query = {};
       if (categoryFilter && categoryFilter !== 'all') {
        query.category = categoryFilter;
      }

      let perPage = 6;
      let page = req.query.page || 1;

      const data = await Post.find(query)
          .populate('category')
          .sort({ createdAt: -1 })
          .skip(perPage * page - perPage)
          .limit(perPage)
          .exec();

      const count = await Post.countDocuments(query);
      const nextPage = parseInt(page) + 1;
      const hasNextPage = nextPage <= Math.ceil(count / perPage);

      const categories = await Category.find().sort({ name: 1 });

      res.render('index', {
          locals,
          data,
          categories,
          current: page,
          nextPage: hasNextPage ? nextPage : null,
          currentRoute: '/',
          currentCategory: categoryFilter || 'all'
      });
  } catch (error) {
      console.log(error);
  }
});

/**
 * GET /
 * Post :id
*/

router.get('/post/:id', async(req, res)=> {
  try{
      let slug = req.params.id;
      const data = await Post.findById({ _id: slug }).populate('category');

      const locals={
          title: data.name,
          description: "The Best Place To Satisfy Your Tummy"
      }

      // let isLiked = false;
      // let userRating = 0;
      
      // if (req.cookies.token) {
      //     try {
      //         const decoded = jwt.verify(req.cookies.token, jwtSecret);
      //         isLiked = data.likes.includes(decoded.userId);
              
      //         // Get user's rating
      //         const userRatingObj = data.ratings.find(r => r.user.toString() === decoded.userId.toString());
      //         if (userRatingObj) {
      //             userRating = userRatingObj.value;
      //         }
      //     } catch (error) {
      //         // Token is invalid, treat as not logged in
      //     }
      // }

      res.render('post', {
          locals,
          data,
          // isLiked,
          // userRating,
          currentRoute: `/post/${slug}`
      });
  }catch(error){
      console.log(error);  
  } 
});

/**
 * POST /
 * Post - searchTerm
*/

router.post('/search', async (req, res) => {
    try {
      const locals = {
        title: "Search",
        description: "Search our delicious menu items"
      }
  
      let searchTerm = req.body.searchTerm;
      const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
  
      const data = await Post.find({
        $or: [
          { name: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
          { description: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
          { 'category.name': { $regex: new RegExp(searchNoSpecialChar, 'i') }}
        ]
      }).populate('category');
  
      res.render("search", {
        data,
        locals,
        searchTerm,
        currentRoute: '/search'
      });
 
    } catch (error) {
      console.log(error);
    }
});
  
/**
 * GET /
 * About
*/

router.get('/about', (req, res) => {
    res.render('about', {
      currentRoute: '/about'
    });
});

/**
 * GET /
 * Contact
*/

router.get('/contact', (req, res) => {
    res.render('contact', {
      currentRoute: '/contact'
    });
});

/**
 * GET /
 * Offline Page
*/
router.get('/offline', (req, res) => {
    res.render('offline');
});

module.exports = router;