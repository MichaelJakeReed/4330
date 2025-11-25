import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

//takes a user’s text prompt and returns a list of songs in the format "Artist - Song Title".
export async function generateSongs(prompt: string) {
  //model choice
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  //tell gemeni how to act according to user prompt
  const input = `
You are a expert music curator. Generate 25 songs unless otherwise stated in the format "Artist - Song Title" based on the concept: "${prompt}".
Just return the list, one per line.
  `;
  //send the request to Gemini.
  const resp = await model.generateContent(input);
  //extract the raw text from Gemini’s response so spotify can read
  return resp.response.text().split("\n").filter((s) => s.includes(" - "));
}
