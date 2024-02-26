# Use the official Node.js image as base
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript source
RUN npm run build

# Production image
FROM node:18

# Set working directory
WORKDIR /app

# Copy built JavaScript files and necessary dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/app.js"]

