/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Difficulty, LearningPath } from "../types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || "" });

export const geminiService = {
  async generateQuiz(topic: string, difficulty: Difficulty, count: number = 5): Promise<QuizQuestion[]> {
    const prompt = `Generate a ${count} question quiz about "${topic}" at ${difficulty} level. 
    Each question should be challenging and educational.
    Return the response as a JSON array of objects.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation", "difficulty"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  },

  async getTutorResponse(message: string, context?: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction: `You are Lumina, an expert AI Tutor. 
        Your goal is to help students learn programming and languages effectively.
        Explain concepts step-by-step, use analogies, and provide code examples when relevant.
        Be encouraging and patient.
        ${context ? `Context for this conversation: ${context}` : ""}`
      }
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  },

  async summarizeContent(content: string): Promise<{ summary: string; keyPoints: string[] }> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following content and extract key learning points: \n\n${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "keyPoints"]
        }
      }
    });

    return JSON.parse(response.text || '{"summary": "", "keyPoints": []}');
  },

  async generateLearningPath(goal: string, assessmentResults: string): Promise<LearningPath> {
    const prompt = `Create a structured learning path for a user with the goal: "${goal}". 
    Assessment results: ${assessmentResults}.
    The path should include a sequence of lessons, quizzes, and visualizations.
    Return the response as a JSON object matching the LearningPath interface.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            goal: { type: Type.STRING },
            level: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['lesson', 'quiz', 'visualization'] },
                  description: { type: Type.STRING },
                  estimatedTime: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN }
                },
                required: ["id", "title", "type", "description", "estimatedTime", "completed"]
              }
            }
          },
          required: ["id", "goal", "level", "steps"]
        }
      }
    });

    return JSON.parse(response.text || '{"id": "error", "goal": "", "level": "", "steps": []}');
  }
};
