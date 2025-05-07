FROM node:20

# Install required tools
RUN apt update && apt install -y \
    iproute2 \           
    net-tools \          
    iputils-ping \       
    dnsutils \           
    tcpdump \            
    curl \               
    wget \               
    telnet \             
    traceroute \         
    vim \                
    isc-dhcp-client  \
    git

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
