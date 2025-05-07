const express = require('express');
const app = express();
const path = require('path');
const { discoverDevices, discoverNetwork, discoverCompleteARP, discoverRouterInterfaces } = require('./snmp_discovery');
const gateway = require('default-gateway');

async function getGatewayIP() {
    try {
        const result = await gateway.v4();
        console.log("Detected gateway IP:", result.gateway);
        return result.gateway;
    } catch (err) {
        console.error("Error detecting gateway IP:", err);
        throw err;
    }
}

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to trigger complete ARP discovery
app.get('/api/discover', async (req, res) => {
    try {
        const routerIP = await getGatewayIP();;
        // const routerIP = '172.16.23.130'; // Replace with your router IP
        const communityString = 'public'; // Replace if different
        const devices = await discoverCompleteARP(routerIP, communityString);

        res.json(devices);
    } catch (error) {
        console.error("Error in discovery:", error);
        res.status(500).send('Discovery failed');
    }
});
app.get('/api/router/interfaces', async (req, res) => {
    try {
        const routerIP = await getGatewayIP();;
        // const routerIP = '172.16.23.130';
        const interfaces = await discoverRouterInterfaces(routerIP);
        res.json(interfaces);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to retrieve router interfaces');
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
