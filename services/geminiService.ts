import { GoogleGenAI } from "@google/genai";
import { GenerationResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert Frontend Engineer and UI/UX Designer specialized in Tailwind CSS. 
Your task is to generate complete, production-ready, single-file HTML code based on user requests.

RULES:
1. The output MUST be a valid, standalone HTML string containing <html>, <head>, and <body> tags.
2. You MUST use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>.
3. Include font-awesome or Google Fonts if needed for icons/typography (e.g., Inter font, FontAwesome CDN).
4. The design MUST be fully responsive (Mobile-First approach).
5. Use "https://picsum.photos/width/height" for any placeholder images.
6. Make the design modern, clean, and visually appealing (high contrast, good spacing, rounded corners).
7. IMPORTANT: Ensure all buttons have modern interactive styles: use hover effects (e.g., hover:bg-opacity-90, hover:scale-105, hover:shadow-lg) and smooth transitions (transition-all duration-300).
8. If the user asks to modify an existing page, apply the changes to the provided code while maintaining the rest of the structure.
9. Do NOT use external CSS files. All styling must be utility classes or internal <style> blocks if absolutely necessary for animations.

RESPONSE FORMAT:
Your response must strictly follow this text format (do not use JSON):

### SUMMARY ###
(Write a very short, single-sentence summary of what you created or changed)

### HTML ###
(Write the complete, valid HTML code here starting with <!DOCTYPE html>)
`;

export const generatePageContent = async (
  prompt: string, 
  currentHtml?: string
): Promise<GenerationResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let finalPrompt = prompt;
  
  if (currentHtml) {
    finalPrompt = `
    CURRENT CODE:
    ${currentHtml}
    
    USER REQUEST:
    ${prompt}
    
    INSTRUCTION:
    Update the CURRENT CODE based on the USER REQUEST. Return the full updated HTML in the specified format.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, 
      },
    });

    const text = response.text || "";
    
    // Robust parsing of the custom format
    const summaryRegex = /### SUMMARY ###\s*([\s\S]*?)\s*### HTML ###/i;
    const htmlRegex = /### HTML ###\s*([\s\S]*)/i;

    const summaryMatch = text.match(summaryRegex);
    const htmlMatch = text.match(htmlRegex);

    if (!htmlMatch) {
      // Fallback: Check if the text itself looks like HTML if the markers are missing
      if (text.trim().includes("<!DOCTYPE html>") || text.trim().includes("<html")) {
         return {
           summary: "Generated page content.",
           html: text.replace(/```html/g, '').replace(/```/g, '').trim()
         };
      }
      throw new Error("Invalid response format from AI. Could not find HTML content.");
    }

    let html = htmlMatch[1].trim();
    // Clean up markdown code blocks if the AI added them
    if (html.startsWith("```")) {
       html = html.replace(/^```(html)?/, '').replace(/```$/, '').trim();
    }

    return {
      summary: summaryMatch ? summaryMatch[1].trim() : "Page generated successfully.",
      html: html
    };

  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
};