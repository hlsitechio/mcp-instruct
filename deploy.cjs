const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying to Netlify...');

// Create a minimal deployment directory
const deployDir = 'minimal-deploy';
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir);
}

// Copy only essential files
const filesToCopy = [
  { src: 'public/index.html', dest: 'minimal-deploy/index.html' },
  { src: 'netlify/functions', dest: 'minimal-deploy/functions' }
];

// Copy index.html
if (fs.existsSync('public/index.html')) {
  fs.copyFileSync('public/index.html', 'minimal-deploy/index.html');
  console.log('✅ Copied index.html');
}

// Copy functions directory
if (!fs.existsSync('minimal-deploy/functions')) {
  fs.mkdirSync('minimal-deploy/functions');
}

// Copy only the TypeScript function
if (fs.existsSync('netlify/functions/mcp-bridge.ts')) {
  fs.copyFileSync('netlify/functions/mcp-bridge.ts', 'minimal-deploy/functions/mcp-bridge.ts');
  console.log('✅ Copied mcp-bridge.ts');
}

// Copy tsconfig if exists
if (fs.existsSync('netlify/functions/tsconfig.json')) {
  fs.copyFileSync('netlify/functions/tsconfig.json', 'minimal-deploy/functions/tsconfig.json');
  console.log('✅ Copied tsconfig.json');
}

// Create a minimal netlify.toml
const netlifyConfig = `[build]
  functions = "functions"
  publish = "."
`;

fs.writeFileSync('minimal-deploy/netlify.toml', netlifyConfig);
console.log('✅ Created netlify.toml');

console.log('📦 Deployment package ready in minimal-deploy/');
console.log('');
console.log('Now run:');
console.log('cd minimal-deploy && netlify deploy --prod --dir . --functions functions');