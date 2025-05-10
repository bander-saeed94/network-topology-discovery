const { discoverDevices, discoverNetwork, discoverCompleteARP, discoverRouterInterfaces } = require('./snmp_discovery');


async function topology(params) {
    const explored_routers = [];
    // const routerIP = await getGatewayIP();
    const routerIP = '172.16.23.20'; // Replace with your router IP
    const communityString = 'public'; // Replace if different

    //
    const routerInterfaces = await discoverRouterInterfaces(routerIP, communityString);
    const routerInterfaceIPs = routerInterfaces.map(iface => iface.ip); // assuming each has an `ip` field

    //
    const devices = await discoverCompleteARP(routerIP, communityString);

    // exclude router routerInterfaces
    //
    const devicesToExpolre = devices.filter(device => {
        return !routerInterfaceIPs.includes(device.ip); // assuming each device has an `ip` field
    });
    //

    explored_routers.push(routerIP)
    // detect which are routers
    const routers = []
    for (deviceToExplore in devicesToExpolre) {
        let devices = await discoverCompleteARP(routerIP, communityString);
        if (devices.length == 0) {
            console.log(`${devicesToExpolre['ip']} is host`)
            // associate hosts with its router interfaces
        } else {
            console.log(`${devicesToExpolre['ip']} is router`)
            //reapet for same 
        }
    }

}

(topology)()
