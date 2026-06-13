# VEIL

AI Security Layer for Enterprise AI Usage

## Problem

Employees increasingly use AI tools such as ChatGPT, Gemini, and Claude.

Sensitive information including API keys, credentials, customer data, and internal documents are frequently pasted into these systems, creating security and compliance risks.

## Solution

VEIL acts as a real-time AI security layer.

Before information reaches an AI platform, VEIL:

* Detects sensitive information
* Calculates a risk score
* Warns the user
* Sanitizes sensitive content
* Logs incidents for security teams

## Features

* Real-time prompt inspection
* AWS key detection
* API key detection
* Email detection
* Phone number detection
* Risk scoring engine
* Security operations dashboard
* Incident management
* Analytics and reporting
* Chrome Extension support
* Supabase integration

## Tech Stack

Frontend:

* Next.js 15
* TypeScript
* Tailwind CSS

Backend:

* Supabase

Deployment:

* Vercel

Browser Extension:

* Manifest V3

## Architecture

Browser Extension
↓
Detection Engine
↓
Risk Scoring
↓
Supabase
↓
VEIL Dashboard

## Future Roadmap

* Slack Integration
* Teams Integration
* Enterprise SSO
* DLP Policies
* AI Governance Controls
* Compliance Reporting

## Authors

Team VEIL
