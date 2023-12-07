const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// gnable CORS for all routes
app.use(cors());

// global variables
let minecraftServer;
const wss = new WebSocket.Server({ port: 8080 }); // initialize WebSocket server

wss.on('connection', function connection(ws) {
    console.log('A new client connected');
    ws.on('close', () => console.log('Client disconnected'));
});

function broadcastModdedServer(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            const data = JSON.stringify({ message: message });
            client.send(data);
        }
    });
}

function broadcastStatus(mod) {
    console.log("Broadcasting mod status:", mod);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            const data = JSON.stringify({ mod: mod });
            client.send(data);
        }
    });
}




app.get('/run_modded', (req, res) => {
    // Path to  Minecraft server executable
    const minecraftServerPath = '/home/duck/servers/minecraft/vanilla/V1.18.2/server.jar';

    // Options for spawning the process
    const options = { cwd: path.dirname(minecraftServerPath) };

    // Spawn the Minecraft server process and assign to the global variable
    ModdedServer = spawn('java', ['-Xmx1024M', '-Xms1024M', '-jar', minecraftServerPath, 'nogui'], options);

    // Create a write stream for logging
    const logStream = fs.createWriteStream('minecraftServer.log', { flags: 'a' });

    // Log stdout and stderr to file and broadcast
    ModdedServer.stdout.on('data', (data) => {
        console.log(`STDOUT: ${data}`);
        broadcastModdedServer(`STDOUT: ${data}`);
        logStream.write(`STDOUT: ${data}`);
    });

    ModdedServer.stderr.on('data', (data) => {
        console.error(`STDERR: ${data}`);
        broadcastModdedServer(`STDERR: ${data}`);
        logStream.write(`STDERR: ${data}`);
    });

    res.send('Modded Minecraft server started.');
});


// Serve static files from 'public' directory
app.use(express.static('public')); 

// Endpoint to run the Bash script
app.get('/run-script', (req, res) => {
    exec('./scripty/test.sh', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Script execution failed: ${stderr}`);
        }
        res.send(`Script Output: ${stdout}`);
    });
});



app.use(express.json()); // Middleware to parse JSON bodies

app.post('/send-command', (req, res) => {
    const command = req.body.command;
    
    if (ModdedServer && command) {
        ModdedServer.stdin.write(command + '\n');
        res.send({ message: 'Command sent' });
        
    } else {
        res.status(400).send({ error: 'Server not running or no command provided' });
    }
});


function isServerRunning() {
    // process.kill sends signal 0 if the process is running, throws an error otherwise
    try {
        process.kill(ModdedServer.pid, 0);
        return true;
    } catch (e) {
        return false;
    }
}

var mod;

// Define the interval (in milliseconds)
const interval = 2000; // 1000 milliseconds = 1 second

// Start the interval
const serverCheckInterval = setInterval(() => {
    if (isServerRunning()) {
        mod = "true";
    } else {
        mod = "false";
    }
    broadcastStatus(mod);
}, interval);


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

