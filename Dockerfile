FROM node:20-alpine

# Install required tools
RUN apk update && apk add --no-cache \
    git \
    bash \
    iproute2 \
    net-tools \
    iputils \
    bind-tools \
    tcpdump \
    curl \
    wget \
    busybox-extras \
    traceroute
# Set working directory
WORKDIR /app

# Clone the application code
RUN git clone https://github.com/bander-saeed94/network-topology-discovery.git . && \
    rm -rf .git

# Install Node.js dependencies
RUN npm install

# Make sure entrypoint is executable
RUN chmod +x /app/entrypoint.sh

# Expose application port
EXPOSE 3000

# Use runtime entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
