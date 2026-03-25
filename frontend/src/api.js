import { API_TIMEOUT_MS } from './constants';

const API_URL = process.env.REACT_APP_API_URL || 'https://smartcard-production.up.railway.app';

function withTimeout(signal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }
  return { signal: controller.signal, clearTimer: () => clearTimeout(timer) };
}

export async function createCard() {
  const { signal, clearTimer } = withTimeout();
  try {
    const res = await fetch(`${API_URL}/api/cards/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
    });
    return await res.json();
  } finally {
    clearTimer();
  }
}

export async function getCard(cardId) {
  const { signal, clearTimer } = withTimeout();
  try {
    const res = await fetch(`${API_URL}/api/cards/${cardId}`, { signal });
    return await res.json();
  } finally {
    clearTimer();
  }
}

export async function getPresignedUrls(cardId) {
  const res = await fetch(`${API_URL}/api/cards/${cardId}/upload-url`);
  return res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`));
}

export async function confirmUpload(cardId, { senderName, message, videoUrl, photoUrls }) {
  const res = await fetch(`${API_URL}/api/cards/${cardId}/confirm-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderName, message, videoUrl, photoUrls }),
  });
  return res.json();
}

export async function uploadCard(cardId, formData) {
  const res = await fetch(`${API_URL}/api/cards/${cardId}/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function getStats() {
  const { signal, clearTimer } = withTimeout();
  try {
    const res = await fetch(`${API_URL}/api/stats`, { signal });
    return await res.json();
  } finally {
    clearTimer();
  }
}
