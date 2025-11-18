// const express= require('express');
// const router= express.Router();
// const Post= require('../models/Post');
// const Category = require('../models/Category');
// const User= require('../models/User');
// const bcrypt= require('bcrypt');
// const jwt= require('jsonwebtoken');
// const multer= require('multer');
// const path= require('path');

// const adminLayout= '../views/layouts/admin';
// const jwtSecret= process.env.JWT_SECRET;

// // Image upload

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//       cb(null, path.join(__dirname, '../../public/uploads'));
//     },
//     filename: function(req, file, cb) {
//       cb(null, Date.now() + '-' + file.originalname);
//     }
//   });
  
// const upload = multer({ storage: storage });

// /**
//  * 
//  * Check Login
// */

// const authMiddleWare = (req, res, next ) => {
//     const token = req.cookies.token;
  
//     if(!token) {
//       return res.status(401).json( { message: 'Unauthorized'} );
//     }
  
//     try {
//       const decoded = jwt.verify(token, jwtSecret);
//       req.userId = decoded.userId;
//       next();
//     } catch(error) {
//       res.status(401).json( { message: 'Unauthorized'} );
//     }
//   }

// /**
//  * GET /
//  * Admin - Login Page
// */

// router.get('/admin', async (req, res) => {
//     try {
//         const locals = {
//             title: "Admin",
//             description: "Hot n' Sweet Italian Pizzeria Admin Panel"
//         }

//         res.render('admin/index', { locals, layout: adminLayout });
//     } catch (error) {
//       console.log(error);
//     }
//   });

// /**
//  * POST /
//  * Admin - Check Login
// */

//   router.post('/admin', async (req, res) => {
//     try {
//       const { username, password } = req.body;
      
//       const user = await User.findOne( { username } );
  
//       if(!user) {
//         return res.status(401).json( { message: 'Invalid credentials' } );
//       }
  
//       const isPasswordValid = await bcrypt.compare(password, user.password);
  
//       if(!isPasswordValid) {
//         return res.status(401).json( { message: 'Invalid credentials' } );
//       }
  
//       const token = jwt.sign({ userId: user._id}, jwtSecret );
//       res.cookie('token', token, { httpOnly: true });
//       res.redirect('/dashboard');
  
//     } catch (error) {
//       console.log(error);
//     }
//   });

// /**
//  * GET /
//  * Admin Dashboard
// */

// router.get('/dashboard', authMiddleWare, async (req, res) => {
//     try {
//       const locals = {
//         title: "Dashboard",
//         description: "Hot n' Sweet Italian Pizzeria Menu Management"
//       }
  
//       const data = await Post.find().populate('category');
//       res.render('admin/dashboard', {
//         locals,
//         data,
//         layout: adminLayout
//       });
  
//     } catch (error) {
//       console.log(error);
//     }
// });

// /**
//  * GET /
//  * Admin - Create New Post
// */

// router.get('/add-post', authMiddleWare, async (req, res) => {
//     try {
//       const locals = {
//         title: 'Add Post',
//         description: 'Add new item  to the menu'
//       } 
//       const categories = await Category.find().sort({ name: 1 });
//       res.render('admin/add-post', {
//         locals,
//         categories,
//         layout: adminLayout
//       });  
//     } catch (error) {
//       console.log(error);
//     }
//   });

// /**
//  * POST /
//  * Admin - Create New Post
// */

// router.post('/add-post', authMiddleWare, upload.single('image'), async (req, res) => {
//     try {
//       const { name, description, category, price } = req.body;
//       const imagePath = req.file ? '/uploads/' + req.file.filename : '';
      
//       const newPost = new Post({
//         name,
//         description,
//         category,
//         price: parseFloat(price),
//         image: imagePath
//       });
  
//       await Post.create(newPost);
//       res.redirect('/dashboard');
//     } catch (error) {
//       console.log(error);
//     }
//   });

//   /**
//  * PUT /
//  * Admin - Create New Post
// */

// router.put('/edit-post/:id', authMiddleWare, upload.single('image'), async (req, res) => {
//     try {
//       const { name, description, category, price } = req.body;
//       const categoryExists = await Category.findById(category);
//       if (!categoryExists) {
//         return res.status(400).send('Invalid category');
//       }
//       let updateData = {
//         name,
//         description,
//         category,
//         price: parseFloat(price),
//         updatedAt: Date.now()
//       };
  
//       if (req.file) {
//         updateData.image = '/uploads/' + req.file.filename;
//       }
  
//       await Post.findByIdAndUpdate(req.params.id, updateData);
//       res.redirect(`/edit-post/${req.params.id}`);
//     } catch (error) {
//       console.log(error);
//     }
//   });

// /**
//  * GET /
//  * Admin - Create New Post
// */

// router.get('/edit-post/:id', authMiddleWare, async (req, res) => {
//     try {
//       const locals = {
//         title: "Edit Menu Post",
//         description: "Edit existing menu item",
//       }; 
//       const data = await Post.findOne({ _id: req.params.id }).populate('category');
//       const categories = await Category.find().sort({ name: 1 });
//       if (!data.category) {
//         data.category = { _id: null };
//       }
//       res.render('admin/edit-post', {
//         locals,
//         data,
//         categories,
//         layout: adminLayout
//       })
  
//     } catch (error) {
//       console.log(error);
//     }
// });

// /**
//  * POST /
//  * Admin - Register
// */

// router.post('/register', async (req, res) => {
//     try {
//       const { username, password } = req.body;
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       try {
//         const user = await User.create({ username, password:hashedPassword });
//         res.status(201).json({ message: 'User Created', user });
//       } catch (error) {
//         if(error.code === 11000) {
//           res.status(409).json({ message: 'User already in use'});
//         }
//         res.status(500).json({ message: 'Internal server error'})
//       }
  
//     } catch (error) {
//       console.log(error);
//     }
//   });

// /**
//  * DELETE /
//  * Admin - Delete Post
// */

// router.delete('/delete-post/:id', authMiddleWare, async (req, res) => {
//     try {
//       await Post.deleteOne( { _id: req.params.id } );
//       res.redirect('/dashboard');
//     } catch (error) {
//       console.log(error);
//     }
// });

// /**
//  * GET /
//  * Admin Logout
// */
// router.get('/logout', (req, res) => {
//     res.clearCookie('token');
//     //res.json({ message: 'Logout successful.'});
//     res.redirect('/');
//   });

// /**
//  * GET /
//  * Admin - Categories Management
//  */
// router.get('/categories', authMiddleWare, async (req, res) => {
//   try {
//     const locals = {
//       title: "Manage Categories",
//       description: "Manage menu categories"
//     }

//     const data = await Category.find().sort({ createdAt: -1 });
//     res.render('admin/categories', {
//       locals,
//       data,
//       layout: adminLayout
//     });

//   } catch (error) {
//     console.log(error);
//   }
// });

// /**
//  * GET /
//  * Admin - Add New Category
//  */
// router.get('/add-category', authMiddleWare, async (req, res) => {
//   try {
//     const locals = {
//       title: 'Add Category',
//       description: 'Add new menu category'
//     }
//     res.render('admin/add-category', {
//       locals,
//       layout: adminLayout
//     });  
//   } catch (error) {
//     console.log(error);
//   }
// });

// /**
//  * POST /
//  * Admin - Create New Category
//  */
// router.post('/add-category', authMiddleWare, async (req, res) => {
//   try {
//     const { name, description } = req.body;
    
//     const newCategory = new Category({
//       name,
//       description
//     });

//     await Category.create(newCategory);
//     res.redirect('/categories');
//   } catch (error) {
//     console.log(error);
//   }
// });

// /**
//  * GET /
//  * Admin - Edit Category
//  */
// router.get('/edit-category/:id', authMiddleWare, async (req, res) => {
//   try {
//     const locals = {
//       title: "Edit Category",
//       description: "Edit menu category",
//     }; 
//     const data = await Category.findOne({ _id: req.params.id });  
//     res.render('admin/edit-category', {
//       locals,
//       data,
//       layout: adminLayout
//     })

//   } catch (error) {
//     console.log(error);
//   }
// });

// /**
//  * PUT /
//  * Admin - Update Category
//  */
// router.put('/edit-category/:id', authMiddleWare, async (req, res) => {
//   try {
//     const { name, description } = req.body;
    
//     await Category.findByIdAndUpdate(req.params.id, {
//       name,
//       description,
//       updatedAt: Date.now()
//     });
    
//     res.redirect('/categories');
//   } catch (error) {
//     console.log(error);
//   }
// });

// /**
//  * DELETE /
//  * Admin - Delete Category
//  */
// router.delete('/delete-category/:id', authMiddleWare, async (req, res) => {
//   try {
//     // Check if any posts are using this category
//     const postsWithCategory = await Post.countDocuments({ category: req.params.id });
    
//     if (postsWithCategory > 0) {
//       return res.status(400).json({ message: 'Cannot delete category with associated posts' });
//     }
    
//     await Category.deleteOne({ _id: req.params.id });
//     res.redirect('/categories');
//   } catch (error) {
//     console.log(error);
//   }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Category = require('../models/Category');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hot-n-spicy',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: (req, file) => {
      return Date.now() + '-' + Math.round(Math.random() * 1E9);
    },
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Check Login
 */
const authMiddleWare = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
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

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
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

        const data = await Post.find().populate('category');
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
            description: 'Add new item to the menu'
        }
        const categories = await Category.find().sort({ name: 1 });
        res.render('admin/add-post', {
            locals,
            categories,
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
        const imagePath = req.file ? req.file.path : '';

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
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
});

/**
 * PUT /
 * Admin - Update Post
 */
router.put('/edit-post/:id', authMiddleWare, upload.single('image'), async (req, res) => {
    try {
        const { name, description, category, price } = req.body;
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).send('Invalid category');
        }
        let updateData = {
            name,
            description,
            category,
            price: parseFloat(price),
            updatedAt: Date.now()
        };

        if (req.file) {
            updateData.image = req.file.path;
        }

        await Post.findByIdAndUpdate(req.params.id, updateData);
        res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating post', error: error.message });
    }
});

/**
 * GET /
 * Admin - Edit Post
 */
router.get('/edit-post/:id', authMiddleWare, async (req, res) => {
    try {
        const locals = {
            title: "Edit Menu Post",
            description: "Edit existing menu item",
        };
        const data = await Post.findOne({ _id: req.params.id }).populate('category');
        const categories = await Category.find().sort({ name: 1 });
        if (!data.category) {
            data.category = { _id: null };
        }
        res.render('admin/edit-post', {
            locals,
            data,
            categories,
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
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'User Created', user });
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User already in use' });
            }
            res.status(500).json({ message: 'Internal server error' })
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
        // Delete image from Cloudinary if exists
        const post = await Post.findById(req.params.id);
        if (post.image) {
            const publicId = post.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`hot-n-spicy/${publicId}`);
        }

        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
});

/**
 * GET /
 * Admin Logout
 */
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

/**
 * GET /
 * Admin - Categories Management
 */
router.get('/categories', authMiddleWare, async (req, res) => {
    try {
        const locals = {
            title: "Manage Categories",
            description: "Manage menu categories"
        }

        const data = await Category.find().sort({ createdAt: -1 });
        res.render('admin/categories', {
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
 * Admin - Add New Category
 */
router.get('/add-category', authMiddleWare, async (req, res) => {
    try {
        const locals = {
            title: 'Add Category',
            description: 'Add new menu category'
        }
        res.render('admin/add-category', {
            locals,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

/**
 * POST /
 * Admin - Create New Category
 */
router.post('/add-category', authMiddleWare, async (req, res) => {
    try {
        const { name, description } = req.body;

        const newCategory = new Category({
            name,
            description
        });

        await Category.create(newCategory);
        res.redirect('/categories');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
});

/**
 * GET /
 * Admin - Edit Category
 */
router.get('/edit-category/:id', authMiddleWare, async (req, res) => {
    try {
        const locals = {
            title: "Edit Category",
            description: "Edit menu category",
        };
        const data = await Category.findOne({ _id: req.params.id });
        res.render('admin/edit-category', {
            locals,
            data,
            layout: adminLayout
        })

    } catch (error) {
        console.log(error);
    }
});

/**
 * PUT /
 * Admin - Update Category
 */
router.put('/edit-category/:id', authMiddleWare, async (req, res) => {
    try {
        const { name, description } = req.body;

        await Category.findByIdAndUpdate(req.params.id, {
            name,
            description,
            updatedAt: Date.now()
        });

        res.redirect('/categories');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating category', error: error.message });
    }
});

/**
 * DELETE /
 * Admin - Delete Category
 */
router.delete('/delete-category/:id', authMiddleWare, async (req, res) => {
    try {
        // Check if any posts are using this category
        const postsWithCategory = await Post.countDocuments({ category: req.params.id });

        if (postsWithCategory > 0) {
            return res.status(400).json({ message: 'Cannot delete category with associated posts' });
        }

        await Category.deleteOne({ _id: req.params.id });
        res.redirect('/categories');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
});

module.exports = router;