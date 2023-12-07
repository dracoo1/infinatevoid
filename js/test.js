///client-side
//Index
function updateBGsize()
{
    var w = window.innerWidth;
    var h = window.innerHeight;
    document.body.style.backgroundSize = w + "px" +" "+ h + 'px';
    
    
}
updateBGsize
window.onresize = updateBGsize

function aButton(but)
{
    
    //var a = localStorage.getItem();
    window.location.href = 'Modded.html';
    alert("button pressed: " + but)
}

//server panel

function TitleUpdater()
{
    document.title = "aa"
}

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('commandInput').addEventListener('keydown', function(event) {
        if (event.key == "Enter") {
            sendCommand();

            document.getElementById('commandInput').value = ""
        }
    });
})

//server-side

var ip = "" //IP here

function runModded() {
    fetch('http://'+ip+':3000/run_modded')
        .then(response => response.text())
        .catch(error => console.error('Error:', error));
}

const consoleDiv = document.getElementById('minecraftConsole');
    const ws = new WebSocket('ws://'+ip+':8080');
    

    ws.onmessage = function(event) {
        try {
            var data = JSON.parse(event.data);
            
            if (data.message !== undefined) {
                console.log("Message: " + data.message);
                var consoleDiv = document.getElementById("minecraftConsole");
                consoleDiv.textContent += data.message + "\n"; // Add new text content
                consoleDiv.scrollTop = consoleDiv.scrollHeight;
                
            } else {
                console.log("Message property is undefined.");
            }
    
            if (data.mod !== undefined) {
                console.log("Mod status aaaaaaa: " + data.mod);
                if (data.mod == "true")
                {
                    document.getElementById('startmod').disabled = true;
                    document.getElementById("status").src = "../images/active.png" ;
                }
                else
                {
                    document.getElementById('startmod').disabled = false;
                    console.log("disabled")
                    document.getElementById("status").src = "../images/disabled.png" ;
                }
            } else {
                console.log("Mod status property is undefined.");
            }
        } catch (e) {
            console.error("Error parsing message: ", e);
        }
    }
    
    
    ws.onerror = function(event) {
        console.error("WebSocket error observed:", event);
    };

function sendCommand() {
    const command = document.getElementById('commandInput').value;
    fetch('http://'+ip+':3000/send-command', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command: command })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Server responded with a ' + response.status + ' status');
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
    });
    
}
