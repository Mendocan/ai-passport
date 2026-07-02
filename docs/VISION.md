# AI Passport — Vision

> **This document is the project constitution.**  
> Mission and principles here should remain stable. Technical details live in `SPEC.md`, `ARCHITECTURE.md`, and `API.md`.

## Brand

| Element | Text |
|---------|------|
| **Mission (primary)** | One identity. Every AI. |
| **Tagline (secondary)** | Your AI identity. Everywhere. |
| **North star** | A user should be recognized by any AI, with explicit permission, without having to start over. |

---

## Problem

Current AI systems have isolated memories. There is no portable identity that belongs to the user.

**Result:** repeated onboarding, repeated explanations, inconsistent AI behavior, lost productivity.

---

## Solution

AI Passport is an open, portable identity layer. The user owns the passport. AI systems receive temporary, scoped permission to read selected parts.

### Identity vs. context

| AI Passport stores | AI Passport does not store |
|--------------------|----------------------------|
| Who you are (identity) | Full chat history |
| How you work (preferences, coding style) | Platform-specific memory blobs |
| What you are working on (active projects) | Secrets the user did not explicitly add |
| What each AI may read (permissions) | Provider-owned profile data |

---

## Design Principles

1. **User ownership** — The passport belongs to the user.
2. **Portable** — Works across AI providers and IDEs.
3. **Permission-based** — Explicit grants only; revocation is immediate.
4. **Local-first** — Primary storage on the user's device.
5. **Encrypted** — Each section encrypted independently.
6. **Extensible** — Plugins enrich the passport; consumers read it.
7. **Core independence** — Core never depends on a specific IDE or AI company.

---

## Long-term vision

Instead of *"Create a new AI profile"* on every platform, users choose **Sign in with AI Passport**.

The AI instantly understands who they are, how they work, and how to help — without rebuilding context every time.

See [ROADMAP.md](ROADMAP.md) for phases.
