const express = require('express');
const app = express();
const path = require('path');
const gateway = require('default-gateway');
const { topology } = require('./toplogy')
async function getGatewayIP() {
    try {
        const result = await gateway.gateway4sync();
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
app.get('/api/topology', async (req, res) => {
    try {
        const routerIP = await getGatewayIP();;
        const communityString = 'public'; // Replace if different
        const toplogyResult = await topology(routerIP, communityString);
        res.json(toplogyResult);
    } catch (error) {
        console.error("Error in discovery:", error);
        res.status(500).send('Discovery failed');
    }
});
// Start server
const PORT = 3000;
app.listen(PORT, () => { console.log(`Server running at http://localhost:${PORT}`); });