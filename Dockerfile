FROM ubuntu:22.04


# Step 1: Update and install basic tools
RUN apt-get update && \
    apt-get install -y curl gnupg ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/* \
    apt-get clean && rm -rf /var/lib/apt/lists/*


# Step 2: Add NodeSource repo and install latest LTS Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

   

# Install dependencies
# Step 3: Install network utilities
RUN apt-get update && \
    apt-get install -y \
    iproute2 \
    net-tools \
    iputils-ping \
    dnsutils \
    tcpdump \
    wget \
    telnet \
    traceroute \
    vim \
    isc-dhcp-client && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Verify installation
RUN node -v && npm -v


# Create app directory
WORKDIR /app

# COPY
COPY . .

# Install Node.js dependencies
RUN npm install

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Expose app port
EXPOSE 3000

# Start the app via entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
