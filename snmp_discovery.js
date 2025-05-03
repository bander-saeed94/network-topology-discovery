const snmp = require('net-snmp');

async function snmpTable(session, oid) {
    return new Promise((resolve, reject) => {
        session.table(oid, 20, (error, table) => {
            if (error) reject(error);
            else resolve(table);
        });
    });
}

async function discoverRouterInterfaces(routerIp, community = 'public') {
    const session = snmp.createSession(routerIp, community);
    const interfaces = [];

    try {
        const ipAddrTableOID = '1.3.6.1.2.1.4.20'; // IP Address Table
        const ipTable = await snmpTable(session, ipAddrTableOID);

        for (const [ip, entry] of Object.entries(ipTable)) {
            const ifaceIndex = entry['2']; // Correct interface index OID
            interfaces.push({
                interface: ifaceIndex,
                ip: ip
            });
        }
        console.log('Router Interfaces:', interfaces);
    } catch (error) {
        console.error("Error fetching router interfaces:", error);
    } finally {
        session.close();
    }

    return interfaces;
}

async function discoverCompleteARP(ip, community = 'public') {
    const session = snmp.createSession(ip, community);
    const devices = [];

    try {
        const arpOID = '1.3.6.1.2.1.4.22';
        const arpTable = await snmpTable(session, arpOID);
        // console.log(JSON.stringify(arpTable))
        // const colMAC = '1.3.6.1.2.1.4.22.1.2';
        // const colIP = '1.3.6.1.2.1.4.22.1.3';

        for (const entry of Object.values(arpTable)) {
            const iface = entry["1"];
            const macBuffer = entry["2"]; //colMAC '1.3.6.1.2.1.4.22.1.2';
            const ip = entry["3"]; //colIP  '1.3.6.1.2.1.4.22.1.3';
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

    } catch (error) {
        console.error("Error fetching ARP table:", error);
    } finally {
        session.close();
    }

    return devices;
}

module.exports = { discoverCompleteARP, discoverRouterInterfaces};
