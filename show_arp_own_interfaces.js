const snmp = require('net-snmp');

let routerIp = '172.16.23.20'
const session = snmp.createSession(routerIp, 'public');

const arpOID = '1.3.6.1.2.1.4.20';

session.table(arpOID, 20, (error, ipTable) => {
    if (error) {
        console.error("SNMP error:", error);
    } else {
            const interfaces = [];

        console.log(JSON.stringify(ipTable))
         for (const [ip, entry] of Object.entries(ipTable)) {
            const ipp = entry['1']; // ipAdEntAddr
            const ifaceIndex = entry['2']; // Correct interface index OID
            const subnet = entry['3']; // ipAdEntNetMask
            const Broadcast_address = entry['4']; // ipAdEntBcastAddr (subnet broadcast enabled)
            const IP_reassembly_size = entry['5'];  // ipAdEntReasmMaxSize
            interfaces.push({
                ipp,
                ip: ip,
                interface: ifaceIndex,
                subnet,
                Broadcast_address,
                IP_reassembly_size

            });
        }
        console.log('Router Interfaces:', interfaces);
        }
    session.close();
});


// bander@MacBook-Pro-Bander network-topology-discovery % node show_arp_own_interfaces.js

// Router Interfaces: [
//   {
//     ipp: '172.16.1.1',
//     ip: '172.16.1.1',
//     interface: 2,
//     subnet: '255.255.255.0',
//     Broadcast_address: 1,
//     IP_reassembly_size: 18024
//   },
//   {
//     ipp: '172.16.2.1',
//     ip: '172.16.2.1',
//     interface: 4,
//     subnet: '255.255.255.252',
//     Broadcast_address: 1,
//     IP_reassembly_size: 18024
//   },
//   {
//     ipp: '172.16.8.1',
//     ip: '172.16.8.1',
//     interface: 3,
//     subnet: '255.255.255.0',
//     Broadcast_address: 1,
//     IP_reassembly_size: 18024
//   },
//   {
//     ipp: '172.16.23.20',
//     ip: '172.16.23.20',
//     interface: 1,
//     subnet: '255.255.255.0',
//     Broadcast_address: 1,
//     IP_reassembly_size: 18024
//   }
// ]