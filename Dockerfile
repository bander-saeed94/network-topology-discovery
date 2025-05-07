# Use an official Node.js LTS base image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Clone the GitHub repo directly
RUN apk add --no-cache git && \
    git clone https://github.com/bander-saeed94/network-topology-discovery.git . && \
    rm -rf .git

# Install dependencies
RUN npm install

# Expose the port your app listens on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
