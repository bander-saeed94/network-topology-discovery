FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
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
    
WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "app.js" ]