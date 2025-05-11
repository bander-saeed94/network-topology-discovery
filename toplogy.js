const {
  discoverCompleteARP,
  discoverRouterInterfaces
} = require('./snmp_discovery');

async function topology(defaultGateway, communityString) {
  const topology = [];
  const exploredRouters = new Set();       // Prevent revisiting routers
  const routerNameMap = new Map();         // Map IP -> router name

  const communityString = defaultGateway;
  let routerCounter = 1;

  async function exploreRouter(routerIp) {
    if (exploredRouters.has(routerIp)) return;

    // Assign consistent router name
    let routerName = routerNameMap.get(routerIp);
    if (!routerName) {
      routerName = `r${routerCounter++}`;
      routerNameMap.set(routerIp, routerName);
    }

    exploredRouters.add(routerIp);

    const interfaces = await discoverRouterInterfaces(routerIp, communityString);
    const interfaceIPs = interfaces.map(i => i.ip);

    const routerEntry = {
      routerName,
      interfaces,
      neighborRouter: [],
      host: []
    };

    const arpEntries = await discoverCompleteARP(routerIp, communityString).catch(() => []);
    const filteredDevices = arpEntries.filter(d =>
      !interfaceIPs.includes(d.ip) &&
      !exploredRouters.has(d.ip)
    );

    for (const device of filteredDevices) {
      let isRouter = false;

      try {
        const subArp = await discoverCompleteARP(device.ip, communityString);
        if (subArp.length > 0) {
          isRouter = true;
        }
      } catch (err) {
        // Consider device a host if SNMP fails
        isRouter = false;
      }

      if (isRouter) {
        // Recursively explore neighbor router
        routerEntry.neighborRouter.push({ ip: device.ip, if: 1 });  // if: 1 is placeholder
        await exploreRouter(device.ip);
      } else {
        routerEntry.host.push({ ip: device.ip });
      }
    }

    topology.push(routerEntry);
  }

  await exploreRouter(startRouterIP);

  console.log(JSON.stringify(topology, null, 2));
  return topology
}

topology();

// (topology)('172.16.23.20','public')
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

