const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSfUYEYX8MIGIYW5hTWf2hz_j0VT7TBiZlAWkB183PuT25msmPFtizLvmD9ktXgV4aMj2e8E6IACs6U/pub?gid=0&single=true&output=csv";

const API_KEY = "YOUR_GEMINI_API_KEY";

let knowledgeBase = "";
let loaded = false;

async function loadSheetData() {

    const res = await fetch(sheetURL);
    const csv = await res.text();

    const rows = csv.split("\n").slice(1);

    knowledgeBase = rows.map(row => {

        const firstComma = row.indexOf(",");

        if (firstComma === -1) return "";

        const topic = row.substring(0, firstComma);
        const content = row.substring(firstComma + 1);

        return `Topic: ${topic}\nContent: ${content}`;

    }).join("\n\n");

    loaded = true;

    console.log("Knowledge loaded:", knowledgeBase);
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

    if (!loaded) {
        addMessage("Loading thesis knowledge... please wait.", "bot");
        return;
    }

    const input = document.getElementById("userInput");
    const question = input.value.trim();

    if (!question) return;

    addMessage(question, "user");
    input.value = "";

    const prompt = `
You are a thesis assistant chatbot.

Answer ONLY using the knowledge below.
If the answer is not found, say "This information is not available in the thesis database."

Knowledge:
${knowledgeBase}

Question:
${question}
`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        }
    );

    const data = await response.json();

    console.log(data);

    const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't find an answer.";

    addMessage(reply, "bot");
}

loadSheetData();
