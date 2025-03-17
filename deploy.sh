#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install dependencies
npm install

# Build the Next.js app
npm run build

# Start the Next.js app with PM2
pm2 start npm --name "krypticmail-web" -- start

# Start the SMTP server with PM2
pm2 start npm --name "krypticmail-smtp" -- run email-server

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Install and configure Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx 