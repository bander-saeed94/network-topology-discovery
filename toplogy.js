const {
  discoverCompleteARP,
  discoverRouterInterfaces
} = require('./snmp_discovery');

async function topology(defaultGateway, communityString) {
  const topology = [];
  const exploredRouterIPs = new Set();         // All known router interface IPs
  const routerNameMap = new Map();             // IP -> routerName
  const knownRouterMacs = new Set();           // MACs belonging to routers

  let routerCounter = 1;

  async function exploreRouter(routerIp) {
    if ([...exploredRouterIPs].includes(routerIp)) return;

    const interfaces = await discoverRouterInterfaces(routerIp, communityString).catch(() => []);
    const interfaceIPs = interfaces.map(i => i.ip);

    // Skip if any interface IP already discovered
    for (const ip of interfaceIPs) {
      if (exploredRouterIPs.has(ip)) return;
    }

    const routerName = `r${routerCounter++}`;
    for (const ip of interfaceIPs) {
      routerNameMap.set(ip, routerName);
      exploredRouterIPs.add(ip);
    }

    const routerEntry = {
      routerName,
      interfaces,
      neighborRouter: [],
      host: []
    };
    
    const arpEntries = await discoverCompleteARP(routerIp, communityString).catch(() => []);

    const filteredDevices = arpEntries.filter(d =>
      !interfaceIPs.includes(d.ip) &&
      !exploredRouterIPs.has(d.ip) &&
      !knownRouterMacs.has(d.mac)
    );

    for (const device of filteredDevices) {
      let isRouter = false;

      try {
        const subArp = await discoverCompleteARP(device.ip, communityString);
        if (subArp.length > 0) {
          isRouter = true;
        }
      } catch (err) {
        isRouter = false;
      }

      if (isRouter) {
        routerEntry.neighborRouter.push({ ip: device.ip, if: device.interface });
        await exploreRouter(device.ip);
      } else {
        routerEntry.host.push({ ip: device.ip });
      }
    }
    // 🟩 Mark this router's MAC addresses as known
    for (const entry of arpEntries) {
      knownRouterMacs.add(entry.mac);
    }

    topology.push(routerEntry);
  }

  await exploreRouter(defaultGateway);

  console.log(JSON.stringify(topology, null, 2));
  return topology;
}

// Example usage:
// topology('172.16.23.20', 'public');

module.exports = { topology };

// topology();

// [
//   {
//     "routerName": "r1",
//     "interfaces": [
//       { "ip": "172.16.23.20", "if": 1 },
//       { "ip": "172.16.8.1", "if": 2 }
//     ],
//     "neighborRouter": [
//       { "ip": "172.16.2.1", "if": 1 }
//     ],
//     "host": [
//       { "ip": "172.16.8.2" }
//     ]
//   },
//   {
//     "routerName": "r2",
//     ...
//   }
// ]

// [
//   {
//     "routerName": "r1",
//     "interfaces": [
//       {
//         "interface": 2,
//         "ip": "172.16.1.1"
//       },
//       {
//         "interface": 4,
//         "ip": "172.16.2.1"
//       },
//       {
//         "interface": 3,
//         "ip": "172.16.8.1"
//       },
//       {
//         "interface": 1,
//         "ip": "172.16.23.20"
//       }
//     ],
//     "neighborRouter": [],
//     "host": [
//       {
//         "ip": "172.16.23.21"
//       },
//       {
//         "ip": "172.16.2.2"
//       }
//     ]
//   }
// ]

