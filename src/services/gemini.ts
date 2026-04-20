/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Difficulty, LearningPath, ExecutionStep } from "../types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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

    try {
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

      if (!response.text) {
        throw new Error("Empty response from Gemini");
      }

      return JSON.parse(response.text);
    } catch (error) {
      console.error("Error generating learning path:", error);
      throw error;
    }
  },

  async generateExecutionSteps(code: string, language: string): Promise<ExecutionStep[]> {
    const prompt = `Analyze the following ${language} code and generate a step-by-step execution trace.
    For each step, include:
    - step number
    - type: 'assign', 'loop', 'condition', 'output', 'call', or 'return'
    - line number (1-indexed)
    - current state of all variables
    - a beginner-friendly explanation of what's happening
    - any output produced in this step
    - current call stack (if applicable)

    Code:
    ${code}

    Return the response as a JSON array of ExecutionStep objects.`;

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
              step: { type: Type.INTEGER },
              type: { type: Type.STRING, enum: ['assign', 'loop', 'condition', 'output', 'call', 'return'] },
              line: { type: Type.INTEGER },
              variables: { type: Type.OBJECT },
              explanation: { type: Type.STRING },
              output: { type: Type.STRING },
              callStack: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["step", "type", "line", "variables", "explanation"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  }
};
