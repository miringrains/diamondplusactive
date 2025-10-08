#!/bin/bash

# Diamond District Production Setup Script
# This script sets up the domain and SSL for production

set -e

echo "======================================"
echo "Diamond District Production Setup"
echo "Domain: watch.zerotodiamond.com"
echo "======================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Variables
DOMAIN="watch.zerotodiamond.com"
APP_DIR="/root/project/diamond-district"
NGINX_CONFIG="/etc/nginx/sites-available/diamond-district"

# Function to check if domain is pointing to this server
check_dns() {
    echo "Checking DNS configuration..."
    SERVER_IP=$(curl -s ifconfig.me)
    DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
    
    if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
        echo "✓ DNS is correctly configured"
        return 0
    else
        echo "✗ DNS not configured properly"
        echo "  Server IP: $SERVER_IP"
        echo "  Domain IP: $DOMAIN_IP"
        echo ""
        echo "Please add this DNS record at your domain registrar:"
        echo "  Type: A"
        echo "  Name: watch"
        echo "  Value: $SERVER_IP"
        echo ""
        read -p "Press enter when DNS is configured..."
        return 1
    fi
}

# Install required packages
install_packages() {
    echo "Installing required packages..."
    apt update
    apt install -y nginx certbot python3-certbot-nginx
    echo "✓ Packages installed"
}

# Configure Nginx
setup_nginx() {
    echo "Setting up Nginx..."
    
    # Create Nginx config
    cat > $NGINX_CONFIG << 'EOF'
server {
    listen 80;
    server_name watch.zerotodiamond.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Increase body size limit for video uploads
    client_max_body_size 500M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

    # Enable site
    ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
    
    # Remove default site if exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    echo "✓ Nginx configured"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    echo "Setting up SSL certificate..."
    
    # Get certificate
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@zerotodiamond.com --redirect
    
    echo "✓ SSL certificate installed"
    
    # Test auto-renewal
    certbot renew --dry-run
    echo "✓ Auto-renewal configured"
}

# Update environment variables
update_env() {
    echo "Updating environment variables..."
    
    cd $APP_DIR
    
    # Backup existing env file
    if [ -f .env.local ]; then
        cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Update URLs in .env.local
    if [ -f .env.local ]; then
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=\"https://$DOMAIN\"|g" .env.local
        sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=\"https://$DOMAIN\"|g" .env.local
        echo "✓ Environment variables updated"
    else
        echo "✗ .env.local not found. Please create it from env.local.template"
        exit 1
    fi
}

# Build and restart application
rebuild_app() {
    echo "Building application..."
    
    cd $APP_DIR
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Build the application
    npm run build
    
    # Restart with PM2
    pm2 delete diamond-district 2>/dev/null || true
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    echo "✓ Application built and started"
}

# Setup firewall
setup_firewall() {
    echo "Configuring firewall..."
    
    # Install ufw if not installed
    which ufw > /dev/null || apt install -y ufw
    
    # Configure firewall
    ufw --force enable
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw status
    
    echo "✓ Firewall configured"
}

# Main execution
main() {
    echo "Starting production setup..."
    
    # Check DNS
    while ! check_dns; do
        sleep 5
    done
    
    # Install packages
    install_packages
    
    # Setup Nginx
    setup_nginx
    
    # Setup SSL
    setup_ssl
    
    # Update environment
    update_env
    
    # Rebuild application
    rebuild_app
    
    # Setup firewall
    setup_firewall
    
    echo ""
    echo "======================================"
    echo "✓ Production setup complete!"
    echo "======================================"
    echo ""
    echo "Your application is now available at:"
    echo "  https://$DOMAIN"
    echo ""
    echo "Admin login:"
    echo "  https://$DOMAIN/login"
    echo ""
    echo "To check application logs:"
    echo "  pm2 logs diamond-district"
    echo ""
    echo "To monitor application:"
    echo "  pm2 monit"
    echo ""
}

# Run main function
main