const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for CORS (required for AR.js and camera access)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Required headers for AR.js and camera access
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Cross-Origin-Opener-Policy', 'unsafe-none');
  
  // Camera permissions
  res.header('Permissions-Policy', 'camera=*');
  
  next();
});

// Serve static files from the current directory
app.use(express.static('.', {
  setHeaders: (res, path) => {
    // Set specific headers for different file types
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    } else if (path.endsWith('.html')) {
      res.set('Content-Type', 'text/html');
    } else if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
  }
}));

// Parse JSON bodies
app.use(express.json());

// Serve the main AR app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to get word list (for future expansion)
app.get('/api/words', (req, res) => {
  const words = ['BIKE', 'TREE', 'STAR', 'BOOK', 'FISH', 'MOON'];
  res.json({ words });
});

// API endpoint to get current word
app.get('/api/current-word', (req, res) => {
  const currentWord = 'BIKE';
  res.json({ word: currentWord, letters: currentWord.split('') });
});

// API endpoint to save game progress (for future use)
app.post('/api/progress', (req, res) => {
  const { word, captured, score } = req.body;
  
  // Here you could save to a database
  console.log('Game progress:', { word, captured, score });
  
  res.json({ 
    success: true, 
    message: 'Progress saved',
    timestamp: new Date().toISOString()
  });
});

// API endpoint to get game statistics
app.get('/api/stats', (req, res) => {
  // Mock statistics - replace with real data from database
  const stats = {
    totalGames: 42,
    wordsCompleted: 38,
    averageTime: '2:45',
    mostFoundWord: 'BIKE',
    lastPlayed: new Date().toISOString()
  };
  
  res.json(stats);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Development route to list all files (remove in production)
app.get('/dev/files', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const files = [];
  
  function scanDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const itemRelativePath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath, itemRelativePath);
      } else if (stat.isFile()) {
        files.push({
          name: item,
          path: itemRelativePath,
          size: stat.size,
          modified: stat.mtime
        });
      }
    });
  }
  
  try {
    scanDirectory('.');
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AR Scavenger Hunt server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
  console.log(`🔗 For mobile testing, use your computer's IP address`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  // Display local IP addresses for mobile testing
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  
  console.log('\n📱 Mobile testing URLs:');
  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`   http://${iface.address}:${PORT}`);
      }
    });
  });
  
  console.log('\n💡 Make sure your mobile device is on the same WiFi network!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});