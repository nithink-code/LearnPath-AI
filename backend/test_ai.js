import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function test() {
  const models = [
    "google/gemini-2.0-flash-lite-preview-02-05:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "openrouter/free"
  ];

  for (const model of models) {
    try {
      console.log(`Testing model: ${model}...`);
      const completion = await client.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 10
      });
      console.log(`Success for ${model}: ${completion.choices[0].message.content}`);
    } catch (err) {
      console.error(`Error for ${model}: ${err.message}`);
    }
  }
}

test();
