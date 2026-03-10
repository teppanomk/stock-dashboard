const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSfUYEYX8MIGIYW5hTWf2hz_j0VT7TBiZlAWkB183PuT25msmPFtizLvmD9ktXgV4aMj2e8E6IACs6U/pub?gid=0&single=true&output=csv";

const API_KEY = "AIzaSyDActonX6RSYaUXnJOU2t5TpsjePulhZNc";

let knowledgeBase = "";

async function loadSheetData() {
    const res = await fetch(sheetURL);
    const csv = await res.text();

    const rows = csv.split("\n").slice(1);

    knowledgeBase = rows.map(row => {
        const cols = row.split(",");
        return `Topic: ${cols[0]} \nContent: ${cols[1]}`;
    }).join("\n\n");
}

function addMessage(text, sender) {

    const chat = document.getElementById("chat");

    const msg = document.createElement("div");
    msg.className = "message " + sender;

    msg.innerText = text;

    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {

    const input = document.getElementById("userInput");
    const question = input.value;

    if(!question) return;

    addMessage(question,"user");
    input.value = "";

    const prompt = `
You are a thesis information assistant.

Only answer based on the knowledge below.

${knowledgeBase}

Question: ${question}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            contents:[
                {
                    parts:[{text:prompt}]
                }
            ]
        })
    });

    const data = await response.json();

    const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't find an answer.";

    addMessage(reply,"bot");
}

loadSheetData();
