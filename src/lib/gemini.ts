/**
 * Gemini API utility for image analysis
 * Uses domain-restricted API key for client-side usage
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

export interface GeminiImageAnalysis {
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
 * Analyzes an image using Gemini API
 * @param file - The image file to analyze
 * @param prompt - Optional custom prompt (defaults to biology-focused analysis)
 * @returns Analysis text or error message
 */
export async function analyzeImageWithGemini(
  file: File,
  prompt?: string
): Promise<GeminiImageAnalysis> {
  if (!GEMINI_API_KEY) {
    return {
      text: '',
      error: 'Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.'
    }
  }

  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return {
      text: '',
      error: 'File is not an image. Please upload an image file.'
    }
  }

  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file)
    // Remove data URL prefix (data:image/...;base64,)
    const base64Image = base64Data.split(',')[1]

    // Determine MIME type
    const mimeType = file.type || 'image/jpeg'

    // Default prompt focused on biology analysis
    const defaultPrompt = `Ανάλυσε αυτή την εικόνα σε σχέση με τη βιολογία. 
Περιγράψε τι βλέπεις, αναγνώρισε βιολογικές δομές ή έννοιες, και εξήγησε τη σημασία τους.
Αν η εικόνα δεν σχετίζεται με βιολογία, απλά περιγράψε τι βλέπεις.`

    const analysisPrompt = prompt || defaultPrompt

    // Call Gemini API
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
              parts: [
                {
                  text: analysisPrompt
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image
                  }
                }
              ]
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

    const analysisText = data.candidates[0].content.parts[0].text

    return {
      text: analysisText
    }
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error)
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
