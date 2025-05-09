#!/bin/bash

# Use environment variables passed at runtime
IP_ADDR="${CONTAINER_IP:-172.16.23.21/24}"
GATEWAY="${GATEWAY:-172.16.23.20}"

# Set IP, route, and bring interface up
ip addr add $IP_ADDR dev eth0
ip route add default via $GATEWAY
ip link set eth0 up

# Start the app
exec npm start
