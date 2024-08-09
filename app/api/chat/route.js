import {NextResponse} from 'next/server'
import OpenAI from 'openai'

// Credit: Bill Zhang
// System prompt
const systemPrompt = `You are an AI assistant designed to help analyze and evaluate university privacy policies. Your primary objective is to assess how universities handle user data and whether they meet security compliance requirements. 
    
    Here’s how you should approach this task:
    
    1. **Retrieve Privacy Policies**: Use a web scraper to visit university websites and extract their privacy policy documents.
    
    2. **Analyze Privacy Policies**: 
       - Check the content of the privacy policies to identify key information regarding data handling practices.
       - Look for specific compliance requirements and regulations relevant to data security.
    
    3. **Generate Compliance Checklist**: Create a checklist or evaluation report based on the analysis. This checklist should include:
       - Criteria for security compliance.
       - Details of how each university’s privacy policy meets or fails to meet these criteria.
    
    4. **Provide Recommendations**: Based on the compliance checklist, offer recommendations for universities to improve their privacy policies if necessary.
    
    Your responses should be detailed, actionable, and tailored to help users understand the level of compliance of various universities with data protection standards. Aim to provide clear and concise information to ensure effective assessment and improvement of privacy policies.`// Use your own system prompt here

// POST function to handle incoming requests
export async function POST(req) {
    const openai = new OpenAI() // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request

    const completion = await openai.chat.completions.create({
        messages: [{role: 'system', content: systemPrompt}, ...data],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
            try {
                // Iterate over the streamed chunks of the response
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}