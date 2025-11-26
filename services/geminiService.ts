import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ForensicReport, Verdict } from "../types";

// Schema definition for the JSON response
const reportSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    case_id: { type: Type.STRING },
    verdict: { type: Type.STRING, enum: [
      "LIKELY ORIGINAL / AUTHENTIC",
      "LIKELY PIRATED / UNAUTHORIZED COPY",
      "INCONCLUSIVE – MORE DATA NEEDED"
    ]},
    confidence_score: { type: Type.NUMBER, description: "Score from 0 to 100" },
    summary: { type: Type.STRING },
    key_evidence: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    risk_level: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
    suspicious_urls: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    probable_original_sources: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    data_gaps: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    recommended_actions: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    engine_scores: {
      type: Type.ARRAY, 
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          score: { type: Type.NUMBER }
        }
      }
    }
  },
  required: ["case_id", "verdict", "confidence_score", "summary", "risk_level"]
};

// System instruction based on the user's prompt
const SYSTEM_PROMPT = `
You are the "Decryptc - AI Forensic Piracy Scanner" – a forensic-grade digital content examiner.

Your job is to SIMULATE a full-stack forensic scan (TinEye, Yandex, Audio Fingerprinting, Plagiarism Checkers, Metadata Analysis) based on the input provided.

INPUT HANDLING:
1. IMAGE: Analyze visual content, logos, watermarks, metadata, and EXIF data. Look for stock photos, known artwork, or product images.
2. VIDEO: Analyze keyframes, motion patterns, and audio tracks (if implied). Check for clips from movies, TV shows, or known YouTube videos.
3. PDF: Analyze text content, layout, and embedded images. Check for plagiarism, leaked confidential documents, or copyright markers.
4. DOC/DOCX: Analyze the document structure and metadata. If content cannot be fully parsed, simulate findings based on the metadata and file context.
5. TEXT: Analyze linguistic patterns, specific phrasing, and code snippets. Check against known databases of literature, code, or articles.
6. URL: Simulate a crawl of the target site. Check for pirate streaming signatures, DMCA ignore lists, or suspicious domain reputation.

INSTRUCTIONS:
- If it looks like a famous asset (logo, movie scene, book excerpt), pretend you found matches on TinEye, Yandex, Turnitin, etc.
- If it looks personal or unique, pretend matches are low.
- Generate a JSON report as if you had access to the full backend suite.
- IMPORTANT: "summary" must be a narrative overview. "key_evidence" must be a distinct list of specific findings (e.g. "98% match on Shutterstock", "EXIF data stripped"). Do not copy-paste the summary into key evidence.

OUTPUT: A structured JSON object matching the requested schema.
`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeAsset = async (input: File | string): Promise<ForensicReport> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });

  let parts: any[] = [];

  if (typeof input === 'string') {
    // URL Case
    parts = [{
      text: `Analyze this URL for piracy and authenticity risks: ${input}. \nGenerate a forensic report.`
    }];
  } else {
    // File Case
    // Standard text handling
    if (input.type.startsWith('text/') || input.name.endsWith('.txt') || input.name.endsWith('.md') || input.name.endsWith('.csv') || input.name.endsWith('.json')) {
      const textContent = await fileToText(input);
      parts = [{ text: `Analyze this text content for plagiarism and piracy risks:\n\n${textContent}` }];
    } 
    // Handle supported binaries (PDF, Image, Video)
    else if (isSupportedMimeType(input.type)) {
      const base64Data = await fileToBase64(input);
      parts = [
        {
          inlineData: {
            mimeType: input.type,
            data: base64Data
          }
        },
        {
          text: `Analyze this ${input.type} asset and generate a forensic piracy report based on simulated reverse search and metadata analysis.`
        }
      ];
    }
    // Handle unsupported binaries (e.g., DOCX) by simulation based on metadata
    else {
      parts = [{
        text: `Perform a simulated forensic analysis on this file.\n\nFile Name: ${input.name}\nFile Size: ${input.size} bytes\nFile Type: ${input.type}\n\nSince direct content analysis is not available for this file type via the current interface, simulate findings based on the metadata and common piracy patterns associated with this file format.`
      }];
    }
  }

  let attempts = 0;
  // Increased attempts and initial delay to handle aggressive rate limits
  const maxAttempts = 5; 
  let delay = 4000; 

  while (true) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: reportSchema,
          temperature: 0.2,
        },
        contents: [{ parts }]
      });

      const textResponse = response.text;
      if (!textResponse) throw new Error("No response from AI");

      return JSON.parse(textResponse) as ForensicReport;

    } catch (error: any) {
      attempts++;
      
      // Robust error checking for nested API errors
      // API often returns: { error: { code: 429, message: "...", status: "RESOURCE_EXHAUSTED" } }
      const errorCode = error.status || error.code || error?.error?.code || error?.error?.status;
      const errorMessage = error.message || error?.error?.message || JSON.stringify(error);
      
      const isRateLimit = 
        errorCode === 429 || 
        errorCode === 'RESOURCE_EXHAUSTED' || 
        (typeof errorMessage === 'string' && (
          errorMessage.includes('429') || 
          errorMessage.includes('quota') || 
          errorMessage.includes('RESOURCE_EXHAUSTED')
        ));
      
      if (isRateLimit && attempts < maxAttempts) {
        console.warn(`Gemini rate limit hit. Retrying in ${delay}ms... (Attempt ${attempts}/${maxAttempts})`);
        await sleep(delay);
        delay *= 2; // Exponential backoff
        continue;
      }
      
      console.error("Gemini Analysis Error:", error);
      // Re-throw the error if it's not a rate limit or we've exhausted retries
      throw error;
    }
  }
};

const isSupportedMimeType = (mime: string) => {
  return (
    mime === 'application/pdf' ||
    mime.startsWith('image/') ||
    mime.startsWith('video/')
  );
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};