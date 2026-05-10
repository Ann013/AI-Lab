const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const validator = require('validator');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
//app.use(express.static(path.join(__dirname, 'build')));
app.use('/images', express.static(path.join(__dirname, 'images')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ai_art_companion'
});

db.connect(() => {
  console.log('Connected to MySQL database');
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS user_profile (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(255),
      bio TEXT,
      location VARCHAR(255),
      website VARCHAR(255),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS artwork (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      artwork_count INT DEFAULT 0,
      total_likes INT DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS image (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      img_url VARCHAR(500),
      upload_status VARCHAR(100),
      likes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`
  ];

  tables.forEach(query => db.query(query));
});

const validateSignupData = (name, email, password) => {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!email || !validator.isEmail(email)) errors.email = 'Invalid email';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
  return { isValid: Object.keys(errors).length === 0, errors };
};

app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const validation = validateSignupData(name, email, password);
  if (!validation.isValid) return res.status(400).json({ success: false, errors: validation.errors });

  const cleanName = name.trim();
  const cleanEmail = email.toLowerCase().trim();

  // Check if email exists
  const [existing] = await new Promise(resolve => 
    db.query('SELECT user_id FROM users WHERE email = ?', [cleanEmail], (err, results) => resolve(results || []))
  );
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 12);
  
  db.beginTransaction(() => {
    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [cleanName, cleanEmail, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Registration failed' });
      
      const userId = result.insertId;
      db.query('INSERT INTO user_profile (user_id, name) VALUES (?, ?)', [userId, cleanName]);
      db.query('INSERT INTO artwork (user_id) VALUES (?)', [userId]);
      db.commit();
      res.status(201).json({ success: true, message: 'Account created' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({ success: true, message: 'Login successful', user: { user_id: user.user_id, name: user.name, email: user.email } });
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(__dirname, 'images', req.body.user_id);
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post('/api/generate-image-record', upload.single('image'), (req, res) => {
  const { user_id } = req.body;
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const img_url = `/images/${user_id}/${req.file.filename}`;
  
  db.query('INSERT INTO image (user_id, img_url, upload_status) VALUES (?, ?, "generated")', [user_id, img_url]);
  db.query('UPDATE artwork SET artwork_count = artwork_count + 1 WHERE user_id = ?', [user_id]);
  
  res.json({ success: true, message: 'Image recorded', img_url });
});

app.post('/api/upload-image-file', upload.single('image'), (req, res) => {
  const { user_id } = req.body;
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const img_url = `/images/${user_id}/${req.file.filename}`;
  db.query('INSERT INTO image (user_id, img_url, upload_status) VALUES (?, ?, "uploaded")', [user_id, img_url]);
  res.json({ success: true, img_url });
});

app.post('/api/mark-uploaded', (req, res) => {
  const { image_id } = req.body;
  if (!image_id) return res.status(400).json({ success: false, message: 'Image ID required' });
  
  db.query('UPDATE image SET upload_status = ? WHERE id = ?', ['uploaded', image_id]);
  res.json({ success: true, message: 'Image marked as uploaded' });
});

app.post('/api/like-image', (req, res) => {
  const { image_id } = req.body;
  if (!image_id) return res.status(400).json({ success: false, message: 'Image ID required' });

  db.query('UPDATE image SET likes = likes + 1 WHERE id = ?', [image_id]);
  res.json({ success: true, message: 'Image liked' });
});

app.get('/api/community-stats', (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(DISTINCT user_id) FROM users) AS total_users,
      (SELECT COUNT(*) FROM image) AS total_images,
      (SELECT SUM(likes) FROM image) AS total_likes,
      (SELECT COUNT(*) FROM image WHERE upload_status = 'uploaded') AS total_uploads
  `;
  db.query(query, (err, results) => {
    res.json({ success: true, stats: results[0] });
  });
});

app.get('/api/recent-artworks', (req, res) => {
  const limit = parseInt(req.query.limit) || 12;
  const query = `
    SELECT i.id, i.img_url, i.upload_status, i.likes, i.created_at, u.name as user_name
    FROM image i
    JOIN users u ON i.user_id = u.user_id
    WHERE i.upload_status = 'uploaded'
    ORDER BY i.created_at DESC
    LIMIT ?
  `;
  db.query(query, [limit], (err, results) => {
    res.json({ success: true, artworks: results });
  });
});



app.get('/api/gallery-images', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const query = `
    SELECT i.id, i.img_url, i.likes, i.created_at, u.name as user_name
    FROM image i
    JOIN users u ON i.user_id = u.user_id
    WHERE i.upload_status = 'uploaded'
    ORDER BY i.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  db.query(query, [limit, offset], (err, images) => {
    db.query('SELECT COUNT(*) as total FROM image WHERE upload_status = "uploaded"', (err, countResult) => {
      const total = countResult[0].total;
      res.json({
        success: true,
        images,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalImages: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    });
  });
});



app.post('/api/edit-artwork', (req, res) => {
    const { artwork_id, user_id , edit_settings } = req.body;

    if (!artwork_id || !user_id || !edit_settings) {
        return res.status(400).json({ success: false, message: 'Artwork ID, user ID, and edit settings are required' });
    }

    db.query('SELECT img_url FROM image WHERE id = ? AND user_id = ?', [artwork_id, user_id], (err, rows) => {
        if (err) {
            console.error('Error getting image from DB:', err);
            return res.status(500).json({ success: false, message: 'Failed to get image from database' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Artwork not found' });
        }

        const originalImagePath = path.join(__dirname, rows[0].img_url);

        const userDir = path.join(__dirname, 'images', user_id.toString());
        fs.mkdirSync(userDir, { recursive: true });
        const newFilename = `${Date.now()}.png`;
        const newFilePath = path.join(userDir, newFilename);
        const newFileUrl = `/images/${user_id}/${newFilename}`;;

        let image = sharp(originalImagePath);

        if (edit_settings.brightness) {
            image = image.modulate({ brightness: (edit_settings.brightness / 100) * 0.5 + 1 });
        }
        if (edit_settings.saturation) {
            image = image.modulate({ saturation: (edit_settings.saturation / 100) + 1 });
        }
        if (edit_settings.contrast) {
            image = image.linear(edit_settings.contrast / 100 + 1, 0);
        }
        if (edit_settings.temperature) {
            const t = edit_settings.temperature / 100;
            image = image.recomb([
                [1 + 0.1 * t, 0, 0],
                [0, 1, 0],
                [0, 0, 1 - 0.1 * t]
            ]);
        }
        
        image.toFile(newFilePath, (err, info) => {
            if (err) {
                console.error('Error saving edited image:', err);
                return res.status(500).json({ success: false, message: 'Failed to save edited image' });
            }

            const insertQuery = 'INSERT INTO image (user_id, img_url, upload_status) VALUES (?, ?, "edited")';
            const updateQuery = 'UPDATE artwork SET artwork_count = artwork_count + 1 WHERE user_id = ?';

            db.beginTransaction(err => {
                if (err) {
                    console.error('Transaction error:', err);
                    return res.status(500).json({ success: false, message: 'Transaction error' });
                }

                db.query(insertQuery, [user_id, newFileUrl], (err, result) => {
                    if (err) {
                        console.error('Insert failed:', err);
                        return db.rollback(() => res.status(500).json({ success: false, message: 'Insert failed' }));
                    }

                    const newImageId = result.insertId;

                    db.query(updateQuery, [user_id], (err) => {
                        if (err) {
                            console.error('Update failed:', err);
                            return db.rollback(() => res.status(500).json({ success: false, message: 'Update failed' }));
                        }

                        db.commit(err => {
                            if (err) {
                                console.error('Commit failed:', err);
                                return db.rollback(() => res.status(500).json({ success: false, message: 'Commit failed' }));
                            }
                            res.status(200).json({ success: true, message: 'Artwork saved successfully', image: { id: newImageId, img_url: newFileUrl, upload_status: 'edited' } });
                        });
                    });
                });
            });
        });
    });
});

app.get('/api/uploaded-images', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const query = `
    SELECT i.id, i.img_url, i.likes, i.created_at, i.upload_status, u.name as user_name
    FROM image i
    JOIN users u ON i.user_id = u.user_id
    WHERE i.upload_status = 'uploaded'
    ORDER BY i.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  db.query(query, [limit, offset], (err, images) => {
    db.query('SELECT COUNT(*) as total FROM image WHERE upload_status = "uploaded"', (err, countResult) => {
      const total = countResult[0].total;
      res.json({
        success: true,
        images,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalImages: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    });
  });
});

app.get('/api/user-profile/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const profileQuery = `
    SELECT u.user_id, u.name, u.email, u.created_at, COUNT(i.id) as artwork_count, SUM(i.likes) as total_likes
    FROM users u
    LEFT JOIN image i ON u.user_id = i.user_id
    WHERE u.user_id = ?
    GROUP BY u.user_id
  `;
  const artworksQuery = `
    SELECT id, img_url, upload_status, likes, created_at
    FROM image
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  
  db.query(profileQuery, [userId], (err, profileResult) => {
    if (profileResult.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    
    db.query(artworksQuery, [userId], (err, artworks) => {
      res.json({ success: true, profile: profileResult[0], artworks });
    });
  });
});

// Add this new API endpoint in server.js

app.post('/api/update-profile', async (req, res) => {
  const { user_id, name, email, bio, location, website } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ success: false, message: 'User ID required' });
  }

  try {
    // Update users table
    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET name = ?, email = ? WHERE user_id = ?', [name, email, user_id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Update user_profile table
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE user_profile SET name = ?, bio = ?, location = ?, website = ? WHERE user_id = ?',
        [name, bio, location, website, user_id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Add this new API endpoint to get user profile data
app.get('/api/user-profile-data/:user_id', (req, res) => {
  const userId = req.params.user_id;
  
  const query = `
    SELECT u.name, u.email, up.bio, up.location, up.website
    FROM users u
    LEFT JOIN user_profile up ON u.user_id = up.user_id
    WHERE u.user_id = ?
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, profile: results[0] });
  });
});

app.get('/api/user-images/:user_id', (req, res) => {
  const userId = req.params.user_id;
  db.query('SELECT id, img_url, upload_status, likes, created_at FROM image WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, results) => {
    res.json({ success: true, images: results || [] });
  });
});

app.get('/api/user-stats/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM image WHERE user_id = ?) AS artwork_count,
      (SELECT SUM(likes) FROM image WHERE user_id = ?) AS total_likes
  `;
const recentQuery = `
  SELECT id, img_url, upload_status, likes, created_at
  FROM image
  WHERE user_id = ?
  ORDER BY created_at DESC
`;
  
  db.query(statsQuery, [userId, userId], (err, stats) => {
    db.query(recentQuery, [userId], (err, artworks) => {
      res.json({ 
        artwork_count: stats[0].artwork_count || 0, 
        total_likes: stats[0].total_likes || 0, 
        recent_artworks: artworks || [] 
      });
    });
  });
});

app.get('/api/users', (req, res) => {
  const query = `
    SELECT 
      u.user_id,
      u.name,
      u.email,
      u.created_at,
      COALESCE(SUM(CASE WHEN i.upload_status = 'generated' THEN 1 ELSE 0 END), 0) AS generated_count,
      COALESCE(SUM(CASE WHEN i.upload_status = 'uploaded' THEN 1 ELSE 0 END), 0) AS uploaded_count,
      COALESCE(SUM(i.likes), 0) AS total_likes
    FROM users u
    LEFT JOIN image i ON u.user_id = i.user_id
    GROUP BY u.user_id
    ORDER BY u.created_at DESC
  `;

  db.query(query, (err, results) => {
    res.json(results || []);
  });
});

app.delete('/api/delete-user/:user_id', (req, res) => {
  const userId = req.params.user_id;
  db.query('DELETE FROM users WHERE user_id = ?', [userId], (err, result) => {
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  });
});

app.patch('/api/mark-image-generated/:id', (req, res) => {
  const imageId = req.params.id;
  db.query('UPDATE image SET upload_status = "generated" WHERE id = ?', [imageId], (err, result) => {
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Image not found' });
    res.json({ success: true, message: 'Image removed from gallery' });
  });
});

app.delete('/api/delete-artwork/:id', (req, res) => {
  const artworkId = req.params.id;
  const { user_id } = req.body;

  if (!user_id) return res.status(400).json({ success: false, message: 'User ID required' });

  // Get artwork info and delete
  db.query('SELECT img_url FROM image WHERE id = ? AND user_id = ?', [artworkId, user_id], (err, results) => {
    if (results.length === 0) return res.status(404).json({ success: false, message: 'Artwork not found' });
    
    const artwork = results[0];
    db.query('DELETE FROM image WHERE id = ? AND user_id = ?', [artworkId, user_id], (deleteErr, deleteResults) => {
      if (deleteResults.affectedRows === 0) return res.status(404).json({ success: false, message: 'Delete failed' });
      
      // Delete physical file
      if (artwork.img_url) {
        const imagePath = path.join(__dirname, artwork.img_url);
        fs.unlink(imagePath, () => {});
      }
      
      res.json({ success: true, message: 'Artwork deleted successfully' });
    });
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// app.get('*', (req, res) => {
//   if (!req.path.startsWith('/api')) {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
//   } else {
//     res.status(404).json({ success: false, message: 'API route not found' });
//   }
// });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});