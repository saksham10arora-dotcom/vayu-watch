"""Shared LLM caller for advisory.py and trip.py.
Tries Gemini first (keeps the Google Cloud story), falls back to Fireworks/Kimi
if Gemini is unavailable (quota, rate limit, etc.) so the demo never hard-fails."""
import httpx
import os

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.5-flash"

FIREWORKS_API_KEY = os.environ.get("FIREWORKS_API_KEY", "")
FIREWORKS_MODEL = "accounts/fireworks/models/gpt-oss-120b"


async def call_gemini(client: httpx.AsyncClient, prompt: str, json_mode: bool = False) -> str:
    body = {"contents": [{"parts": [{"text": prompt}]}]}
    if json_mode:
        body["generationConfig"] = {"responseMimeType": "application/json"}
    r = await client.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
        params={"key": GEMINI_API_KEY},
        json=body,
    )
    r.raise_for_status()
    data = r.json()
    return data["candidates"][0]["content"]["parts"][0]["text"]


async def call_fireworks(client: httpx.AsyncClient, prompt: str, json_mode: bool = False) -> str:
    # Fireworks fallback uses gpt-oss-120b — a non-reasoning instruct model that
    # respects JSON mode and outputs clean answers without chain-of-thought leakage.
    body = {
        "model": FIREWORKS_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a concise assistant. Do NOT show your thinking process, "
                    "internal reasoning, chain-of-thought, or planning steps. "
                    "Output ONLY the final answer directly, with no preamble."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 1200,
        "temperature": 0.3,
    }
    if json_mode:
        body["response_format"] = {"type": "json_object"}
    r = await client.post(
        "https://api.fireworks.ai/inference/v1/chat/completions",
        headers={"Authorization": f"Bearer {FIREWORKS_API_KEY}"},
        json=body,
    )
    r.raise_for_status()
    data = r.json()
    raw = data["choices"][0]["message"]["content"]
    # Defensive post-processing: if the model still leaked reasoning, strip common prefixes
    return _strip_reasoning_leakage(raw)


def _strip_reasoning_leakage(text: str) -> str:
    """Heuristic cleanup for reasoning models that leak thinking into content."""
    # If the text contains a clear transition from reasoning to answer,
    # keep only what comes after the last transition marker.
    transitions = [
        "Final answer:",
        "Final Answer:",
        "Answer:",
        "Response:",
        "The final answer is:",
        "Output:",
        "Here's the answer:",
    ]
    best_idx = -1
    best_marker = ""
    for marker in transitions:
        idx = text.rfind(marker)
        if idx > best_idx:
            best_idx = idx
            best_marker = marker
    if best_idx != -1:
        return text[best_idx + len(best_marker) :].strip()
    # If no transition marker, just return the text (common for short answers)
    return text.strip()


async def call_llm(client: httpx.AsyncClient, prompt: str, json_mode: bool = False) -> str:
    """Try Gemini, fall back to Fireworks/Kimi on any failure. Raises only if both fail."""
    if GEMINI_API_KEY:
        try:
            return await call_gemini(client, prompt, json_mode)
        except Exception:
            pass  # fall through to Fireworks
    if FIREWORKS_API_KEY:
        return await call_fireworks(client, prompt, json_mode)
    raise RuntimeError("No LLM backend configured (GEMINI_API_KEY / FIREWORKS_API_KEY missing)")
