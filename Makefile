# Perpepong Makefile
# Development commands for the project

.PHONY: run dev build clean help

# Default target
help:
	@echo "Available commands:"
	@echo "  make run     - Start local development server (Python)"
	@echo "  make dev     - Start dev server with CSS watch"
	@echo "  make build   - Build optimized CSS"
	@echo "  make clean   - Clean generated files"
	@echo "  make help    - Show this help message"

# Start local development server
run:
	@echo "🚀 Starting development server on http://localhost:8000"
	@python -m http.server 8000

# Start server with CSS watch (requires two terminals)
dev:
	@echo "⚠️  This command requires running CSS watch in another terminal:"
	@echo "   Terminal 1: npm run watch:css"
	@echo "   Terminal 2: make run"
	@echo ""
	@echo "Starting server now..."
	@python -m http.server 8000

# Build optimized CSS
build:
	@echo "🎨 Building optimized CSS..."
	@npm run build:css
	@echo "✅ CSS build complete"

# Clean generated files (optional - be careful!)
clean:
	@echo "🧹 Cleaning generated files..."
	@echo "This would remove node_modules, .cache, etc."
	@echo "Run 'rm -rf node_modules' manually if needed"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@npm install
	@echo "✅ Dependencies installed"

# Run CSS watch mode
watch:
	@echo "👀 Starting CSS watch mode..."
	@npm run watch:css

# Run tests (if any exist)
test:
	@echo "🧪 No tests configured yet"
	@echo "Consider adding Jest or Vitest for testing"

# Open in browser
open:
	@echo "🌐 Opening in browser..."
	@start http://localhost:8000

# Check syntax of backend files
check:
	@echo "✅ Checking backend syntax..."
	@node --check src/backend/index.js
	@node --check src/backend/elo-calculations.js
	@node --check src/backend/matches-loader.js
	@node --check src/backend/rankings.js
	@node --check src/backend/statistics.js
	@echo "✅ All backend files syntax OK"
