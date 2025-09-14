@echo off
echo ===============================================
echo   MCP INSTRUCT - HTTP BRIDGE SERVER
echo   Personal Knowledge Base ^& AI Agent Manager
echo ===============================================
echo.
echo Starting HTTP Bridge on port 3000...
echo.
echo For ChatGPT Integration:
echo 1. Copy the API key shown on startup
echo 2. Add to ChatGPT Custom GPT as X-API-Key header
echo 3. Use command: "mcp-instruct-onboarding" to start
echo.
echo Available Commands:
echo - mcp-instruct-onboarding : Start setup
echo - switch-agent [type]     : Change AI mode
echo - status                  : Check current profile
echo - help                    : Show all commands
echo.
echo Press Ctrl+C to stop the server
echo ===============================================
echo.
npm run bridge