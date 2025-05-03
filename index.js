const express = require('express');
const app = express();
const path = require('path');
const { discoverDevices, discoverNetwork, discoverCompleteARP, discoverRouterInterfaces } = require('./snmp_discovery');

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to trigger complete ARP discovery
app.get('/api/discover', async (req, res) => {
    try {
        const routerIP = '172.16.137.20';
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
        const routerIP = '172.16.137.20';
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
