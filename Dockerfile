# Stage 1: Build the Next.js app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy all source code
COPY . .

# Hardcode API base URL for production
ENV NEXT_PUBLIC_API_BASE_URL=https://chemz.duckdns.org/api

# Build the Next.js app
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the port Next.js will run on
EXPOSE 3000

# Use production environment
ENV NODE_ENV=production

# Start the Next.js app
CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]