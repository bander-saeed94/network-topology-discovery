
//bander@MacBook-Pro-Bander network-topology-discovery % snmpwalk -v2c -c public 172.16.23.20 .1.3.6.1.2.1.4.24.4.1.1
// IP-MIB::ip.24.4.1.1.172.16.1.0.255.255.255.0.0.0.0.0.0 = IpAddress: 172.16.1.0
// IP-MIB::ip.24.4.1.1.172.16.1.1.255.255.255.255.0.0.0.0.0 = IpAddress: 172.16.1.1
// IP-MIB::ip.24.4.1.1.172.16.2.0.255.255.255.252.0.0.0.0.0 = IpAddress: 172.16.2.0
// IP-MIB::ip.24.4.1.1.172.16.2.1.255.255.255.255.0.0.0.0.0 = IpAddress: 172.16.2.1
// IP-MIB::ip.24.4.1.1.172.16.3.0.255.255.255.0.0.172.16.2.2 = IpAddress: 172.16.3.0
// IP-MIB::ip.24.4.1.1.172.16.4.0.255.255.255.0.0.172.16.2.2 = IpAddress: 172.16.4.0
// IP-MIB::ip.24.4.1.1.172.16.5.0.255.255.255.252.0.172.16.2.2 = IpAddress: 172.16.5.0
// IP-MIB::ip.24.4.1.1.172.16.6.0.255.255.255.0.0.172.16.2.2 = IpAddress: 172.16.6.0
// IP-MIB::ip.24.4.1.1.172.16.7.0.255.255.255.0.0.172.16.2.2 = IpAddress: 172.16.7.0
// IP-MIB::ip.24.4.1.1.172.16.8.0.255.255.255.0.0.0.0.0.0 = IpAddress: 172.16.8.0
// IP-MIB::ip.24.4.1.1.172.16.8.1.255.255.255.255.0.0.0.0.0 = IpAddress: 172.16.8.1
// IP-MIB::ip.24.4.1.1.172.16.23.0.255.255.255.0.0.0.0.0.0 = IpAddress: 172.16.23.0
// IP-MIB::ip.24.4.1.1.172.16.23.20.255.255.255.255.0.0.0.0.0 = IpAddress: 172.16.23.20
const snmp = require('net-snmp');

let routerIp = '172.16.23.20'
const session = snmp.createSession(routerIp , 'public');

const routingOID = '1.3.6.1.2.1.4.24.4.1';

session.table(routingOID, 20, (error, table) => {
    if (error) {
        console.error("SNMP error:", error);
    } else {
        const devices = [];
        const directly_connected_devices = []
        let connected_via_devices = []
        for (const [key,entry] of Object.entries(table)) {
            if(key.endsWith('0.0.0.0')){
                directly_connected = {dest: entry['172'], via: routerIp, directly_connected: true }
                directly_connected_devices.push(directly_connected)
            } else {
                connected_via = { dest: entry['172'], via: key.split(".").slice(-4).join('.'), directly_connected: false }
                connected_via_devices.push(connected_via)
            }
        }
        console.log(connected_via_devices)
        console.log(directly_connected_devices)

    }
    session.close();
});

