# User Journey Map - Clawdbot Setup Service

## Overview

This document maps the complete user journey from first awareness to becoming a daily active user. Designed for non-technical Saudi customers.

---

## Journey Stages

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ AWARE   │───▶│INTEREST │───▶│ SIGNUP  │───▶│  SETUP  │───▶│  ACTIVE │───▶│  HABIT  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
    │              │              │              │              │              │
  Friend        Landing        Simple        5-min         First         Daily
  tells         page catches   form         wizard        reminder      use
  them          them                          works         works
```

---

## Stage 1: Awareness

### Touchpoints
- WhatsApp status from friend
- Twitter/X mention
- Word of mouth

### User Thoughts (Arabic mindset)
> "وش ذا؟ مساعد ذكي؟ يعني وش؟"
> 
> "What's this? Smart assistant? What does that mean?"

### Key Message Needed
Simple explanation without tech jargon. Focus on the problem solved, not the technology.

### Success Metric
User clicks link or asks friend for more info.

---

## Stage 2: Interest

### Touchpoint: Landing Page

#### Critical Elements (in order of importance)

1. **Hero Section** (Above the fold)
```
┌─────────────────────────────────────────┐
│                                         │
│     مساعدك الذكي الشخصي 🤖              │
│     Your Personal AI Assistant          │
│                                         │
│  يرد على رسايلك ويفكرك بمواعيدك        │
│  Replies to messages & reminds you      │
│  of appointments                        │
│                                         │
│  [ابدأ الآن - Start Now]                │
│  29 ريال/شهر (~$8/month)               │
│                                         │
└─────────────────────────────────────────┘
```

2. **How It Works** (3 simple steps)
```
┌─────────────────────────────────────────┐
│                                         │
│  ١. سجّل في دقيقتين                    │
│     Sign up in 2 minutes                │
│                                         │
│  ٢. ربط تلغرامك                        │
│     Connect your Telegram               │
│                                         │
│  ٣. قول له وش تبي                      │
│     Tell him what you need              │
│                                         │
└─────────────────────────────────────────┘
```

3. **Trust Signals**
- "🔒 بياناتك محمية وما نبيعها" (Your data is protected, we don't sell it)
- "✅ جربها مجاناً ٧ أيام" (Try free for 7 days)
- "👥 +500 مستخدم" (500+ users)

### User Thoughts
> "طيب وش يقدر يسوي بالضبط؟"
> 
> "OK but what exactly can it do?"

### Success Metric
User clicks "Start Now" button.

---

## Stage 3: Signup

### Touchpoint: Registration Form

#### Design Principles
- No email verification delay
- No password to remember (magic link / OTP)
- Minimal fields

#### Form Fields
```
┌─────────────────────────────────────────┐
│                                         │
│  تسجيل جديد 👋                          │
│  New Account                            │
│                                         │
│  اسمك / Your name                       │
│  [________________]                     │
│                                         │
│  رقم الجوال / Phone number              │
│  [+966 ___________]                     │
│                                         │
│  [  إرسال كود التحقق  ]                 │
│     Send verification code              │
│                                         │
└─────────────────────────────────────────┘
```

#### Verification (WhatsApp/Telegram)
Instead of email verification, send code via WhatsApp:
> "كود التحقق: 123456. Clawdbot - مساعدك الذكي"

### Success Metric
User enters verification code.

---

## Stage 4: Setup Wizard

### Critical Goal: Zero Abandonment

This is where technical products lose non-technical users. We must be EXTREMELY hand-holding here.

#### Step 1: Welcome + Purpose (30 sec)
```
┌─────────────────────────────────────────┐
│                                         │
│  مرحباً أحمد! 👋                        │
│  Welcome Ahmed!                         │
│                                         │
│  خلنا نجهز مساعدك في ٣ خطوات سريعة    │
│  Let's set up your assistant in 3       │
│  quick steps                            │
│                                         │
│  [ ابدأ - Start ]                       │
│                                         │
└─────────────────────────────────────────┘
```

#### Step 2: Connect Telegram (2 min)

**CRITICAL:** Do NOT ask user to "get bot token from BotFather". This is where non-technical users drop off.

Instead, use our helper bot:

```
┌─────────────────────────────────────────┐
│                                         │
│  ربط التلغرام 📱                        │
│  Connect Telegram                       │
│                                         │
│  الخطوة ١: اضغط الرابط وافتح تلغرام    │
│  Step 1: Click to open Telegram         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔗 فتح التلغرام               │   │
│  │     Open Telegram               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  الخطوة ٢: اضغط زر "Start"             │
│  Step 2: Press "Start" button           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [📱 شاهد الشرح - Watch demo]  │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Behind the scenes:**
1. User clicks → Opens t.me/ClawdbotSetupBot
2. User presses Start in Telegram
3. Our bot creates their personal bot via BotFather API
4. Returns bot token to our backend (user never sees it)
5. Backend configures their container

#### Step 3: First Interaction (1 min)

**Goal:** Get user to experience value immediately.

```
┌─────────────────────────────────────────┐
│                                         │
│  جرّب مساعدك الآن! 🎉                   │
│  Try your assistant now!                │
│                                         │
│  ارسل له رسالة في التلغرام:            │
│  Send him a message on Telegram:        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  @AhmedAssistantBot             │   │
│  └─────────────────────────────────┘   │
│     [نسخ - Copy]                        │
│                                         │
│  جرب تقول:                              │
│  Try saying:                            │
│  "فكرني باجتماعي الساعة ٣"             │
│  "Remind me of my meeting at 3 PM"      │
│                                         │
│  [  تم - Done  ]                        │
│                                         │
└─────────────────────────────────────────┘
```

### Success Metric
User sends first message to their bot.

---

## Stage 5: Activation (First Value)

### Touchpoint: Telegram Bot

#### The First Response is CRITICAL

Bad response:
> "Hello! I am your AI assistant. How can I help you today?"

Good response (in Arabic):
> "أهلاً أحمد! 👋
> 
> أنا مساعدك الشخصي. أقدر أساعدك بـ:
> • الرد على رسايلك وأنت مشغول 🤖
> • تذكيرك بمواعيدك ومهامك ⏰
> 
> جرّب تقول: "فكرني أتصل بأمي بكره الساعة ٨"
> 
> ---
> 
> Hi Ahmed! 👋
> 
> I'm your personal assistant. I can help you with:
> • Replying to messages when you're busy 🤖
> • Reminding you of appointments and tasks ⏰
> 
> Try saying: "Remind me to call my mom tomorrow at 8 PM""

### First Reminder Experience

When the first reminder fires, it should feel magical:

```
┌─────────────────────────────────────────┐
│                                         │
│  ⏰ تذكير!                               │
│  Reminder!                              │
│                                         │
│  اجتماعك الآن!                          │
│  Your meeting is now!                   │
│                                         │
│  [ تم - Done ]  [ تأجيل ١٥ دقيقة ]     │
│                                         │
└─────────────────────────────────────────┘
```

### Success Metric
User sets and receives first reminder.

---

## Stage 6: Habit Formation

### Day 1-7: Daily Engagement Campaign

| Day | Time | Message | Goal |
|-----|------|---------|------|
| 1 | Immediately | Welcome + capabilities | Set expectations |
| 2 | 9 AM | "حطيت مواعيد اليوم؟" (Got any appointments today?) | Prompt usage |
| 3 | 9 AM | Feature highlight: Auto-replies | Discover value |
| 4 | - | Silent (let user initiate) | Don't overwhelm |
| 5 | 2 PM | "كيف ساعدك المساعد هذا الاسبوع؟" (How did the assistant help this week?) | Engagement check |
| 7 | 9 AM | Usage stats + upgrade prompt | Convert to paid |

### Week 2+: Ongoing Value

**Proactive Suggestions:**
> "لاحظت عندك اجتماع كل أحد. تبي أفكرك فيه تلقائياً؟"
> 
> "I noticed you have a meeting every Sunday. Want me to remind you automatically?"

### Success Metric
User sends 5+ messages/week after 30 days.

---

## Friction Points & Solutions

| Friction Point | Why It's Bad | Solution |
|----------------|--------------|----------|
| "Create bot with BotFather" | User doesn't know what this means | Helper bot does it for them |
| "Enter API token" | Looks scary/technical | Never show token to user |
| "Download this app" | Extra friction | Web-based setup |
| Email verification | Slow, users abandon | WhatsApp/Telegram OTP |
| "Choose a plan" | Decision paralysis | Start free, upgrade later |
| Password creation | Forgotten passwords | Magic links only |

---

## Success Metrics by Stage

| Stage | Metric | Target |
|-------|--------|--------|
| Awareness → Interest | Landing page CTR | >15% |
| Interest → Signup | Signup completion | >40% |
| Signup → Setup | Wizard completion | >70% |
| Setup → Activation | First message sent | >80% |
| Activation → Habit | 5+ messages/week at day 30 | >50% |

---

## User Interview Questions (For Validation)

### To Ask Omar (First Customer)

1. "Where did you first hear about this service?"
2. "What made you decide to try it?"
3. "Was there any step where you felt confused?"
4. "How long did setup take?"
5. "What would you tell a friend about this?"
6. "What's the main thing you use it for?"
7. "Would you pay 29 SAR/month for this? Why/why not?"

---

## Appendix: Edge Cases

### User doesn't have Telegram
**Solution:** Offer WhatsApp Business API setup (more complex, but possible)

### User's Telegram is personal (not Business)
**Solution:** Works fine. Personal bots work the same way.

### User doesn't understand "bot"
**Solution:** Never use the word "bot" in user-facing copy. Use "مساعد" (assistant) only.

### User enters wrong phone number
**Solution:** Allow correction + resend. No account lockouts.

### User abandons during setup
**Solution:** WhatsApp follow-up next day: "تبي نكمل إعداد المساعد؟" (Want to finish setting up the assistant?)

---

*Document Version: 1.0*
*Date: 2025-01-19*
