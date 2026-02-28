import { GoogleGenAI } from "@google/genai";
import { DigParams, TrackData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Search Entropy: Random modifiers to ensure every dig yields different results
// even for the same user or different users starting fresh.
const ADJECTIVES = [
  "Obscure", "Private Press", "B-Side", "Undiscovered", "Sample material", 
  "Heavy", "Mellow", "Psychedelic", "Funky", "Raw", "Cinematic", "Experimental",
  "Rare groove", "Underground", "Forgotten", "Dusty"
];

const REGIONS = [
  "Japan", "Brazil", "Italy", "France", "Germany", "USA", "UK", 
  "USSR", "Sweden", "Netherlands", "Poland", "Turkey", "Spain", "Global"
];

// Helper to extract JSON from the response text
function extractJson(str: string): any {
  try {
    return JSON.parse(str);
  } catch (e) {
    const match = str.match(/```json\s*([\s\S]*?)\s*```/) || str.match(/\{[\s\S]*\}/);
    if (match) {
        try {
            return JSON.parse(match[1] || match[0]);
        } catch (e2) {
            return null;
        }
    }
    return null;
  }
}

// Helper to extract YouTube ID from various URL formats
function getYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export const digForRecord = async (params: DigParams, excludeList: string[] = []): Promise<TrackData> => {
  const model = "gemini-3-flash-preview";

  // 1. Calculate Entropy
  const randomAdj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const randomRegion = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  const randomSeed = Math.floor(Math.random() * 100000);

  // 2. Randomized Query construction
  // We inject the adjective and region into the search query to force Google Search
  // to return different subsets of the "crate" (YouTube channels).
  const query = `Andre Navarro II Oleg Samples Libraries Soundtracks ${params.genre} ${params.decade} vinyl ${randomAdj} ${randomRegion === 'Global' ? '' : randomRegion}`;

  // Performance: Limit exclude list size
  const recentExcludes = excludeList.slice(-50);

  const prompt = `
    Find a specific, real YouTube video URL for a rare music track from sampling channels like: "Andre Navarro II", "Oleg Samples", "Libraries, Soundtracks and Related", "Vinyl Archeologie".
    
    Search Context:
    - Genre: ${params.genre}
    - Decade: ${params.decade}
    - Vibe/Focus: ${randomAdj}
    - Region Focus: ${randomRegion} (Try to find something from here if possible, otherwise anywhere)
    - Random Seed: ${randomSeed} (Use this to pick a random track from the search results, do not just pick the first one)

    Ignore these tracks: ${JSON.stringify(recentExcludes)}.
    
    Return strictly JSON:
    {
      "artist": "string",
      "title": "string",
      "year": "string",
      "label": "string",
      "genre": "string",
      "country": "string",
      "description": "Brief sound description",
      "youtubeUrl": "Direct YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const text = response.text;
    
    if (!text) throw new Error("Empty response");

    const data = extractJson(text);
    
    if (!data) throw new Error("Invalid JSON");

    // Extract ID to enable embedded player
    const videoId = getYoutubeId(data.youtubeUrl);
    
    // If we found an ID, reconstruct a clean watch URL, otherwise fallback to search
    let finalUrl = data.youtubeUrl;
    if (!videoId) {
        // Fallback search now uses only Artist + Title
        const queryTerm = `${data.artist || ""} ${data.title || ""}`;
        finalUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(queryTerm)}`;
    } else {
        finalUrl = `https://www.youtube.com/watch?v=${videoId}`;
    }

    return {
      artist: data.artist || "Unknown Artist",
      title: data.title || "Untitled Track",
      year: data.year || "19??",
      label: data.label || "Unknown Label",
      genre: data.genre || params.genre,
      country: data.country || randomRegion,
      description: data.description || `A ${randomAdj} find from the crates.`,
      youtubeId: videoId, // Now populated if found
      youtubeUrl: finalUrl,
      catalogNumber: "CRATE-" + Math.floor(Math.random() * 1000)
    };

  } catch (error) {
    console.error("Digging error:", error);
    return {
      artist: "System Glitch",
      title: "Connection Lost",
      year: "----",
      label: "Try Again",
      genre: params.genre,
      description: "The signal was lost in the noise. Please press DIG again.",
      youtubeId: null,
      youtubeUrl: "#",
    };
  }
};