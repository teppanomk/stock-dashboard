const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSfUYEYX8MIGIYW5hTWf2hz_j0VT7TBiZlAWkB183PuT25msmPFtizLvmD9ktXgV4aMj2e8E6IACs6U/pub?gid=0&single=true&output=csv";

const API_KEY = "YOUR_GEMINI_API_KEY";

let knowledgeBase = "";

async function loadSheet() {

    const res = await fetch(SHEET_URL);
    const csv = await res.text();

    const rows = csv.split("\n");

    for (let i = 1; i < rows.length; i++) {

        const cols = rows[i].split(",");

        if (cols.length >= 2) {

            const topic = cols[0];
            const content = cols.slice(1).join(",");

            knowledgeBase += `Topic: ${topic}\nContent: ${content}\n\n`;
        }
    }

    console.log("Sheet loaded");
}

function addMessage(text, sender){

    const chat = document.getElementById("chat");

    const div = document.createElement("div");

    div.className = sender;

    div.innerText = text;

    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;
}

async function sendMessage(){

    const input = document.getElementById("userInput");

    const question = input.value;

    if(!question) return;

    addMessage(question,"user");

    input.value="";

    const prompt = `
You are a thesis assistant.

Answer using ONLY the knowledge below.

${knowledgeBase}

Question: ${question}
`;

    try{

        const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                contents:[
                    {
                        parts:[
                            {text: prompt}
                        ]
                    }
                ]
            })
        });

        const data = await res.json();

        console.log(data);

        const reply = data.candidates[0].content.parts[0].text;

        addMessage(reply,"bot");

    }catch(err){

        console.error(err);

        addMessage("Error connecting to AI.","bot");
    }
}

loadSheet();
