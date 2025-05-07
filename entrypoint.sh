#!/bin/bash

# Use environment variables passed at runtime
IP_ADDR="${CONTAINER_IP:-172.16.2.202/24}"
GATEWAY="${GATEWAY:-172.16.2.1}"

# Set IP, route, and bring interface up
ip addr add $IP_ADDR dev eth0
ip route add default via $GATEWAY
ip link set eth0 up

# Start the app
exec npm start
