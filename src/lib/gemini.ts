/**
 * Gemini API utility for file analysis (images, PDFs, DOCX)
 * Uses domain-restricted API key for client-side usage
 */

import mammoth from "mammoth"

const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

export interface GeminiFileAnalysis {
  text: string
  error?: string
}

/**
 * Converts a file to base64 data URL
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Calls Gemini API with the given parts
 */
async function callGeminiAPI(parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }>): Promise<string> {
  const response = await fetch(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.error?.message || `API request failed with status ${response.status}`
    )
  }

  const data = await response.json()

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response format from Gemini API')
  }

  return data.candidates[0].content.parts[0].text
}


/**
 * Analyzes a file (image, PDF, or DOCX) using Gemini API
 * @param file - The file to analyze (image, PDF, or DOCX)
 * @param prompt - Optional custom prompt (defaults to biology-focused analysis)
 * @returns Analysis text or error message
 */
export async function analyzeFileWithGemini(
  file: File,
  prompt?: string
): Promise<GeminiFileAnalysis> {
  if (!GEMINI_API_KEY) {
    return {
      text: '',
      error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.'
    }
  }

  const isImage = file.type.startsWith('image/')
  const isPDF = file.type === 'application/pdf'
  const isDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.name.toLowerCase().endsWith('.docx')

  // Check if file is supported
  if (!isImage && !isPDF && !isDOCX) {
    return {
      text: '',
      error: 'File type not supported. Please upload an image, PDF, or DOCX file.'
    }
  }

  try {
    // Handle DOCX files separately - extract text using mammoth
    if (isDOCX) {
      // Convert file to ArrayBuffer for mammoth
      const arrayBuffer = await file.arrayBuffer()
      
      // Extract text from DOCX using mammoth
      const result = await mammoth.extractRawText({ arrayBuffer })
      const extractedText = result.value

      if (!extractedText || extractedText.trim().length === 0) {
        return {
          text: '',
          error: 'Could not extract text from DOCX file. The file might be empty or corrupted.'
        }
      }

      // Default prompt for DOCX text analysis
      const defaultPrompt = `Ανάλυσε αυτό το κείμενο από ένα αρχείο DOCX σε σχέση με τη βιολογία. 
Περιγράψε το περιεχόμενο, αναγνώρισε βιολογικές έννοιες ή δομές, και εξήγησε τη σημασία τους.
Αν το κείμενο δεν σχετίζεται με βιολογία, απλά περιγράψε το περιεχόμενο.

Κείμενο:
${extractedText}`

      const analysisPrompt = prompt 
        ? `${prompt}\n\nΚείμενο:\n${extractedText}`
        : defaultPrompt

      // Call Gemini API with text only (no file attachment)
      const analysisText = await callGeminiAPI([{ text: analysisPrompt }])

      return {
        text: analysisText
      }
    }

    // Handle images and PDFs - convert to base64 and send as file
    let mimeType: string
    let base64Data: string

    // Convert file to base64
    const base64Result = await fileToBase64(file)
    base64Data = base64Result.split(',')[1]
    mimeType = file.type || (isPDF ? 'application/pdf' : 'image/jpeg')

    // Default prompts based on file type
    let defaultPrompt: string
    if (isPDF) {
      defaultPrompt = `Ανάλυσε αυτό το PDF σε σχέση με τη βιολογία. 
Περιγράψε το περιεχόμενο, αναγνώρισε βιολογικές έννοιες ή δομές, και εξήγησε τη σημασία τους.
Αν το PDF δεν σχετίζεται με βιολογία, απλά περιγράψε το περιεχόμενο.`
    } else {
      defaultPrompt = `Ανάλυσε αυτή την εικόνα σε σχέση με τη βιολογία. 
Περιγράψε τι βλέπεις, αναγνώρισε βιολογικές δομές ή έννοιες, και εξήγησε τη σημασία τους.
Αν η εικόνα δεν σχετίζεται με βιολογία, απλά περιγράψε τι βλέπεις.`
    }

    const analysisPrompt = prompt || defaultPrompt

    // Call Gemini API with file attachment
    const analysisText = await callGeminiAPI([
      { text: analysisPrompt },
      {
        inline_data: {
          mime_type: mimeType,
          data: base64Data
        }
      }
    ])

    return {
      text: analysisText
    }
  } catch (error) {
    console.error('Error analyzing file with Gemini:', error)
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}