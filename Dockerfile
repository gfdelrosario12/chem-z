# ---------- Build Stage ----------
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first to leverage caching
COPY package*.json ./

# Install dependencies quietly
RUN npm ci --silent

# Copy the rest of the project
COPY . .

# Build the Next.js app
# Ignore ESLint by using `NEXT_PUBLIC_DISABLE_ESLINT=true`
ENV NEXT_PUBLIC_DISABLE_ESLINT=true
RUN npm run build

# ---------- Runtime Stage ----------
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy built app from build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package*.json ./

# Install only production dependencies
RUN npm ci --production --silent

# Expose the port Next.js uses
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
