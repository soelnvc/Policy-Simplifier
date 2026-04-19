import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Initialize the SDK with the environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY is missing in .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Defines the strict schema we want Gemini to return in JSON.
 * This exactly matches the mock format our UI relies on.
 */
const policyAnalysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    policyOverview: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: "Name of the insurance policy or document." },
        type: { type: SchemaType.STRING, description: "Type of insurance (e.g., Health, Auto, Life, Home)." },
        provider: { type: SchemaType.STRING, description: "The insurance company issuing the policy." },
        policyNumber: { type: SchemaType.STRING, description: "Policy or group reference number, if explicitly stated." },
        effectiveDate: { type: SchemaType.STRING, description: "Start date of the policy (YYYY-MM-DD or readable string)." },
        expiryDate: { type: SchemaType.STRING, description: "End date of the policy (YYYY-MM-DD or readable string)." },
        sumInsured: { type: SchemaType.STRING, description: "The total coverage amount or Insured Declared Value." },
        premium: { type: SchemaType.STRING, description: "The premium cost, if stated." },
      },
      required: ["name", "type", "provider"],
    },
    coverageScore: {
      type: SchemaType.INTEGER,
      description: "A calculated score out of 100 representing the comprehensiveness of the policy.",
    },
    coverageGrade: {
      type: SchemaType.STRING,
      description: "A letter grade corresponding to the coverageScore (e.g., A+, B-, C).",
    },
    summary: {
      type: SchemaType.STRING,
      description: "A concise, 3-4 sentence plain English summary of the policy, highlighting the core benefit and primary major drawback.",
    },
    coverageItems: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          category: { type: SchemaType.STRING, description: "E.g., Hospitalization, Own Damage, Maternity." },
          status: { type: SchemaType.STRING, description: "Must be exactly 'covered', 'partial', or 'not_covered'." },
          detail: { type: SchemaType.STRING, description: "1-sentence context on the coverage limit or scope." },
        },
        required: ["category", "status", "detail"],
      },
      description: "List of 5 to 7 key coverage categories and their status.",
    },
    exclusions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "The name of the exclusion." },
          severity: { type: SchemaType.STRING, description: "Must be exactly 'low', 'medium', or 'high'." },
          detail: { type: SchemaType.STRING, description: "1-sentence plain English explanation of the exclusion." },
        },
        required: ["title", "severity", "detail"],
      },
      description: "List of 3 to 5 critical exclusions the user must be aware of.",
    },
    keyTerms: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          term: { type: SchemaType.STRING, description: "The actual jargon term." },
          meaning: { type: SchemaType.STRING, description: "Clear, zero-jargon translation of what it means for the user's wallet." },
        },
        required: ["term", "meaning"],
      },
      description: "List of 3 to 5 deciphered legal/insurance jargon terms found in the document.",
    },
    riskFlags: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          flag: { type: SchemaType.STRING, description: "A catchy phrase identifying the risk." },
          level: { type: SchemaType.STRING, description: "Must be exactly 'info', 'warning', or 'critical'." },
          detail: { type: SchemaType.STRING, description: "Why this is dangerous for the user and in what scenario." },
        },
        required: ["flag", "level", "detail"],
      },
      description: "List of 2 to 4 hidden risks or 'gotcha' clauses in the fine print.",
    },
  },
  required: [
    "policyOverview",
    "coverageScore",
    "coverageGrade",
    "summary",
    "coverageItems",
    "exclusions",
    "keyTerms",
    "riskFlags",
  ],
};

/**
 * Converts a File object into the inlineData format Gemini needs for attachments.
 */
function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result is something like "data:application/pdf;base64,JVBERi0..."
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type || "application/pdf"
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file); // Convert file to base64 string
  });
}

/**
 * The main AI analysis function wrapping Gemini execution.
 * @param {File} file - The uploaded insurance document (PDF/Image)
 * @param {function} onProgress - Callback for UI loading stages
 * @returns {Promise<object>} The fully parsed JSON matching the UI schema
 */
export async function analyzePolicy(file, onProgress) {
  if (!API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not configured in .env');
  }

  try {
    onProgress?.(10, 'Initializing AI engine...');
    
    // Convert PDF/File to Base64
    onProgress?.(30, 'Uploading document to inference pipeline...');
    const filePart = await fileToGenerativePart(file);

    onProgress?.(50, 'Analyzing clauses and fine print...');
    
    // We use gemini-1.5-flash as it supports massive contexts (PDFs) and is extremely fast
    // Switching to gemini-2.5-flash as requested by user
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: policyAnalysisSchema,
        temperature: 0.1, // Even lower for maximum accuracy
      },
    });

    const prompt = `
      You are an expert insurance underwriter and consumer advocate. Your job is to thoroughly read the attached insurance policy document and extract the exact parameters requested in the JSON schema.
      
      Instructions:
      1. Decode complex legal jargon into plain, actionable English.
      2. Identify what is genuinely covered vs what has sneaky sub-limits ("partial" coverage).
      3. Scrutinize the fine print for exclusions and waiting periods, grading their severity.
      4. If a field (like premium cost) is completely absent from the document, omit it or use "—" rather than hallucinating.
      5. Calculate a fair coverageScore (0-100) based on industry standards for this type of policy, penalizing for severe hidden risks.
      
      Analyze the attached archive/document now:
    `;

    onProgress?.(70, 'Structuring insights and generating score...');
    
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    const responseText = response.text();
    
    onProgress?.(95, 'Finalizing report...');
    const parsedData = JSON.parse(responseText);
    
    return {
      ...parsedData,
      analyzedAt: new Date().toISOString(),
      fileName: file.name,
      fileSize: file.size,
    };
    
  } catch (err) {
    console.error("Gemini Analysis Error Detail:", {
      message: err.message,
      status: err.status,
      name: err.name,
      stack: err.stack
    });
    throw err;
  }
}

/**
 * Helper strictly for UI format. Keeps parity with mock logic.
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
