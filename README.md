# Overaction - Albion Online Tools Platform

The ultimate platform for Albion Online players and streamers, featuring comprehensive tools for gaming optimization, stream overlays, real-time Twitch integration, and advanced Albion Online data management.

## 🚀 Features

### For Albion Online Players
- **Item Database & Search** - Complete Albion Online item database with advanced filtering
- **Build Calculator** - Plan and optimize your character builds
- **Market Analysis** - Real-time market data and price tracking
- **Guild Management Tools** - Track guild activities and member progression
- **PvP Statistics** - Analyze your combat performance and improvement areas

### For Albion Online Streamers
- **Dynamic Stream Overlays** - Real-time Albion Online game integration
- **Twitch Bit Actions** - Viewers can trigger in-game events with bits
- **Live Stats Display** - Show current character stats, inventory, and progress
- **Interactive Elements** - Audience engagement through Albion-themed actions
- **Professional UI** - Modern, game-themed design with shadcn/ui components

### Platform Features
- **Twitch OAuth Authentication** - Secure login with Twitch integration
- **Real-time Data** - Live Albion Online game data integration
- **User Dashboard** - Complete management interface for all tools
- **Database Integration** - PostgreSQL with Drizzle ORM for performance
- **Cross-Platform Support** - Works with OBS, Streamlabs, and other streaming software

## 🏗 Architecture

### Frontend (React + TypeScript)
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS + shadcn/ui components  
- **Authentication**: JWT-based with automatic token refresh
- **Routing**: React Router with protected routes
- **State Management**: React Context for auth state

### Backend (Node.js + TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Twitch OAuth + JWT tokens
- **API**: RESTful API with real-time SSE support

### Database Schema
- **Users**: Twitch user data and profiles
- **Actions**: User-defined stream actions
- **Overlays**: Custom overlay configurations
- **Events**: System events and analytics
- **Sessions**: User session management
- **Twitch Integrations**: OAuth tokens and webhooks

## 🛠 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Twitch Developer Account

### 1. Clone and Install Dependencies
```bash
git clone <repository>
cd stream-custom-overlay
npm install
```

### 2. Configure Twitch Application
1. Go to [Twitch Developers Console](https://dev.twitch.tv/console)
2. Create a new application:
   - **Name**: Overaction - Albion Online Tools
   - **OAuth Redirect URL**: `http://localhost:3000/auth/callback`
   - **Category**: Website Integration
3. Copy the Client ID and Client Secret

### 3. Setup Environment Variables
```bash
# Copy environment files
cp api/.env.example api/.env
cp web/.env.example web/.env

# Edit api/.env with your Twitch credentials
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
# ... other variables
```

### 4. Start Database
```bash
# Start PostgreSQL with Docker
docker compose up -d postgres

# Or use Docker Compose if using older version
docker-compose up -d postgres
```

### 5. Setup Database Schema
```bash
# Generate and run migrations
npm run db:generate --workspace=api
npm run db:push --workspace=api

# Seed with sample data (optional)
npm run db:seed --workspace=api
```

### 6. Start Development Servers
```bash
# Start both API and web in development mode
npm run dev

# Or start individually
npm run dev:api  # Starts API on port 3001
npm run dev:web  # Starts web on port 3000
```

### 7. Access Applications
- **Web Application**: http://localhost:3000
- **API**: http://localhost:3001
- **Database Admin** (Adminer): http://localhost:8080
- **Drizzle Studio**: `npm run db:studio --workspace=api`

## 📚 Available Scripts

### Root Level
- `npm run dev` - Start both API and web in development
- `npm run build` - Build both applications
- `npm run lint` - Run linting on both projects

### API Scripts
```bash
npm run dev --workspace=api          # Start API development server
npm run build --workspace=api        # Build API for production
npm run db:generate --workspace=api  # Generate database migrations
npm run db:push --workspace=api      # Push schema to database
npm run db:migrate --workspace=api   # Run migrations
npm run db:studio --workspace=api    # Open Drizzle Studio
npm run db:seed --workspace=api      # Seed database with sample data
```

### Web Scripts
```bash
npm run dev --workspace=web      # Start web development server
npm run build --workspace=web    # Build web for production
npm run preview --workspace=web  # Preview production build
```

## 🔄 Authentication Flow

1. **Landing Page** → User clicks "Login with Twitch"
2. **Login Page** → Redirects to Twitch OAuth
3. **Twitch Authorization** → User grants permissions
4. **OAuth Callback** → Processes auth code and tokens
5. **Database Integration** → Creates/updates user record
6. **JWT Generation** → Issues app-specific JWT token
7. **Dashboard Access** → User redirected to protected dashboard

## 🗄 Database Structure

### Core Tables
- **`users`** - Twitch user profiles and Albion Online character data
- **`user_sessions`** - Active JWT sessions
- **`twitch_integrations`** - OAuth tokens and scopes
- **`actions`** - Albion Online themed stream actions
- **`overlays`** - Custom Albion Online overlay configurations
- **`events`** - System events and analytics
- **`albion_characters`** - Linked Albion Online character profiles
- **`albion_items`** - Complete Albion Online item database
- **`albion_builds`** - User-created character builds
- **`market_data`** - Real-time Albion Online market information

### Key Features
- **UUID Primary Keys** with CUID2 generation
- **Automatic Timestamps** for created/updated tracking  
- **Cascade Deletes** for data consistency
- **JSONB Columns** for flexible configuration storage
- **Proper Indexing** for performance optimization

## 🔧 Development Tools

- **TypeScript** - Full type safety across the stack
- **ESLint** - Code linting and formatting
- **Drizzle Studio** - Visual database management
- **Adminer** - Alternative database admin interface
- **Hot Reload** - Both API and web support hot reloading

## 🚀 Deployment

### Database Migration
```bash
# Production database setup
npm run db:generate --workspace=api
npm run db:migrate --workspace=api
```

### Build for Production
```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are set:
- Twitch credentials
- Database connection strings
- JWT secrets
- Domain-specific redirect URLs

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🔐 Security Notes

- JWT tokens expire after 7 days by default
- Refresh tokens stored securely in database
- All API routes use proper CORS configuration
- Twitch integration follows OAuth 2.0 best practices
- Database credentials should never be committed

## 🎮 Albion Online Integration

### Supported Features
- **Character Stats Tracking** - Monitor fame, silver, and progression
- **Inventory Management** - Track valuable items and gear sets
- **Guild Activity** - Monitor guild events and member activities
- **Market Integration** - Real-time price data for trading decisions
- **PvP Analytics** - Detailed combat statistics and kill/death tracking
- **Build Optimization** - Theory-craft and share optimal builds

### Streaming Enhancements
- **Live Overlay Updates** - Real-time game state reflected in stream overlay
- **Viewer Interactions** - Twitch bits trigger Albion-themed animations
- **Character Showcase** - Display current gear, stats, and achievements
- **Market Alerts** - Show profitable trading opportunities to viewers
- **PvP Highlights** - Automatic highlights of combat achievements

---

**Built with ❤️ for the Albion Online community**