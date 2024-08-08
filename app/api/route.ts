import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI();

export async function POST(req: Request) {

    const systemPrompt: string = `
    You are an AI assistant designed to help analyze and evaluate university privacy policies. Your primary objective is to assess how universities handle user data and whether they meet security compliance requirements. 
    
    Here’s how you should approach this task:
    
    1. **Retrieve Privacy Policies**: Use a web scraper to visit university websites and extract their privacy policy documents.
    
    2. **Analyze Privacy Policies**: 
       - Check the content of the privacy policies to identify key information regarding data handling practices.
       - Look for specific compliance requirements and regulations relevant to data security.
    
    3. **Generate Compliance Checklist**: Create a checklist or evaluation report based on the analysis. This checklist should include:
       - Criteria for security compliance.
       - Details of how each university’s privacy policy meets or fails to meet these criteria.
    
    4. **Provide Recommendations**: Based on the compliance checklist, offer recommendations for universities to improve their privacy policies if necessary.
    
    Your responses should be detailed, actionable, and tailored to help users understand the level of compliance of various universities with data protection standards. Aim to provide clear and concise information to ensure effective assessment and improvement of privacy policies.
    `;

    const data: Array<any> = await req.json();

    const stream = await openai.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt },
            ...data
        ],
        model: "gpt-4o-mini",
        stream: true // return data in chunks
    });

    // sends response chunks asynchronously
    const resContent : Array<any> = [];

    for await (const chunk of stream) {
        resContent.push(chunk.choices[0]?.delta?.content || "");
    }
    // join resContent into a string
    const content : string = resContent.join('');

    return new NextResponse(content);
}

export async function GET(request: Request) {}

export async function HEAD(request: Request) {}

export async function PUT(request: Request) {}

export async function DELETE(request: Request) {}

export async function PATCH(request: Request) {}

// If `OPTIONS` is not defined, Next.js will automatically implement `OPTIONS` and  set the appropriate Response `Allow` header depending on the other methods defined in the route handler.
export async function OPTIONS(request: Request) {}