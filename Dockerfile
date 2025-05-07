FROM node:20-alpine

# Install required tools
RUN apk add --no-cache git iproute2 bash

# Set working directory
WORKDIR /app

# Clone the app
RUN git clone https://github.com/bander-saeed94/network-topology-discovery.git . && \
    rm -rf .git

# Install Node.js dependencies
RUN npm install

# Accept build args (for doc only — used at runtime)
ARG CONTAINER_IP=172.16.2.202/24
ARG GATEWAY=172.16.2.1

# Add a startup script that sets IP and routing
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose app port
EXPOSE 3000

# Use runtime entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
