// AI Provider Interface - Currently implements Google Gemini
// Can be extended for other providers in the future

export interface GenerateOptions {
  fileUrl: string
  style: string
  systemPrompt: string
  userPrompt: string
}

export interface GenerateResult {
  success: boolean
  outputUrl?: string
  error?: string
}

export async function generateImage(options: GenerateOptions): Promise<GenerateResult> {
  const { fileUrl, systemPrompt, userPrompt } = options
  
  try {
    // Fetch the image and convert to base64
    const imageResponse = await fetch(fileUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'
    
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
                  text: `${systemPrompt}\n\n${userPrompt}`,
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['image', 'text'],
            responseMimeType: 'image/png',
          },
        }),
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      return {
        success: false,
        error: `Gemini API error: ${response.status}`,
      }
    }
    
    const data = await response.json()
    
    // Extract the generated image
    const parts = data.candidates?.[0]?.content?.parts
    if (!parts) {
      return {
        success: false,
        error: 'No content generated',
      }
    }
    
    // Find the image part
    const imagePart = parts.find((part: { inline_data?: { data: string } }) => part.inline_data?.data)
    if (!imagePart?.inline_data?.data) {
      return {
        success: false,
        error: 'No image in response',
      }
    }
    
    // Return base64 data URL for now
    // In production, upload to S3/R2 and return signed URL
    const outputUrl = `data:image/png;base64,${imagePart.inline_data.data}`
    
    return {
      success: true,
      outputUrl,
    }
  } catch (error) {
    console.error('Generate image error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
