# Base CRM - WooCommerce Integration

A modern Customer Relationship Management (CRM) system with WooCommerce integration, built with React and Node.js.

## 📋 Project Structure

```
base_crm/
├── client/                 # React frontend application
│   ├── public/            # Static files
│   ├── src/               # React source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   └── assets/        # Images, icons, etc.
│   └── package.json       # Client dependencies
│
├── server/                # Node.js backend application
│   ├── api-scripts/       # WooCommerce sync scripts
│   ├── config/            # Configuration files
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── .env               # Environment variables (DO NOT COMMIT)
│   ├── server.js          # Main server file
│   └── package.json       # Server dependencies
│
├── docs/                  # Documentation
│   └── WOOCOMMERCE_API.md # WooCommerce API reference
│
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- WooCommerce store with REST API enabled
- WooCommerce API credentials (Consumer Key & Secret)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd base_crm
   ```

2. **Install dependencies**
   
   Install client dependencies:
   ```bash
   cd client
   npm install
   ```
   
   Install server dependencies:
   ```bash
   cd ../server
   npm install
   ```

3. **Configure environment variables**
   
   Edit `server/.env` and add your WooCommerce credentials:
   ```env
   WC_STORE=your-store.com
   WC_CONSUMER_KEY=ck_xxxxxxxxxxxxx
   WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxx
   BACKEND_API_KEY=your-secret-key
   PORT=4000
   ```

4. **Test WooCommerce connection**
   ```bash
   cd server
   node utils/test-woocommerce-connection.js
   ```
   
   This will verify your API credentials and connectivity.

5. **Start the development servers**
   
   Start the backend server (in one terminal):
   ```bash
   cd server
   npm start
   ```
   
   Start the frontend app (in another terminal):
   ```bash
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## 📚 Documentation

**All documentation is now in the [`docs/`](./docs/) folder:**

- **[📑 Documentation Index](./docs/INDEX.md)** - Complete guide to all docs
- **[🚀 Setup Guide](./docs/SETUP.md)** - Complete installation instructions
- **[⚡ Quick Reference](./docs/QUICK_REFERENCE.md)** - Common commands and tips
- **[🔌 WooCommerce API](./docs/WOOCOMMERCE_API.md)** - Complete API reference
- **[🖥️ Server Documentation](./docs/SERVER.md)** - Backend server details
- **[✅ Test Results](./docs/TEST_RESULTS.md)** - API connectivity test results
- **[📊 Project Status](./docs/PROJECT_STATUS.md)** - Current project status
- **[📝 Project Summary](./docs/PROJECT_SUMMARY.md)** - Restructuring details

## 🔑 Features

### Current Features

- ✅ Product management
- ✅ Customer management
- ✅ Order tracking
- ✅ Invoice generation
- ✅ Sales dashboard with charts
- ✅ WooCommerce API integration
- ✅ Product sync scripts
- ✅ Export functionality (CSV)
- ✅ **GitHub Image Storage** - Free cloud storage for product images with public CDN URLs

### Planned Features

- 🔄 Real-time notifications
- 🔄 Advanced reporting
- 🔄 Inventory management
- 🔄 Email campaigns
- 🔄 Multi-store support

## 🛠️ Development

### GitHub Image Storage

Base CRM includes built-in GitHub integration for free cloud image storage:

**✨ Features:**
- Upload product images directly to GitHub
- Automatic public URLs for WooCommerce
- Free unlimited storage (GitHub)
- Fast CDN delivery worldwide
- Organized by date (automatic)
- Version history in Git

**🚀 Quick Setup:**
1. Create public GitHub repo: `BASE_CRM_Database`
2. Generate Personal Access Token with `repo` scope
3. Update `.env` with GitHub credentials
4. Start uploading images!

**📖 Documentation:**
- [📑 Complete Implementation Guide](./docs/GITHUB_IMPLEMENTATION_COMPLETE.md)
- [⚡ Quick Reference Card](./docs/GITHUB_QUICK_REFERENCE.md)
- [📊 Setup Instructions](./docs/GITHUB_SETUP_INSTRUCTIONS.md)
- [🔧 Technical Details](./docs/GITHUB_IMAGE_STORAGE.md)

**Environment Variables Needed:**
```env
GITHUB_TOKEN=your_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=BASE_CRM_Database
GITHUB_IMAGES_PATH=images/products
```

---

### Available Scripts

#### Client Scripts (run from `client/` directory)

```bash
npm start          # Start development server
npm run build      # Build for production
npm test          # Run tests
```

#### Server Scripts (run from `server/` directory)

```bash
npm start                    # Start backend server
npm run test:connection      # Test WooCommerce API connection
```

## 🔐 Security

### Important Security Notes

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use environment variables** - For all sensitive configuration
3. **Enable HTTPS** - For production deployments
4. **Rotate API keys** - Regularly update your WooCommerce API keys
5. **Validate input** - Always validate and sanitize user input
6. **Use API key protection** - Set `BACKEND_API_KEY` to protect sync endpoints

## 🧪 Testing

### Test WooCommerce Connection

```bash
cd server
node utils/test-woocommerce-connection.js
```

This script will:
- ✓ Validate environment variables
- ✓ Test basic API connectivity
- ✓ Test products endpoint
- ✓ Test orders endpoint
- ✓ Test customers endpoint
- ✓ Verify permissions

## 📦 Deployment

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WC_STORE` | Yes | WooCommerce store URL (without https://) |
| `WC_CONSUMER_KEY` | Yes | WooCommerce API Consumer Key |
| `WC_CONSUMER_SECRET` | Yes | WooCommerce API Consumer Secret |
| `BACKEND_API_KEY` | Recommended | Secret key for backend API authentication |
| `PORT` | No | Backend server port (default: 4000) |
| `NODE_ENV` | No | Environment: development/production |

## 🐛 Troubleshooting

### Common Issues

**Issue: Connection refused**
- Verify WooCommerce REST API is enabled
- Check your store URL (remove https://)
- Ensure firewall allows connections

**Issue: 401 Unauthorized**
- Verify Consumer Key and Secret are correct
- Check API key permissions (should be Read/Write)
- Regenerate keys if necessary

**Issue: Port already in use**
- Change PORT in .env file
- Or stop the process using the port

### Getting Help

- Check the [WooCommerce API Documentation](./docs/WOOCOMMERCE_API.md)
- Run the connection test: `node server/utils/test-woocommerce-connection.js`
- Review server logs for detailed error messages

## 📄 License

This project is licensed under the MIT License.

---

**Version:** 1.0.0  
**Last Updated:** October 2025

For detailed API documentation, see [WOOCOMMERCE_API.md](./docs/WOOCOMMERCE_API.md)
