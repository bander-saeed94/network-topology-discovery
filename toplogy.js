const {
  discoverCompleteARP,
  discoverRouterInterfaces
} = require('./snmp_discovery');

function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
}

function inSameSubnet(ip1, ip2, netmask) {
  const mask = ipToInt(netmask);
  return (ipToInt(ip1) & mask) === (ipToInt(ip2) & mask);
}

async function topology(defaultGateway, communityString) {
  const topology = [];
  const exploredRouterIPs = new Set();
  const routerNameMap = new Map();
  const knownRouterMacs = new Set();
  const routerLevels = new Map();

  let routerCounter = 1;

  async function exploreRouter(routerIp, level = 1) {
    if ([...exploredRouterIPs].includes(routerIp)) return;

    const interfaces = await discoverRouterInterfaces(routerIp, communityString).catch(() => []);
    const interfaceIPs = interfaces.map(i => i.ip);

    // Skip if any interface IP already discovered
    for (const ip of interfaceIPs) {
      if (exploredRouterIPs.has(ip)) return;
    }

    const routerName = `r${routerCounter++}`;
    routerLevels.set(routerName, level);

    for (const ip of interfaceIPs) {
      routerNameMap.set(ip, routerName);
      exploredRouterIPs.add(ip);
    }

    const routerEntry = {
      routerName,
      interfaces,
      neighborRouter: [],
      host: [],
      level
    };

    const arpEntries = await discoverCompleteARP(routerIp, communityString).catch(() => []);
    const filteredDevices = arpEntries.filter(d => !interfaceIPs.includes(d.ip));

    for (const device of filteredDevices) {
      let isRouter = false;

      try {
        const subArp = await discoverCompleteARP(device.ip, communityString);
        if (subArp.length > 0) isRouter = true;
      } catch {}

      if (isRouter) {
        const matchedInterface = interfaces.find(iface =>
          inSameSubnet(iface.ip, device.ip, iface.netmask)
        );
        routerEntry.neighborRouter.push({ ip: device.ip, if: matchedInterface?.interface || null });

        if (!exploredRouterIPs.has(device.ip)) {
          await exploreRouter(device.ip, level + 1);
        }
      } else {
        routerEntry.host.push({ ip: device.ip });
      }
    }

    // ✅ Now mark MACs after neighbors have been explored
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


