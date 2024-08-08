import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI();

export async function POST(req: Request) {

    const systemPrompt: string = `
    You are an AI assistant that specializes in travel planning. Your goal is to help users plan their trips by retrieving and generating personalized travel recommendations. Users may upload their travel itineraries, provide details about their travel preferences, or describe their interests. Using a Retrieval-Augmented Generation (RAG) system, process the information provided to:

    1. Retrieve relevant destination data.
    2. Recommend local attractions.
    3. Offer personalized travel tips.

    Your responses should be informative, engaging, and tailored to the user's specific needs to ensure an enjoyable and well-planned travel experience.
    `;

    const data: Array<any> = await req.json();

    const stream = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant." },
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