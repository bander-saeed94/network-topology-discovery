FROM ubuntu:18.04

# Install dependencies
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
    isc-dhcp-client
RUN apt install nodejs -y
RUN apt install npm -y

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
