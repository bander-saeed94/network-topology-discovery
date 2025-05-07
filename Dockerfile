FROM ubuntu:18.04

# Non-interactive for apt
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    bash \
    ca-certificates \
    net-tools \
    iproute2 \
    iputils-ping \
    dnsutils \
    tcpdump \
    telnet \
    traceroute \
    vim \
    isc-dhcp-client \
    gnupg \
    lsb-release \
 && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x from NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update && apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Clone your repo
RUN git clone https://github.com/bander-saeed94/network-topology-discovery.git . && \
    rm -rf .git

# Install Node.js dependencies
RUN npm install

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Expose app port
EXPOSE 3000

# Start the app via entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
