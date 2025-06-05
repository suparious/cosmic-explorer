# Claude Opus 4 Tool Usage Examples

## Sequential Thinking Example - Building a Web Scraper

```
User: "Build a web scraper for product prices"

Sequential Thinking Process:
1. Thought 1: Analyze requirements - need to scrape prices, handle pagination, store data
2. Thought 2: Design architecture - scraper module, data parser, storage handler, scheduler
3. Thought 3: Choose tools - Puppeteer for dynamic content, filesystem for storage, cron for scheduling
4. Thought 4: Plan error handling - network failures, parsing errors, rate limiting
5. Thought 5: Consider scalability - concurrent scraping, data deduplication
6. Thought 6: Implementation order - config first, then scraper, parser, storage, finally scheduler
```

## Knowledge Graph Usage Pattern

### Project Initialization
```javascript
// Create project entity
create_entities([{
  name: "TodoAPI",
  entityType: "Project",
  observations: [
    "REST API for todo management",
    "Uses Express.js and PostgreSQL",
    "Implements JWT authentication",
    "Deployed on Heroku"
  ]
}])

// Create component entities
create_entities([
  {
    name: "AuthMiddleware",
    entityType: "Component",
    observations: ["Validates JWT tokens", "Protects private routes"]
  },
  {
    name: "TodoModel",
    entityType: "Model",
    observations: ["PostgreSQL table: todos", "Fields: id, title, completed, user_id"]
  }
])

// Create relationships
create_relations([
  { from: "TodoAPI", relationType: "contains", to: "AuthMiddleware" },
  { from: "TodoAPI", relationType: "uses", to: "TodoModel" }
])
```

## File Operations Workflow

### Creating a Complete Express Server
```javascript
// 1. Create project structure
create_directory("/home/shaun/repos/todo-api")
create_directory("/home/shaun/repos/todo-api/src")
create_directory("/home/shaun/repos/todo-api/src/models")
create_directory("/home/shaun/repos/todo-api/src/controllers")
create_directory("/home/shaun/repos/todo-api/src/routes")
create_directory("/home/shaun/repos/todo-api/src/middleware")
create_directory("/home/shaun/repos/todo-api/tests")

// 2. Write package.json
write_file({
  path: "/home/shaun/repos/todo-api/package.json",
  content: `{
  "name": "todo-api",
  "version": "1.0.0",
  "description": "REST API for todo management",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.0.3",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "pg": "^8.11.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}`
})

// 3. Write complete server.js
write_file({
  path: "/home/shaun/repos/todo-api/src/server.js",
  content: `const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const todoRoutes = require('./routes/todoRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`
})
```

## REPL Usage for Algorithm Testing

```javascript
// Before implementing in files, test complex algorithms
repl({
  code: `
// Test pagination logic
function calculatePagination(totalItems, currentPage, itemsPerPage) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
}

// Test cases
console.log('Test 1:', calculatePagination(100, 1, 10));
console.log('Test 2:', calculatePagination(95, 10, 10));
console.log('Test 3:', calculatePagination(0, 1, 10));
`
})
```

## Documentation Lookup Pattern

```javascript
// 1. Resolve library ID
resolve_library_id({ libraryName: "react" })

// 2. Get specific documentation
get_library_docs({ 
  context7CompatibleLibraryID: "/facebook/react",
  topic: "hooks",
  tokens: 5000
})

// 3. Use the information to write correct implementations
write_file({
  path: "/home/shaun/repos/app/src/hooks/useDebounce.js",
  content: `import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;`
})
```

## Web Search Integration

```javascript
// Search for best practices
web_search({ query: "node.js security best practices 2025" })

// Fetch specific documentation
web_fetch({ url: "https://nodejs.org/en/docs/guides/security" })

// Apply findings to code
edit_file({
  path: "/home/shaun/repos/api/src/server.js",
  edits: [{
    oldText: "app.use(cors());",
    newText: `app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));`
  }]
})
```

## Calculator Usage Examples

```javascript
// Calculate time complexity
calculate({ expression: "log2(1000000)" }) // For binary search on 1M items

// Calculate memory requirements
calculate({ expression: "1000000 * 64 / 1024 / 1024" }) // MB needed for 1M 64-byte objects

// Calculate rate limiting
calculate({ expression: "86400 / 100" }) // Seconds between requests for 100 daily limit
```

## Complete Workflow Example

### User Request: "Create a rate limiter middleware"

1. **Think First**
   - Use sequential thinking to design approach
   - Consider different rate limiting strategies

2. **Research**
   - Search web for current best practices
   - Check Redis documentation for distributed rate limiting

3. **Implement**
   ```javascript
   // Write complete middleware file
   write_file({
     path: "/home/shaun/repos/api/src/middleware/rateLimiter.js",
     content: `const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('redis');

// Create Redis client
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.connect();

// Create rate limiter
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:'
    }),
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Export different rate limiters
module.exports = {
  apiLimiter: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // limit each IP to 100 requests per windowMs
    'Too many requests from this IP, please try again later'
  ),
  
  authLimiter: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // limit each IP to 5 requests per windowMs
    'Too many authentication attempts, please try again later'
  ),
  
  strictLimiter: createRateLimiter(
    60 * 1000, // 1 minute
    10, // limit each IP to 10 requests per minute
    'Rate limit exceeded, please slow down'
  )
};`
   })
   ```

4. **Test**
   - Write test file for the middleware
   - Use REPL to verify rate calculations

5. **Document**
   - Update knowledge graph with middleware info
   - Add usage examples to README

6. **Integrate**
   - Edit server.js to use the middleware
   - Update route files to apply appropriate limiters

This demonstrates how all tools work together to deliver complete, production-ready code directly to the filesystem.