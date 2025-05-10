const snmp = require('net-snmp');

let routerIp = '172.16.23.20'
const session = snmp.createSession(routerIp, 'public');

const arpOID = '1.3.6.1.2.1.4.22';

session.table(arpOID, 20, (error, table) => {
    if (error) {
        console.error("SNMP error:", error);
    } else {
        const devices = [];

        // console.log(JSON.stringify(table))
        for (const entry of Object.values(table)) {
            // console.log(JSON.stringify( entry))
            const iface = entry["1"];
            const macBuffer = entry["2"];
            const ip = entry["3"];
            const type = entry["4"];

            if (macBuffer && macBuffer instanceof Buffer) {
                const mac = macBuffer.toString('hex').match(/.{1,2}/g).join(':');
                const arpType = type === 3 ? 'Dynamic' : (type === 4 ? 'Static' : `Other(${type})`);

                const device = {
                    interface: iface,
                    ip: ip,
                    mac: mac,
                    type: arpType
                };

                devices.push(device);

                console.log(`Interface: ${iface}, IP: ${ip}, MAC: ${mac}, Type: ${arpType}`);
            } else {
                console.warn(`Invalid MAC buffer for IP: ${ip}`);
            }
        }
    }
    session.close();
});

// r1>show ip arp
// Protocol  Address          Age (min)  Hardware Addr   Type   Interface
// Internet  172.16.1.1              -   ca:01.1a5d.001c  ARPA   FastEthernet1/0
// Internet  172.16.1.101            6   00:50.7966.6801  ARPA   FastEthernet1/0
// Internet  172.16.2.1              -   ca:01.1a5d.0038  ARPA   FastEthernet2/0
// Internet  172.16.2.201            6   00:50.7966.6800  ARPA   FastEthernet2/0
// Internet  172.16.23.1             2   c6:91.0cfa.5265  ARPA   FastEthernet0/0
// Internet  172.16.23.130           -   ca:01.1a5d.0000  ARPA   FastEthernet0/0


// bander@MacBook-Pro-Bander network-topology-discovery % node show_arp_snmp.js

// Interface: 1, IP: 172.16.23.1, MAC: c6:91:0c:fa:52:65, Type: Dynamic
// Interface: 1, IP: 172.16.23.130, MAC: ca:01:1a:5d:00:00, Type: Static
// Interface: 2, IP: 172.16.1.1, MAC: ca:01:1a:5d:00:1c, Type: Static
// Interface: 2, IP: 172.16.1.101, MAC: 00:50:79:66:68:01, Type: Dynamic
// Interface: 3, IP: 172.16.2.1, MAC: ca:01:1a:5d:00:38, Type: Static
// Interface: 3, IP: 172.16.2.201, MAC: 00:50:79:66:68:00, Type: Dynamic