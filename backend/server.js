/**
 * @fileoverview Main Server Application with Enhanced Module Loader
 * 
 * This is the entry point for the Transaction Management System backend,
 * which loads modular components, installs their dependencies,
 * and sets up the Express server.
 * 
 * @requires express
 * @requires cors
 * @requires dotenv
 * @requires fs
 * @requires path
 * @requires url
 * @requires child_process
 */

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";
import connectDB from "./config/database.js";

// Promisify exec for cleaner async/await usage
const execAsync = promisify(exec);

// Load environment variables and connect to database
dotenv.config();
const app = express();

// Establish database connection
console.log("Connecting to database...");
try {
  await connectDB();
  console.log("✅ Database connected successfully");
} catch (error) {
  console.error("❌ Database connection failed:", error.message);
  process.exit(1); // Exit if database connection fails
}

// Set up middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_INTERNAL_URL],
    credentials: true,
  })
);
app.use(express.json());

// Get directory paths for module loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modulesDir = path.join(__dirname, "modules");

/**
 * Install dependencies for a module using npm in the root directory
 * 
 * @async
 * @param {string} modulePath - Path to the module
 * @param {string} moduleName - Name of the module
 * @returns {Promise<boolean>} Success status
 */
async function installModuleDependencies(modulePath, moduleName) {
  const packageJsonPath = path.join(modulePath, "package.json");
  
  // Skip if no package.json exists
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`📦 Module '${moduleName}' has no package.json, skipping dependency installation`);
    return true;
  }
  
  try {
    // Read package.json to check if dependencies exist
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Skip if no dependencies defined
    if (!packageData.dependencies || Object.keys(packageData.dependencies).length === 0) {
      console.log(`📦 Module '${moduleName}' has no dependencies defined, skipping installation`);
      return true;
    }
    
    console.log(`📦 Installing dependencies for module '${moduleName}' in root directory...`);
    
    // Create install commands for each dependency
    const dependencies = Object.entries(packageData.dependencies)
      .map(([name, version]) => `${name}@${version}`)
      .join(' ');
    
    // Execute npm install in the root directory
    // Using --no-audit for faster installation
    const { stdout, stderr } = await execAsync(`npm install ${dependencies} --no-audit`, { 
      cwd: __dirname // Install in root directory
    });
    
    if (stderr && !stderr.includes('npm WARN')) {
      console.error(`⚠️ Warnings during dependency installation for '${moduleName}':`, stderr);
    }
    
    console.log(`✅ Dependencies installed for module '${moduleName}'`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to install dependencies for module '${moduleName}':`, error.message);
    return false;
  }
}

// Load modules dynamically
console.log("Loading modules...");
if (fs.existsSync(modulesDir)) {
  const moduleFolders = fs.readdirSync(modulesDir);
  
  // Track loaded modules
  let loadedCount = 0;
  let installCount = 0;
  
  // Process each module
  for (const folder of moduleFolders) {
    const modulePath = path.join(modulesDir, folder);
    const entryFile = path.join(modulePath, "index.js");
    const packageJsonPath = path.join(modulePath, "package.json");
    
    if (fs.existsSync(entryFile)) {
      try {
        // Install dependencies if package.json exists
        if (fs.existsSync(packageJsonPath)) {
          const installed = await installModuleDependencies(modulePath, folder);
          if (installed) installCount++;
        }
        
        // Convert the file path to a file:// URL (required for Windows)
        const entryFileUrl = pathToFileURL(entryFile).href;
        
        // Dynamically import the module
        const moduleExports = await import(entryFileUrl);
        const { initModule, name, version, description } = moduleExports;
        
        // Initialize module if it has an initModule function
        if (typeof initModule === "function") {
          await initModule(app);
          loadedCount++;
          console.log(`✅ Loaded module: ${name || folder}${version ? ` v${version}` : ''}`);
          if (description) console.log(`   ${description}`);
        } else {
          console.warn(`⚠️ Module '${folder}' has no initModule function`);
        }
      } catch (error) {
        console.error(`❌ Failed to load module '${folder}':`, error);
        // Continue loading other modules despite this failure
      }
    }
  }
  
  console.log(`Loaded ${loadedCount} out of ${moduleFolders.length} modules`);
  console.log(`Installed dependencies for ${installCount} modules`);
} else {
  console.warn("⚠️ No modules directory found");
}

// Basic route for health check
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "healthy",
    message: "Transaction Management System API is running" 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  
  // Send appropriate error response
  res.status(err.statusCode || 500).json({ 
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// Handle 404 errors for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}` 
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
✅ Server running on port ${PORT}
✅ API available at http://localhost:${PORT}
✅ Frontend CORS origins: ${process.env.FRONTEND_URL}, ${process.env.FRONTEND_INTERNAL_URL}
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // For production, you might want to gracefully shut down the server
  // server.close(() => process.exit(1));
});