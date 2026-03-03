import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Subject {
  id: string;
  name: string;
  examDate: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface StudyPlanParams {
  subjects: Subject[];
  studyHours: number;
  startDate: string;
}

export interface StudySession {
  time: string;
  subject: string;
  topic: string;
  type: string;
  color: string;
}

export interface PriorityItem {
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  color: string;
}

export interface StudyPlanResponse {
  weeklyOverview: {
    totalHours: string;
    intensity: string;
    focusAreas: number;
    aiInsight: string;
  };
  dailySchedule: StudySession[];
  priorityOrder: PriorityItem[];
  revisionPlan: {
    spacedRepetition: string;
    weeklyRecap: string;
  };
  breakStrategy: {
    method: string;
    details: string;
    tip: string;
  };
}

export async function generateStudyPlan(params: StudyPlanParams): Promise<StudyPlanResponse> {
  const prompt = `
    Generate a realistic study plan for a student with the following details:
    Subjects: ${params.subjects.map(s => `${s.name} (Exam: ${s.examDate}, Difficulty: ${s.difficulty})`).join(', ')}
    Available Study Hours per Day: ${params.studyHours}
    Start Date: ${params.startDate}

    Rules:
    - Prioritize closer exams.
    - Balance subjects based on difficulty and time remaining.
    - Include revision days.
    - Include breaks (e.g. Pomodoro).
    - Avoid overload.
    - Provide an actionable schedule for "Today" (the start date).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          weeklyOverview: {
            type: Type.OBJECT,
            properties: {
              totalHours: { type: Type.STRING },
              intensity: { type: Type.STRING },
              focusAreas: { type: Type.NUMBER },
              aiInsight: { type: Type.STRING },
            },
            required: ["totalHours", "intensity", "focusAreas", "aiInsight"],
          },
          dailySchedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                subject: { type: Type.STRING },
                topic: { type: Type.STRING },
                type: { type: Type.STRING },
                color: { type: Type.STRING, description: "Tailwind color class like 'bg-blue-500'" },
              },
              required: ["time", "subject", "topic", "type", "color"],
            },
          },
          priorityOrder: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                reason: { type: Type.STRING },
                color: { type: Type.STRING, description: "Tailwind text color class like 'text-red-600'" },
              },
              required: ["subject", "priority", "reason", "color"],
            },
          },
          revisionPlan: {
            type: Type.OBJECT,
            properties: {
              spacedRepetition: { type: Type.STRING },
              weeklyRecap: { type: Type.STRING },
            },
            required: ["spacedRepetition", "weeklyRecap"],
          },
          breakStrategy: {
            type: Type.OBJECT,
            properties: {
              method: { type: Type.STRING },
              details: { type: Type.STRING },
              tip: { type: Type.STRING },
            },
            required: ["method", "details", "tip"],
          },
        },
        required: ["weeklyOverview", "dailySchedule", "priorityOrder", "revisionPlan", "breakStrategy"],
      },
    },
  });

  return JSON.parse(response.text);
}
