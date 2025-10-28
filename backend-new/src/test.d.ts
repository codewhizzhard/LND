// src/test.d.ts
export function processMessage(message: string): Promise<{
  sector: string;
  eventType: string;
  details: Record<string, any>;
  rawMessage: string;
  createdAt: string;
}>;
