# Hot n' Sweet Italian Pizzeria - README

## Overview

Hot n' Sweet Italian Pizzeria is a web application for a pizzeria that allows customers to browse the menu and administrators to manage menu items. The application features a user-friendly interface for customers to view menu items by category and a secure admin panel for managing the menu.

## Features

### Customer Facing

- Browse menu items by category (Pizza, Pasta, Salad, Dessert, Drink)
- View detailed information about each menu item
- Responsive design for optimal viewing on all devices
- About and Contact pages

### Admin Panel

- Secure login with JWT authentication
- Dashboard to view all menu items
- Add, edit, and delete menu items
- Image upload for menu items
- User registration for admin access

## Technologies Used

### Backend

- Node.js
- Express.js
- MongoDB (with Mongoose ODM)
- JSON Web Tokens (JWT) for authentication
- Bcrypt for password hashing
- Multer for file uploads
- Express Session for session management

### Frontend

- EJS templating engine
- HTML5, CSS3
- JavaScript (for interactive elements)

### Development Tools

- Dotenv for environment variables
- Method-override for HTTP verb support
- Connect-mongo for session storage

## Installation

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd pizzeria-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the application:

   ```bash
   npm start
   ```

5. Access the application at `http://localhost:5000`

## File Structure

```
pizzeria-app/
├── server/
│   ├── config/
│   │   └── db.js           # Database connection
│   ├── helpers/
│   │   └── routeHelpers.js  # Route helper functions
│   ├── models/
│   │   ├── Post.js          # Menu item model
│   │   └── User.js          # User model
│   └── routes/
│       ├── admin.js         # Admin routes
│       └── main.js          # Main customer routes
├── public/                  # Static files
│   ├── css/
│   ├── js/
│   └── uploads/             # Uploaded images
├── views/
│   ├── layouts/
│   │   └── main.ejs         # Main layout
│   ├── partials/            # Reusable components
│   ├── admin/               # Admin views
│   └── customer/            # Customer views
├── app.js                   # Main application file
└── .env.example             # Environment variables example
```

## Usage

### Customer Interface

- Visit the homepage to browse all menu items
- Use the category tabs to filter menu items
- Click on any item to view detailed information

### Admin Interface

1. Access the admin login page at `/admin`
2. Log in with valid credentials
3. Dashboard:
   - View all menu items
   - Add new items using the "Add Post" button
   - Edit existing items by clicking the edit button
   - Delete items by clicking the delete button

## API Endpoints

### Customer Routes

- `GET /` - Homepage with menu items
- `GET /post/:id` - View a specific menu item
- `POST /search` - Search for menu items
- `GET /about` - About page
- `GET /contact` - Contact page

### Admin Routes

- `GET /admin` - Admin login page
- `POST /admin` - Admin login
- `GET /dashboard` - Admin dashboard (requires auth)
- `GET /add-post` - Add new menu item form (requires auth)
- `POST /add-post` - Create new menu item (requires auth)
- `GET /edit-post/:id` - Edit menu item form (requires auth)
- `PUT /edit-post/:id` - Update menu item (requires auth)
- `DELETE /delete-post/:id` - Delete menu item (requires auth)
- `POST /register` - Register new admin user
- `GET /logout` - Logout admin user

## Security Features

- Password hashing with bcrypt
- JWT authentication for admin routes
- Secure cookie settings
- Session management with MongoDB storage
- Input sanitization for search functionality

## Customization

To customize the application:

1. Update menu categories in `server/models/Post.js`
2. Modify the styling in the `public/css` directory
3. Change the layout in the `views/layouts` directory
4. Update environment variables as needed

## Troubleshooting

- **Database connection issues**: Verify your MongoDB URI in the `.env` file
- **Image upload problems**: Ensure the `public/uploads` directory exists and has proper permissions
- **Authentication failures**: Check JWT secret and cookie settings

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For support or questions, please contact the development team at [hotnsweet2022@gmail.com].
# hot-n-spicy
# hotnspicy
