
import { Injectable, signal, inject } from '@angular/core';
import { GoogleGenAI, Chat, GenerateContentResponse, Part, Type } from '@google/genai';
import { ChatMessage, DesignOptions, Product } from '../types';
import { AiMetaService } from './ai-meta.service';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;
  private chatInstance!: Chat;
  private aiMetaService = inject(AiMetaService);

  constructor() {
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not found.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    this.initializeChat();
  }

  private initializeChat(): void {
    const context = this.aiMetaService.getUserContextDescription();
    
    this.chatInstance = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are "Mr. Ahmed", a friendly, eloquent, and highly knowledgeable sales assistant for Madni Jewellers, a luxury brand specializing in traditional Pakistani jewelry.
- Your persona is that of a refined British-Pakistani gentleman; your language should reflect a sophisticated, slightly formal British style.
- You are an expert in sales and can handle price negotiations smartly. While our prices are firm to reflect the quality of our craftsmanship, you can suggest value-adds like complimentary cleaning or inquire about available promotions for serious clients.
- Our delivery system is a premium, secure service. Purchases are finalized via a personal appointment with Mr. Awais. After the appointment, a private agent is dispatched for delivery. Be clear and reassuring about this secure process.
- Answer questions concisely and elegantly. Always be polite, helpful, and address users with respect.
- You are an evolving AI. You have access to the user's browsing context and history. Use this to be proactive.
- CURRENT USER CONTEXT: ${context}
- Use the context to personalize your greeting and responses (e.g., "I see you were admiring the Nauratan set...").`,
      },
    });
  }

  async sendChatMessage(
    prompt: string,
    history: ChatMessage[]
  ): Promise<ReadableStreamDefaultReader<string>> {
      
    if (history.length <= 1) { 
        this.initializeChat();
    }
      
    const currentContext = this.aiMetaService.getUserContextDescription();
    const enrichedPrompt = `[System Update: User Context: ${currentContext}] User says: ${prompt}`;

    const stream = await this.chatInstance.sendMessageStream({ message: enrichedPrompt });
    
    const reader = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
            controller.enqueue(chunk.text);
        }
        controller.close();
      }
    }).getReader();

    return reader;
  }

  async generateVirtualTryOnDescription(handImageBase64: string, jewelryImageBase64: string, category: string = 'Jewelry'): Promise<string> {
    try {
      const handImagePart: Part = { inlineData: { mimeType: 'image/jpeg', data: handImageBase64 } };
      const jewelryImagePart: Part = { inlineData: { mimeType: 'image/jpeg', data: jewelryImageBase64 } };
      
      let categoryPrompt = "";
      if (category.toLowerCase().includes('ring')) {
          categoryPrompt = "The user has provided an image of their hand. Describe how this ring fits on the finger, complementing the skin tone and hand shape.";
      } else if (category.toLowerCase().includes('necklace') || category.toLowerCase().includes('pendant')) {
          categoryPrompt = "The user has provided a portrait/neckline image. Describe how this necklace sits on the collarbone or neck, enhancing the neckline.";
      } else if (category.toLowerCase().includes('earring')) {
          categoryPrompt = "The user has provided a portrait. Describe how these earrings frame the face and catch the light.";
      }

      const prompt = `You are a creative jewelry stylist for "Madni Jewellers". Look at the user's photo and the image of the ${category} piece. 
      ${categoryPrompt}
      In a luxurious, evocative, and appealing tone, describe the look. Focus on the style, the craftsmanship, and how it complements the user. Make the user feel special. Respond in 2-3 short paragraphs.`;

      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [ { text: prompt }, handImagePart, jewelryImagePart ]},
      });

      return response.text;
    } catch (error) {
      console.error('Error generating virtual try-on description:', error);
      return 'An error occurred while generating the description. Please try again.';
    }
  }

  async generateSoulboundJewel(prompt: string): Promise<{story: string, imageBase64: string}> {
    const storyPrompt = `As an AI Storyteller for Madni Jewellers, transform the user's feeling or memory: "${prompt}" into a short, poetic story (2-3 paragraphs) about a mythical, one-of-a-kind jewel. Describe its name, its appearance, its materials, and the magical essence it holds. The tone should be mystical and luxurious.`;
    const storyResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: storyPrompt,
    });
    const story = storyResponse.text;

    const imagePrompt = `Create a photorealistic studio product shot of a single, exquisite, unique piece of jewelry based on this description: ${story}. The jewelry should be the central focus, set against a dark, elegant, minimalist background. High-resolution, dramatic lighting.`;
    const imageResponse = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }
    });

    return { story, imageBase64: imageResponse.generatedImages[0].image.imageBytes };
  }

  async getDesignFeedback(options: DesignOptions): Promise<string> {
    const prompt = `You are an AI Master Goldsmith for Madni Jewellers. A customer has designed a ring with the following specifications: Metal: ${options.metal}, Main Stone: ${options.stone}, Style: ${options.style}, Engraving: "${options.engraving}". Provide brief, encouraging, and expert feedback on their choices, perhaps suggesting what the combination evokes (e.g., "A classic choice, the warmth of ${options.metal} will beautifully complement the fire of the ${options.stone}..."). Keep it to one paragraph.`;
     const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  }

  async getBusinessInsights(): Promise<string> {
      const prompt = `You are an AI Business Intelligence analyst for Madni Jewellers. Based on simulated recent sales data showing high interest in emerald necklaces and classic gold bangles, and lower interest in silver rings, provide a brief market analysis. Suggest one trend to capitalize on and one area for a potential marketing push. Format as a short, professional summary.`;
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  }

  async getMarketAnalysis(data: {date: Date, price: number}[]): Promise<string> {
      const latestPrice = data[data.length - 1].price;
      const trend = data[data.length - 1].price > data[0].price ? 'upward' : 'downward';
      const prompt = `You are a sharp and concise AI Financial Analyst for the gold market. The current price of gold is $${latestPrice.toFixed(2)} per gram. The recent trend is ${trend}. Provide a very brief (2-3 sentences) market insight. Mention a potential influencing factor (e.g., global economic news, currency fluctuations) and a short-term outlook. The tone should be professional and authoritative.`;
       const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  }

  async getPersonalizedCuration(userName: string, products: Product[]): Promise<{title: string, note: string, productIds: number[]}> {
      const userContext = this.aiMetaService.getUserContextDescription();
      const productList = products.map(p => `id: ${p.id}, name: ${p.name}, category: ${p.category}`).join('; ');
      
      const prompt = `You are "Aura", an AI Style Director for Madni Jewellers. A client named ${userName} is visiting. 
      USER CONTEXT: ${userContext}
      
      Your task is to curate a small, exclusive collection of 3-4 items for them from our catalog that matches their inferred taste.
      Available products: [${productList}].
      
      1.  Create an evocative and personal title for this collection, including ${userName}'s name.
      2.  Write a short, elegant styling note (2-3 sentences) explaining the aesthetic or story behind your selection for them, referencing their history if relevant.
      3.  Select 3 or 4 product IDs that fit this aesthetic.
      
      Respond ONLY with a valid JSON object in the format: {"title": "...", "note": "...", "productIds": [id1, id2, id3]}`;
      
       const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      try {
        const cleanedResponse = response.text.replace(/^```json\s*|```\s*$/g, '');
        return JSON.parse(cleanedResponse);
      } catch (e) {
        console.error("Failed to parse personalized curation JSON:", e);
        // Fallback in case of parsing failure
        const fallbackIds = [...products].sort(() => 0.5 - Math.random()).slice(0, 3).map(p => p.id);
        return {
          title: `A Special Collection for ${userName}`,
          note: "We've selected a few of our most cherished pieces that we believe you'll adore.",
          productIds: fallbackIds
        };
      }
  }
}
