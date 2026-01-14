// frontend/src/lib/api.js

// This is the address of your Python Backend
const BACKEND_URL = "http://127.0.0.1:8000"; 

export async function askAI(selectedText, pageContext) {
  try {
    // We send a POST request (like mailing a letter) to the backend
    const response = await fetch(`${BACKEND_URL}/explain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // We package our data into JSON format
      body: JSON.stringify({
        selected_text: selectedText,
        page_context: pageContext,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to talk to AI");
    }

    // We wait for the answer and unbox it
    const data = await response.json();
    return data.explanation;
    
  } catch (error) {
    console.error("API Error:", error);
    return "Error: Could not connect to the AI brain. Is the backend running?";
  }
}