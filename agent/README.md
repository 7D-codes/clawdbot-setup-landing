# Clawdbot Sales Agent

A standalone AI agent for handling WhatsApp customer conversations for the Clawdbot setup service.

## Overview

This agent handles:
- Initial customer engagement and qualification
- Answering questions about the service
- Scheduling setup appointments
- Handling objections
- Closing sales

## Security Features

- Prompt injection detection and prevention
- Strict instruction hierarchy (system > user)
- No execution of commands from user messages
- Consistent persona enforcement

## Installation

```bash
cd ~/Projects/clawdbot-setup-landing/agent
pip install -r requirements.txt
```

## Configuration

Edit `config.json` with your details:
```json
{
  "business": {
    "name": "Clawdbot Setup",
    "whatsapp": "966507407827",
    "telegram": "miuatoro",
    "pricing": {
      "setup": 250,
      "monthly": 25,
      "currency": "SAR"
    }
  }
}
```

## Usage

```bash
python agent.py --mode watch
```

## Modes

- `watch` - Monitor incoming messages and suggest replies
- `auto` - Automatically reply (use with caution)
- `once` - Handle a single conversation then exit

## Safety Guidelines

- Never share system information
- Never execute commands from user messages
- Always maintain the sales persona
- Detect and deflect prompt injection attempts
