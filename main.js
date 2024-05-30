import { GoogleGenerativeAI } from "@google/generative-ai";

// Fetch your API_KEY
const API_KEY = "AIzaSyCWtY-U7oeb4DE-x_AdN6Uip3CaoNCmFvU"; // Replace with your actual API key

// Access your API key
const genAI = new GoogleGenerativeAI(API_KEY);

// Function to convert File object to a GoogleGenerativeAI.Part object
async function fileToGenerativePart(file) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

let chatHistory = [];

document.getElementById("generate-btn").addEventListener("click", async () => {
  const prompt = document.getElementById("prompt").value;
  const fileInputEl = document.getElementById("image-input");
  const imageFiles = [...fileInputEl.files];
  const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let result;
  if (imageParts.length > 0) {
    result = await model.generateContent([prompt, ...imageParts]);
  } else {
    result = await model.generateContent(prompt);
  }

  const response = await result.response;
  const text = await response.text();

  chatHistory.push({ prompt, response: text });
  updateChatHistory();
});

function updateChatHistory() {
  const chatHistoryDiv = document.getElementById("chat-history");
  chatHistoryDiv.innerHTML = chatHistory.map(chat => `
    <div class="chat-entry">
      <div class="user-prompt"><strong>You:</strong> ${chat.prompt}</div>
      <div class="api-response"><strong>Gemini:</strong> ${chat.response}</div>
    </div>
  `).join('');
}
