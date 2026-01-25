
const BASE_URL = "http://127.0.0.1:8000"; 

export async function askAI(question, context) {
  try {

    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BASE_URL}/explain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    
      body: JSON.stringify({
        question: question,
        context: context,
      }),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized: Please log in.");
    }

    

    if (!response.ok) {
      const error = await response.json();
      console.log("API Error Response:", error.detail);
      throw new Error("Failed to talk to AI");
    }

    const data = await response.json();
    return data.explanation;
    
  } catch (error) {
    console.error("API Error:", error);
    return "Error: Could not connect to the AI brain. Is the backend running?";
  }
}


export async function login_user(username, password) {

  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password",password)

  const response = await fetch(`${BASE_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
    
  });

  if (!response.ok) { 
    const errorData = await response.json().catch(() => ({}));
    console.log(errorData.detail);
    throw new Error("Login failed");
  
  }

  return response.json();
  
}


export async function fetch_current_user() {
  const token = localStorage.getItem("access_token");

  if (!token) { 
    return null;
  }

  const response = await fetch(`${BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
    
  });

  if (!response.ok) { 
    throw new Error("Failed to fetch user");

  }

  return response.json();
}
