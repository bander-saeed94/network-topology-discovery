FROM node:20

# Install required tools
RUN apt update && apt install -y iproute
RUN apt update && apt install -y net-tools
RUN apt update && apt install -y iputils-ping
RUN apt update && apt install -y dnsutils
RUN apt update && apt install -y tcpdump
RUN apt update && apt install -y curl
RUN apt update && apt install -y wget
RUN apt update && apt install -y tcpdump
RUN apt update && apt install -y telnet
RUN apt update && apt install -y traceroute
RUN apt update && apt install -y vim
RUN apt update && apt install -y isc-dhcp-client 
RUN apt update && apt install -y git

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
