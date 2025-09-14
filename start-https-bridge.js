#!/usr/bin/env node
import ngrok from 'ngrok';
import { spawn } from 'child_process';
import chalk from 'chalk';

console.log(chalk.cyan('🚀 Starting MCP Instruct HTTPS Bridge...'));

// Start the HTTP bridge server
const bridge = spawn('npm', ['run', 'bridge'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for the server to start
setTimeout(async () => {
  try {
    // Start ngrok tunnel
    const url = await ngrok.connect({
      addr: 3000,
      proto: 'http',
      region: 'us', // Change to your preferred region
      authtoken: process.env.NGROK_AUTH_TOKEN // Optional: for custom domains
    });
    
    console.log(chalk.green('\n🔒 HTTPS Tunnel Established!'));
    console.log(chalk.yellow('════════════════════════════════════════════════════'));
    console.log(chalk.white.bold('MCP Server URL for ChatGPT Desktop:'));
    console.log(chalk.green.bold(url));
    console.log(chalk.yellow('════════════════════════════════════════════════════'));
    console.log(chalk.gray('\nThis URL will work until you stop this process.'));
    console.log(chalk.gray('Copy the URL above and paste it in ChatGPT Desktop.'));
    console.log(chalk.cyan('\n📝 In ChatGPT Desktop:'));
    console.log(chalk.white('1. Click "Nouveau connecteur"'));
    console.log(chalk.white(`2. URL du serveur MCP: ${url}`));
    console.log(chalk.white('3. Keep OAuth as authentication'));
    console.log(chalk.white('4. Check "Je fais confiance"'));
    console.log(chalk.white('5. Click "Créer"'));
    
    // Save the URL to a file for reference
    const fs = await import('fs/promises');
    await fs.writeFile('current-mcp-url.txt', url);
    console.log(chalk.gray(`\n💾 URL saved to current-mcp-url.txt`));
    
  } catch (error) {
    console.error(chalk.red('Failed to create tunnel:', error));
    process.exit(1);
  }
}, 3000);

// Handle shutdown
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n👋 Shutting down...'));
  await ngrok.kill();
  bridge.kill();
  process.exit(0);
});