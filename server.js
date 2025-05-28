const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const app = express();

const JWT_SECRET = 'sum_secret_key_from_env_but_right_now_i_doo_not_care';

app.use(express.json());
app.use(cors({
    origin: "*" 
}));


const mockUser = {
    id: 1,
    email: 'jane.doe@example.com',
    password: 'password123', 
    name: 'Jane Doe',
    avatarUrl: 'https://i.pravatar.cc/150?img=57'
};


app.post('/api/auth-token', (req, res) => {
    const { email, password } = req.body;

    if (email === mockUser.email && password === mockUser.password) {
        const token = jwt.sign({ userid: mockUser.id }, JWT_SECRET, {
            expiresIn: '1h',
        });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});


function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ error: 'Token required' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        req.user = decoded;
        next();
    });
}


app.get('/api/profile', authenticateToken, (req, res) => {
    if (req.user.userid === mockUser.id) {
        res.json({
            name: mockUser.name,
            email: mockUser.email,
            avatarUrl: mockUser.avatarUrl
        });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});


// Read projects data
const projectsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'projects.json'), 'utf8')
);

// API Routes
app.get('/api/projects', authenticateToken, (req, res) => {
  res.json(projectsData.projects);
});

// API Routes
app.get('/api/projects/:id', authenticateToken, (req, res) => {
  const project = projectsData.projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});


app.get("/", (req, res) => {
    res.send("Hello World");
})


// Export for Vercel 
module.exports = app;
