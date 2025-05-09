
```
mkdir network-topology-discovery
cd network-topology-discovery
npm init -y
```


```
npm install express net-snmp vis-network

```


docker image
```
ip addr add 172.16.2.202/24 dev eth0
ip route add default via 172.16.2.1
ip link set eth0 up
```
firefox image
```
ip addr add 172.16.2.203/24 dev eth0
ip route add default via 172.16.2.1
ip link set eth0 up
```


```

 docker build -t topology-app   --build-arg CONTAINER_IP=172.16.23.21/24   --build-arg GATEWAY=172.16.23.20  .
```