const express= require('express');
const router= express.Router();
const Post= require('../models/Post');

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
      const category = req.query.category;
      
      let query = {};
      if (category && category !== 'all') {
          query.category = category;
      }

      let perPage = 6;
      let page = req.query.page || 1;

      const data = await Post.find(query)
          .sort({ createdAt: -1 })
          .skip(perPage * page - perPage)
          .limit(perPage)
          .exec();

      const count = await Post.countDocuments(query);
      const nextPage = parseInt(page) + 1;
      const hasNextPage = nextPage <= Math.ceil(count / perPage);

      res.render('index', {
          locals,
          data,
          current: page,
          nextPage: hasNextPage ? nextPage : null,
          currentRoute: '/',
          currentCategory: category || 'all'
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
      const data = await Post.findById({ _id: slug });

      const locals={
          title: data.name,
          description: "The Best Place To Satisfy Your Tummy"
      }

      let isLiked = false;
      let userRating = 0;
      
      if (req.cookies.token) {
          try {
              const decoded = jwt.verify(req.cookies.token, jwtSecret);
              isLiked = data.likes.includes(decoded.userId);
              
              // Get user's rating
              const userRatingObj = data.ratings.find(r => r.user.toString() === decoded.userId.toString());
              if (userRatingObj) {
                  userRating = userRatingObj.value;
              }
          } catch (error) {
              // Token is invalid, treat as not logged in
          }
      }

      res.render('post', {
          locals,
          data,
          isLiked,
          userRating,
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
          { category: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
        ]
      });
  
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

module.exports = router;