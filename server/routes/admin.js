const express= require('express');
const router= express.Router();
const Post= require('../models/Post');
const User= require('../models/User');
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken');
const multer= require('multer');
const path= require('path');

const adminLayout= '../views/layouts/admin';
const jwtSecret= process.env.JWT_SECRET;

// Image upload

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
const upload = multer({ storage: storage });

/**
 * 
 * Check Login
*/

const authMiddleWare = (req, res, next ) => {
    const token = req.cookies.token;
  
    if(!token) {
      return res.status(401).json( { message: 'Unauthorized'} );
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;
      next();
    } catch(error) {
      res.status(401).json( { message: 'Unauthorized'} );
    }
  }

/**
 * GET /
 * Admin - Login Page
*/

router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Hot n' Sweet Italian Pizzeria Admin Panel"
        }

        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
      console.log(error);
    }
  });

/**
 * POST /
 * Admin - Check Login
*/

  router.post('/admin', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne( { username } );
  
      if(!user) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if(!isPasswordValid) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
  
      const token = jwt.sign({ userId: user._id}, jwtSecret );
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/dashboard');
  
    } catch (error) {
      console.log(error);
    }
  });

/**
 * GET /
 * Admin Dashboard
*/

router.get('/dashboard', authMiddleWare, async (req, res) => {
    try {
      const locals = {
        title: "Dashboard",
        description: "Hot n' Sweet Italian Pizzeria Menu Management"
      }
  
      const data = await Post.find();
      res.render('admin/dashboard', {
        locals,
        data,
        layout: adminLayout
      });
  
    } catch (error) {
      console.log(error);
    }
});

/**
 * GET /
 * Admin - Create New Post
*/

router.get('/add-post', authMiddleWare, async (req, res) => {
    try {
      const locals = {
        title: 'Add Post',
        description: 'Add new item  to the menu'
      } 
      res.render('admin/add-post', {
        locals,
        layout: adminLayout
      });  
    } catch (error) {
      console.log(error);
    }
  });

/**
 * POST /
 * Admin - Create New Post
*/

router.post('/add-post', authMiddleWare, upload.single('image'), async (req, res) => {
    try {
      const { name, description, category, price } = req.body;
      const imagePath = req.file ? '/uploads/' + req.file.filename : '';
      
      const newPost = new Post({
        name,
        description,
        category,
        price: parseFloat(price),
        image: imagePath
      });
  
      await Post.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  });

  /**
 * PUT /
 * Admin - Create New Post
*/

router.put('/edit-post/:id', authMiddleWare, upload.single('image'), async (req, res) => {
    try {
      const { name, description, category, price } = req.body;
      let updateData = {
        name,
        description,
        category,
        price: parseFloat(price),
        updatedAt: Date.now()
      };
  
      if (req.file) {
        updateData.image = '/uploads/' + req.file.filename;
      }
  
      await Post.findByIdAndUpdate(req.params.id, updateData);
      res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
      console.log(error);
    }
  });

/**
 * GET /
 * Admin - Create New Post
*/

router.get('/edit-post/:id', authMiddleWare, async (req, res) => {
    try {
      const locals = {
        title: "Edit Menu Post",
        description: "Edit existing menu item",
      }; 
      const data = await Post.findOne({ _id: req.params.id });  
      res.render('admin/edit-post', {
        locals,
        data,
        layout: adminLayout
      })
  
    } catch (error) {
      console.log(error);
    }
});

/**
 * POST /
 * Admin - Register
*/

router.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
  
      try {
        const user = await User.create({ username, password:hashedPassword });
        res.status(201).json({ message: 'User Created', user });
      } catch (error) {
        if(error.code === 11000) {
          res.status(409).json({ message: 'User already in use'});
        }
        res.status(500).json({ message: 'Internal server error'})
      }
  
    } catch (error) {
      console.log(error);
    }
  });

/**
 * DELETE /
 * Admin - Delete Post
*/

router.delete('/delete-post/:id', authMiddleWare, async (req, res) => {
    try {
      await Post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
});

/**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    //res.json({ message: 'Logout successful.'});
    res.redirect('/');
  });




/**
 * POST /
 * Like a Post
 */
router.post('/like/:id', authMiddleWare, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    // Check if user already liked the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const alreadyLiked = post.likes.includes(userId);
    let likeCount = post.likeCount;

    if (alreadyLiked) {
      // Unlike the post
      await Post.findByIdAndUpdate(postId, {
        $pull: { likes: userId },
        $inc: { likeCount: -1 }
      });
      likeCount--;
    } else {
      // Like the post
      await Post.findByIdAndUpdate(postId, {
        $addToSet: { likes: userId },
        $inc: { likeCount: 1 }
      });
      likeCount++;
    }

    // Update user's likedPosts
    await User.findByIdAndUpdate(userId, {
      [alreadyLiked ? '$pull' : '$addToSet']: { likedPosts: postId }
    });

    res.json({ 
      liked: !alreadyLiked, 
      likeCount: likeCount 
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /
 * Check if user liked a post
 */
router.get('/check-like/:id', authMiddleWare, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    const liked = post.likes.includes(userId);

    res.json({ liked, likeCount: post.likeCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Server error' });
  }
});



/**
 * POST /
 * Rate a Post
 */
router.post('/rate/:id', authMiddleWare, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating value' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Initialize ratings array if it doesn't exist
    if (!post.ratings) {
      post.ratings = [];
    }

    // Check if user already rated this post
    const existingRatingIndex = post.ratings.findIndex(r => 
      r && r.user && r.user.toString() === userId.toString()
    );
    
    if (existingRatingIndex >= 0) {
      // Update existing rating
      post.ratings[existingRatingIndex].value = rating;
    } else {
      // Add new rating
      post.ratings.push({ 
        user: userId, 
        value: rating 
      });
    }

    // Calculate new average
    const sum = post.ratings.reduce((total, r) => total + r.value, 0);
    const averageRating = post.ratings.length > 0 ? sum / post.ratings.length : 0;
    const ratingCount = post.ratings.length;

    // Update the post
    await Post.findByIdAndUpdate(postId, {
      ratings: post.ratings,
      averageRating,
      ratingCount
    });

    res.json({ 
      success: true,
      averageRating,
      ratingCount,
      userRating: rating
    });
  } catch (error) {
    console.error('Error in rating post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /
 * Get user's rating for a post
 */
router.get('/user-rating/:id', authMiddleWare, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Initialize ratings array if it doesn't exist
    if (!post.ratings) {
      post.ratings = [];
    }

    // Filter out invalid ratings before searching
    const validRatings = post.ratings.filter(rating => 
      rating && 
      rating.user && 
      rating.value !== undefined
    );

    const userRating = validRatings.find(r => 
      r.user.toString() === userId.toString()
    );

    res.json({ 
      userRating: userRating ? userRating.value : 0,
      averageRating: post.averageRating || 0,
      ratingCount: post.ratingCount || 0
    });
  } catch (error) {
    console.error('Error getting user rating:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
