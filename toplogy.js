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
      !interfaceIPs.includes(d.ip)
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
        // Match by subnet using mask from interfaces
        const matchedInterface = interfaces.find(iface => inSameSubnet(iface.ip, device.ip, iface.netmask));
        routerEntry.neighborRouter.push({ ip: device.ip, if: matchedInterface?.interface || null });
        if (!exploredRouterIPs.has(device.ip)) {
          await exploreRouter(device.ip);
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


