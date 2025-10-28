// src/server.js
import express from "express";
import 'dotenv/config';
import axios from "axios";
import axiosRetry from "axios-retry";

// ---------------- Axios Retry ----------------
axiosRetry(axios, {
  retries: 5,
  retryDelay: (retryCount) => retryCount * 1000 + Math.random() * 500,
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) || axiosRetry.isIdempotentRequestError(error),
});

// ---------------- Hugging Face ----------------
const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HEADERS = { Authorization: `Bearer ${HF_API_TOKEN}` };

const MODELS = {
  classification: "facebook/bart-large-mnli",
  ner: "dslim/bert-base-NER",
};

// ---------------- Hugging Face Helper ----------------
async function queryHuggingFaceAPI(payload, modelName) {
  try {
    const res = await axios.post(
      `https://api-inference.huggingface.co/models/${modelName}`,
      payload,
      { headers: HEADERS }
    );
    return res.data;
  } catch (err) {
    console.error("HF Error:", err.message);
    return null;
  }
}

// ---------------- Templates ----------------
function extractFromTemplate(message) {
  const templates = [
    {
      name: "Sell Product",
      regex: /sell\s+(\d+)\s+bags?\s+of\s+([\w\s]+?)\s+to\s+([\w\s]+)/i,
      map: (matches) => ({
        eventType: "sell",
        details: {
          quantity: matches[1].trim(),
          product: matches[2].trim(),
          destination: matches[3].trim(),
        },
      }),
    },
    {
      name: "Medical Test",
      regex: /(test|run)\s+(?:a\s+)?(?:test\s+on\s+)?([\w\s]+?)\s+(?:at|to)\s+([\w\s]+)/i,
      map: (matches) => ({
        eventType: "medical_test",
        details: {
          testType: matches[2].trim(),
          destination: matches[3].trim(),
        },
      }),
    },
  ];

  for (const template of templates) {
    const matches = message.match(template.regex);
    if (matches) {
      const mapped = template.map(matches);
      return {
        success: true,
        eventType: mapped.eventType,
        details: mapped.details,
      };
    }
  }
  return { success: false };
}

// ---------------- Hugging Face Entity Fallback ----------------
async function extractEntities(message) {
  const payload = { inputs: message };
  const entities = await queryHuggingFaceAPI(payload, MODELS.ner);
  if (!entities) return {};

  const result = {};
  entities.forEach((e) => {
    const entity = e.entity_group;
    const word = e.word;
    if (entity === "PER" || entity === "ORG")
      result.destination = result.destination ? result.destination + " " + word : word;
    if (entity === "LOC")
      result.location = result.location ? result.location + " " + word : word;
    if (entity === "MISC") result.product = result.product ? result.product + " " + word : word;
    if (entity === "QUANTITY") result.quantity = result.quantity ? result.quantity + " " + word : word;
  });

  return result;
}

async function getSector(message) {
  const candidate_labels = [
    "Agriculture",
    "Healthcare",
    "Logistics",
    "Finance",
    "Transportation",
    "E-commerce",
  ];
  const payload = { inputs: message, parameters: { candidate_labels } };
  const result = await queryHuggingFaceAPI(payload, MODELS.classification);
  return result ? result.labels[0] : "General";
}

// ---------------- Process Message ----------------
export async function processMessage(message) {
  const templateResult = extractFromTemplate(message);

  if (templateResult.success) {
    return {
      sector: templateResult.eventType === "sell" ? "Agriculture" : "Healthcare",
      eventType: templateResult.eventType,
      details: templateResult.details,
      rawMessage: message,
      createdAt: new Date().toISOString(),
    };
  }

  // fallback
  const [entities, sector] = await Promise.all([extractEntities(message), getSector(message)]);
  return {
    sector,
    eventType: entities.product ? `Action involving ${entities.product}` : "unknown",
    details: {
      quantity: entities.quantity || null,
      product: entities.product || null,
      destination: entities.destination || entities.location || null,
    },
    rawMessage: message,
    createdAt: new Date().toISOString(),
  };
}
