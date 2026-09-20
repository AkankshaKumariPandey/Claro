// wasm/connector.js
// This module hides whether reasoning comes from WASM or pure JS.

import { reason } from './engine.js';

// Knowledge will be passed from JS; engine should not fetch files itself.
export async function askEngine(question, knowledgeBase) {
  // Try WASM engine first
  try {
    const result = reason(question, knowledgeBase);
    if (result && typeof result === 'object' && 'status' in result) {
      return result;
    }
  } catch (e) {
    // If WASM engine fails, fall back to JS
    // console.warn('WASM engine failed, using JS fallback', e);
  }

  // No valid WASM result → signal to use JS fallback
  return null;
}