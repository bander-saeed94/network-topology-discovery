const {
  discoverCompleteARP,
  discoverRouterInterfaces
} = require('./snmp_discovery');

async function topology(defaultGateway, communityString) {
  const topology = [];
  const explored_routers = new Set();

  const startRouterIP = defaultGateway; // Replace with initial router IP

  async function exploreRouter(routerIP, routerName) {
    if (explored_routers.has(routerIP)) return;
    explored_routers.add(routerIP);

    const routerEntry = {
      routerName,
      interfaces: [],
      neighborRouter: [],
      host: []
    };

    const routerInterfaces = await discoverRouterInterfaces(routerIP, communityString);
    const routerInterfaceIPs = routerInterfaces.map(iface => iface.ip);
    routerEntry.interfaces = routerInterfaces;

    const arpDevices = await discoverCompleteARP(routerIP, communityString);
    const unexploredDevices = arpDevices.filter(d => !routerInterfaceIPs.includes(d.ip) && !explored_routers.has(d.ip));

    for (const device of unexploredDevices) {
      const subDevices = await discoverCompleteARP(device.ip, communityString).catch(() => []);

      if (subDevices.length === 0) {
        // It's a host
        routerEntry.host.push({ ip: device.ip });
      } else {
        // It's a router
        routerEntry.neighborRouter.push({ ip: device.ip, if: 1 }); // TODO: refine ifIndex
        await exploreRouter(device.ip, `r${topology.length + 2}`);
      }
    }

    topology.push(routerEntry);
  }

  // Begin recursive exploration
  await exploreRouter(startRouterIP, 'r1');

  console.log(JSON.stringify(topology, null, 2));
}

module.exports = { topology};

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
