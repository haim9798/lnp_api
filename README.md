# LNP Server

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://www.docker.com/)

A comprehensive **Local Number Portability (LNP)** server that provides number translation services through multiple protocols. This server supports SIP LNP queries, ENUM DNS lookups, and a REST API for database management, making it a complete solution for telecommunications number portability services.

## 🚀 Features

- **Multi-Protocol Support**: SIP LNP (Port 5060), ENUM DNS (Port 53), and REST API (Port 8000)
- **Redis Database**: High-performance data storage with Redis backend
- **Comprehensive Logging**: Winston-based logging with daily rotation and error tracking
- **Docker Support**: Containerized deployment for easy scaling and management
- **CORS Enabled**: Cross-origin resource sharing for web applications
- **Production Ready**: Built with enterprise-grade error handling and monitoring

## 📋 Prerequisites

Before installing and running the LNP Server, ensure you have the following:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **Redis Server** (v5.0 or higher)
- **Docker** (optional, for containerized deployment)
- **Administrative privileges** (required for binding to port 53)

## 🔧 Installation

### Standard Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd lnp_api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Redis**:
   - Install Redis on your system
   - Start Redis service
   - For Kubernetes deployment, update the Redis host in `lnpserver.js`

4. **Configure logging directories**:
   ```bash
   # Create log directory (Linux/Mac)
   sudo mkdir -p /var/tmp
   sudo chmod 755 /var/tmp
   
   # For Windows, update log paths in lnpserver.js
   ```

### Docker Installation

1. **Build the Docker image**:
   ```bash
   docker build -t lnp-server .
   ```

2. **Run with Docker Compose** (recommended):
   ```yaml
   # docker-compose.yml
   version: '3.8'
   services:
     redis:
       image: redis:alpine
       ports:
         - "6379:6379"
     
     lnp-server:
       build: .
       ports:
         - "8000:8000"
         - "5060:5060/udp"
         - "53:53/udp"
       depends_on:
         - redis
   ```

3. **Start services**:
   ```bash
   docker-compose up -d
   ```

## ⚙️ Configuration

### Port Configuration

Default ports can be modified in `lnpserver.js`:

```javascript
const port = 8000;        // REST API port
const sipPort = "5060";   // SIP LNP port  
const enumPort = 53;      // ENUM DNS port
```

### Redis Configuration

Update Redis connection settings in `lnpserver.js`:

```javascript
// For local Redis
var client = redis.createClient();

// For Kubernetes/Remote Redis
var client = redis.createClient({
    host: 'redis-master.default.svc.cluster.local'
});
```

### Logging Configuration

Logs are stored in `/var/tmp/` with daily rotation:
- **General logs**: `SIP_LNP_General-[DATE].log`
- **Error logs**: `SIP_LNP_Error-[DATE].log`
- **Retention**: 14 days
- **Max file size**: 20MB

## 🚀 Usage

### Starting the Server

Choose one of the following methods:

```bash
# Full LNP server (SIP + ENUM + REST API)
npm run lnp

# REST API + SIP only
npm run dev

# Development mode
npm test
```

### Running with Administrative Privileges

**Linux/Mac**:
```bash
sudo npm run lnp
```

**Windows** (Run as Administrator):
```cmd
npm run lnp
```

## 📡 API Documentation

### REST API Endpoints

The REST API provides full CRUD operations for number management.

#### Base URL
```
http://<your-server-ip>:8000/lnp
```

#### 1. Add/Update Number Translation

**Endpoint**: `POST /lnp`

**Request Body**:
```json
{
  "number": "original_number",
  "transnum": "translated_number"
}
```

**Example**:
```bash
curl --header "Content-Type: application/json" \
     --request POST \
     --data '{"number":"1234567890","transnum":"0987654321"}' \
     http://localhost:8000/lnp
```

**Response**:
```json
{
  "status": "success",
  "message": "Number translation added/updated successfully"
}
```

#### 2. Query Number Translation

**Endpoint**: `GET /lnp/{number}`

**Example**:
```bash
curl --header "Content-Type: application/json" \
     --request GET \
     http://localhost:8000/lnp/1234567890
```

**Response** (Success):
```json
{
  "number": "1234567890",
  "transnum": "0987654321",
  "status": "found"
}
```

**Response** (Not Found):
```json
{
  "status": "error",
  "message": "Number not found in database"
}
```

#### 3. Delete Number Translation

**Endpoint**: `DELETE /lnp/{number}`

**Example**:
```bash
curl --header "Content-Type: application/json" \
     --request DELETE \
     http://localhost:8000/lnp/1234567890
```

**Response**:
```json
{
  "status": "success",
  "message": "Number translation deleted successfully"
}
```

### SIP LNP Service

**Port**: 5060 (UDP)
**Protocol**: SIP

Send SIP INVITE messages to query number translations. The server will respond with the translated number or appropriate error codes.

### ENUM DNS Service

**Port**: 53 (UDP)
**Protocol**: DNS

Supports ENUM (E.164 Number Mapping) queries for number translation via DNS lookups.

## 🐳 Docker Deployment

### Single Container

```bash
# Build image
docker build -t lnp-server .

# Run container
docker run -d \
  --name lnp-server \
  -p 8000:8000 \
  -p 5060:5060/udp \
  -p 53:53/udp \
  lnp-server
```

### Production Deployment

For production environments, use the provided Docker Compose configuration with external Redis:

```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    restart: always
    volumes:
      - redis_data:/data
    
  lnp-server:
    build: .
    restart: always
    ports:
      - "8000:8000"
      - "5060:5060/udp" 
      - "53:53/udp"
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
    volumes:
      - ./logs:/var/tmp

volumes:
  redis_data:
```

## 📊 Monitoring and Logging

### Log Files

- **Location**: `/var/tmp/`
- **General logs**: All operational information
- **Error logs**: Errors and exceptions only
- **Format**: Timestamped JSON format
- **Rotation**: Daily with 14-day retention

### Log Levels

- **Info**: General operational information
- **Error**: Application errors and exceptions
- **Debug**: Detailed debugging information (development only)

### Health Monitoring

Monitor server health by checking:
1. REST API responsiveness: `GET http://localhost:8000/lnp/health`
2. Redis connectivity: Check application logs
3. Port availability: Ensure ports 53, 5060, and 8000 are accessible

## 🛠️ Troubleshooting

### Common Issues

#### Port 53 Permission Denied
**Problem**: Cannot bind to port 53
**Solution**: Run with administrative privileges
```bash
# Linux/Mac
sudo npm run lnp

# Windows: Run terminal as Administrator
npm run lnp
```

#### Redis Connection Failed
**Problem**: Cannot connect to Redis
**Solutions**:
1. Ensure Redis is running: `redis-cli ping`
2. Check Redis configuration in `lnpserver.js`
3. Verify network connectivity

#### High Memory Usage
**Problem**: Application consuming excessive memory
**Solutions**:
1. Check log file sizes in `/var/tmp/`
2. Verify Redis memory usage
3. Monitor for memory leaks in application logs

#### SIP/DNS Not Responding
**Problem**: SIP or DNS services not responding
**Solutions**:
1. Check firewall settings for ports 53 and 5060
2. Verify network interface binding
3. Check application logs for binding errors

### Debug Mode

Enable detailed logging by modifying the Winston configuration:

```javascript
const logger = createLogger({
    level: 'debug',  // Change from 'info' to 'debug'
    // ... rest of configuration
});
```

## 📁 Project Structure

```
lnp_api/
├── app/
│   └── lnp/
│       ├── index.js          # Main LNP module exports
│       ├── lnp_api.js         # REST API implementation
│       ├── sip_lnp.js         # SIP LNP server
│       └── enum_lnp.js        # ENUM DNS server
├── routes/
│   ├── index.js              # Route initialization
│   └── note_routes.js         # API route definitions
├── lnpserver.js              # Main server file (full functionality)
├── server.js                 # REST API + SIP only
├── package.json              # Project dependencies
├── Dockerfile                # Docker configuration
└── README.md                 # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📝 Version History

### Version 2.0.0 (Current)
- ✅ Added ENUM DNS service on port 53
- ✅ Comprehensive logging with Winston
- ✅ Docker containerization support
- ✅ Enhanced error handling
- ✅ Production-ready configuration

### Version 1.0.0
- ✅ Basic LNP server with REST API
- ✅ SIP LNP query support
- ✅ Redis integration

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Haim Natan**

## 🔗 Credits

- SIP server implementation based on work by Alex Nisanov
- ENUM DNS server built with [native-dns package](https://github.com/tjfontaine/node-dns)

## 📞 Support

For support and questions:
1. Check the troubleshooting section above
2. Review application logs in `/var/tmp/`
3. Create an issue in the repository
4. Contact the development team

---

**Note**: This server requires administrative privileges to bind to port 53 for DNS services. Ensure proper security measures are in place when deploying in production environments.
