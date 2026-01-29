# HTTPS Setup Guide for Easy-Employee

## Option A: Self-Signed Certificate (For Local Network)

### Step 1: Generate Certificate
Run this in PowerShell (in the project directory):

```powershell
# Install OpenSSL if not already installed
# Download from: https://slproweb.com/products/Win32OpenSSL.html

# Generate private key and certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
  -keyout ./ssl/server.key `
  -out ./ssl/server.crt `
  -subj "/C=BD/ST=Dhaka/L=Dhaka/O=EasyEmployee/CN=192.168.1.100"
```

Replace `192.168.1.100` with your actual IP address.

### Step 2: Update Docker Compose

Add SSL configuration to `docker-compose.yml`:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
      - "3443:3443"  # HTTPS port
    volumes:
      - ./ssl:/app/ssl
    environment:
      - HTTPS=true
      - SSL_CRT_FILE=/app/ssl/server.crt
      - SSL_KEY_FILE=/app/ssl/server.key
```

### Step 3: Access via HTTPS

1. Access your app at: `https://192.168.1.100:3443`
2. Browser will show "Not Secure" warning
3. Click "Advanced" → "Proceed anyway"
4. Location will now work!

## Option B: Use ngrok (EASIEST for Testing)

ngrok creates a secure HTTPS tunnel to your local server:

### Step 1: Install ngrok
Download from: https://ngrok.com/download

### Step 2: Run ngrok
```powershell
ngrok http 3000
```

### Step 3: Use the HTTPS URL
ngrok will give you a URL like: `https://abc123.ngrok.io`

Use this URL to access your app - location will work immediately!

## Option C: Browser Flags (You Already Know This)

Follow the chrome://flags instructions from earlier.

---

**Recommendation:** 
- For quick testing: Use **localhost** or **ngrok**
- For production: Set up proper **HTTPS with SSL certificate**
