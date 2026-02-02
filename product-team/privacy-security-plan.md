# Privacy & Security Plan

## Executive Summary

This document outlines the privacy and security model for the Clawdbot Setup Service. Our approach prioritizes data isolation, encryption, and transparency to build trust with non-technical Saudi customers.

---

## 1. Privacy Principles

### 1.1 Core Commitments

| Principle | Implementation | User-Facing Promise |
|-----------|---------------|---------------------|
| **Isolation** | Container-based separation | "بياناتك في صندوق مغلق" (Your data is in a locked box) |
| **Encryption** | AES-256 at rest, TLS 1.3 in transit | "مشفرة وما يقدر أحد يقراها" (Encrypted, no one can read it) |
| **Minimalism** | Collect only what's needed | "ناخذ بس اللي نحتاجه" (We only take what we need) |
| **Transparency** | Clear Arabic privacy policy | "صريحين معك" (We're honest with you) |
| **Control** | One-click data deletion | "تحكم كامل في بياناتك" (Full control over your data) |

### 1.2 Data Classification

| Data Type | Sensitivity | Storage | Retention |
|-----------|-------------|---------|-----------|
| Chat messages | High | Encrypted container | Duration of service |
| Reminders/tasks | Medium | Encrypted container | Until completed + 30 days |
| User settings | Low | Encrypted container | Duration of service |
| API tokens | Critical | Docker secrets (read-only) | Duration of service |
| Phone number | Medium | Main DB (hashed) | Duration of service |
| Payment info | Critical | Stripe/PayPal only (never stored) | N/A |

---

## 2. Technical Architecture

### 2.1 Isolation Model

```
┌─────────────────────────────────────────────────────────────┐
│                      HOST VPS                                │
│                   (Hetzner/Contabo)                          │
├─────────────────────────────────────────────────────────────┤
│  Kernel Namespace Isolation                                  │
│  ├─ PID namespace: Process isolation                         │
│  ├─ Network namespace: Separate network stack                │
│  ├─ Mount namespace: Isolated filesystem                     │
│  └─ User namespace: Non-root mapping                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Docker Container Layer                  │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │  Customer   │  │  Customer   │  │  Customer   │  │    │
│  │  │     A       │  │     B       │  │     C       │  │    │
│  │  ├─────────────┤  ├─────────────┤  ├─────────────┤  │    │
│  │  │  Clawdbot   │  │  Clawdbot   │  │  Clawdbot   │  │    │
│  │  │  Process    │  │  Process    │  │  Process    │  │    │
│  │  ├─────────────┤  ├─────────────┤  ├─────────────┤  │    │
│  │  │  SQLite     │  │  SQLite     │  │  SQLite     │  │    │
│  │  │  Database   │  │  Database   │  │  Database   │  │    │
│  │  ├─────────────┤  ├─────────────┤  ├─────────────┤  │    │
│  │  │  Memory     │  │  Memory     │  │  Memory     │  │    │
│  │  │  Files      │  │  Files      │  │  Files      │  │    │
│  │  ├─────────────┤  ├─────────────┤  ├─────────────┤  │    │
│  │  │  Secrets    │  │  Secrets    │  │  Secrets    │  │    │
│  │  │  (read-only)│  │  (read-only)│  │  (read-only)│  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  │                                                      │    │
│  │  NO SHARED RESOURCES BETWEEN CONTAINERS              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Encrypted Storage Layer                 │    │
│  │         (LUKS/dm-crypt full disk encryption)         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Security Layers

```
Layer 1: Physical
├── VPS provider (Hetzner) security
├── Datacenter access controls
└── Hardware-level protections

Layer 2: Host
├── Ubuntu 22.04 LTS with automatic updates
├── UFW firewall (deny all, allow specific)
├── Fail2ban for brute force protection
├── Unattended security updates
└── No SSH password auth (keys only)

Layer 3: Container Runtime
├── Docker in rootless mode (future)
├── AppArmor profiles per container
├── Seccomp default profiles
├── No privileged containers
└── Resource limits (CPU/memory)

Layer 4: Application
├── Non-root user inside container
├── Read-only filesystem where possible
├── Secrets mounted as files (not env vars)
├── No shell access to containers
└── Health checks and auto-restart

Layer 5: Data
├── LUKS encryption at rest
├── No data logging by reverse proxy
├── Automated encrypted backups
└── Secure deletion on account termination
```

### 2.3 Network Security

```
Internet
    │
    ▼
┌─────────────────┐
│  Cloudflare     │  (DDoS protection, CDN)
│  or Direct      │
└────────┬────────┘
         │ HTTPS/TLS 1.3
         ▼
┌─────────────────┐
│  Caddy/Nginx    │  (Reverse proxy)
│  • Rate limiting│
│  • WAF rules    │
│  • Bot detection│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Docker Network │  (Internal bridge)
│  (isolated)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ CustA │ │ CustB │  (Containers can't talk to each other)
└───────┘ └───────┘
```

---

## 3. Data Handling

### 3.1 What We Store

| Data | Why | Where | How Long |
|------|-----|-------|----------|
| Chat messages with bot | Core functionality | Encrypted container | Service duration |
| Created reminders/tasks | Core functionality | Encrypted container | 30 days after completion |
| User preferences | Personalization | Encrypted container | Service duration |
| Telegram bot token | API access | Docker secrets | Service duration |
| Phone number | Account identification | Hashed in main DB | Service duration |
| Payment reference | Billing | Stripe only | Per Stripe policy |

### 3.2 What We DON'T Store

| Data | Why Not |
|------|---------|
| User's personal Telegram messages | Not our business |
| Voice messages content (if voice enabled) | Too sensitive |
| Location data | Not needed |
| Contact lists | Not needed |
| Message metadata from other chats | Privacy violation |

### 3.3 Data Flow

```
User sends message
        │
        ▼
┌─────────────────┐
│  Telegram API   │ ──▶ Telegram servers (outside our control)
└────────┬────────┘
         │ Webhook (HTTPS)
         ▼
┌─────────────────┐
│  Our Server     │
│  (Verify HMAC   │
│   signature)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Route to       │
│  customer       │
│  container      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Process &      │
│  store in       │
│  container DB   │
└─────────────────┘
```

---

## 4. Encryption Specifications

### 4.1 At Rest

```yaml
Encryption: LUKS (Linux Unified Key Setup)
Algorithm: AES-256-XTS
Key size: 512 bits (256 for XTS mode)
Key derivation: Argon2id
Backup encryption: GPG with RSA-4096
```

### 4.2 In Transit

```yaml
Protocol: TLS 1.3 (minimum 1.2)
Certificate: Let's Encrypt (auto-renew)
Cipher suites: Only forward-secret suites
HSTS: Enabled (max-age: 31536000)
```

### 4.3 Secrets Management

```yaml
Storage: Docker secrets (in-memory)
Rotation: On suspicious activity
Access: Read-only inside container
Backup: GPG-encrypted, offline storage
```

---

## 5. Access Controls

### 5.1 Who Can Access What

| Role | Host Access | Container Access | Data Access |
|------|-------------|------------------|-------------|
| Customer | No | Their container only | Their data only |
| Support | Limited SSH | None (unless authorized) | None (unless authorized) |
| Admin | Full | All (emergency only) | All (emergency only) |
| Automated | API only | Provisioning only | None |

### 5.2 Emergency Access Protocol

1. **Trigger:** System outage or customer request
2. **Authorization:** Two-person rule for admin access
3. **Logging:** All access logged with reason
4. **Duration:** Time-limited (1 hour default)
5. **Audit:** Review within 24 hours

---

## 6. Compliance & Regulations

### 6.1 Saudi Arabia (SDAIA)

| Requirement | Status | Plan |
|-------------|--------|------|
| Data localization | ⚠️ Partial | Currently EU-hosted, migrate to Saudi cloud when mature |
| Consent management | ✅ | Explicit opt-in during signup |
| Data subject rights | ✅ | One-click export/delete |
| Breach notification | ✅ | 72-hour internal, user notification if applicable |

### 6.2 GDPR Alignment (Best Practice)

| Principle | Implementation |
|-----------|---------------|
| Lawful basis | Contract performance (providing service) |
| Purpose limitation | Only for AI assistant functionality |
| Data minimization | Collect only necessary data |
| Accuracy | User can update via bot commands |
| Storage limitation | Deleted on account termination |
| Integrity/confidentiality | Encryption + access controls |
| Accountability | Documented security measures |

### 6.3 Data Subject Rights

| Right | How to Exercise |
|-------|-----------------|
| Access | Request via Telegram bot: "اعطني بياناتي" |
| Rectification | Update via bot: "غير اسمي إلى..." |
| Erasure | Dashboard button or: "احذف حسابي" |
| Portability | Export button: JSON/CSV download |
| Restriction | Pause service button |
| Objection | Unsubscribe from non-essential comms |

---

## 7. Incident Response

### 7.1 Severity Levels

| Level | Example | Response Time |
|-------|---------|---------------|
| P1 - Critical | Data breach, full outage | Immediate |
| P2 - High | Single customer data exposure | 1 hour |
| P3 - Medium | Performance degradation | 4 hours |
| P4 - Low | Minor bug | 24 hours |

### 7.2 Breach Response Plan

```
1. DETECT (Automated monitoring)
   │
   ▼
2. CONTAIN (Isolate affected containers)
   │
   ▼
3. ASSESS (Determine scope)
   │
   ▼
4. NOTIFY (Affected users within 72h if required)
   │
   ▼
5. REMEDIATE (Fix vulnerability)
   │
   ▼
6. REVIEW (Post-incident analysis)
```

### 7.3 User Notification Template (Arabic)

```
⚠️ تنبيه أمني / Security Notice

لاحظنا نشاط غير طبيعي ممكن يكون أثر على بياناتك. 
التحقيق لسه مستمر، بس إحتياطاً:

• غيّر رقمك السري (لو عندك)
• راجع آخر نشاط في حسابك
• تواصل معنا لو عندك أسئلة

We noticed unusual activity that may have affected your data.
Investigation is ongoing, but as a precaution:

• Change your password (if applicable)
• Review recent account activity
• Contact us with any questions

نعتذر منك / We apologize
فريق Clawdbot
```

---

## 8. Privacy Policy (User-Facing)

### 8.1 Arabic Version (Primary)

---

**سياسة الخصوصية - Privacy Policy**

**إيش البيانات اللي نجمعها؟**
- رسائلك مع المساعد (عشان يقدر يساعدك)
- المواعيد والمهام اللي تضيفها
- إعداداتك الشخصية

**وش نسوي فيها؟**
نستخدمها بس عشان المساعد يشتغل. ما نبيعها، ما نشاركها، ما نطلع فيها.

**كيف نحميها؟**
• تشفير كامل (زي البنوك)
• كل عميل لحاله (ما في خلط)
• سيرفرات آمنة في أوروبا (قريب ننتقل للسعودية)

**حقوقك:**
✅ تشوف بياناتك في أي وقت
✅ تعدلها
✅ تحذفها نهائياً
✅ توقف الخدمة متى تبي

**للتواصل:**
راسلنا في التلغرام: @ClawdbotSupport

---

### 8.2 English Version

---

**What data we collect:**
- Your messages with the assistant (to provide service)
- Reminders and tasks you create
- Your personal settings

**What we do with it:**
We only use it to run the assistant. We don't sell it, share it, or look at it.

**How we protect it:**
• Full encryption (bank-level)
• Each customer isolated (no mixing)
• Secure servers in Europe (migrating to Saudi soon)

**Your rights:**
✅ View your data anytime
✅ Update it
✅ Delete it permanently
✅ Stop service whenever you want

**Contact:**
Telegram: @ClawdbotSupport

---

## 9. Security Checklist

### 9.1 Deployment Checklist

- [ ] LUKS encryption enabled on host
- [ ] Docker daemon secured
- [ ] Firewall configured (deny all, allow specific)
- [ ] Automatic security updates enabled
- [ ] Backups encrypted and tested
- [ ] Monitoring alerts configured
- [ ] Incident response plan documented
- [ ] Privacy policy published
- [ ] Security headers configured
- [ ] Rate limiting enabled

### 9.2 Regular Reviews

| Frequency | Task |
|-----------|------|
| Daily | Review security alerts |
| Weekly | Check for container vulnerabilities |
| Monthly | Review access logs |
| Quarterly | Full security audit |
| Annually | Penetration test |

---

## 10. Appendix: Threat Model

### 10.1 Identified Threats

| Threat | Likelihood | Impact | Mitigation |
|--------|-----------|--------|------------|
| Container escape | Low | High | AppArmor, seccomp, non-root |
| Data breach via API | Low | High | HMAC validation, rate limiting |
| Insider threat | Low | Medium | Access logs, 2-person rule |
| Physical theft | Very Low | High | Encryption at rest |
| Telegram API compromise | Very Low | High | Minimal data, encrypted |
| Social engineering | Medium | Low | Training, verification |

### 10.2 Attack Scenarios

**Scenario 1: Malicious customer tries to access another customer's data**
- Container isolation prevents network access
- Filesystem permissions prevent file access
- Database is separate per container

**Scenario 2: Host is compromised**
- Encryption at rest protects data
- Attacker needs keys (stored separately)
- Containers add isolation layer

**Scenario 3: Telegram webhook spoofing**
- HMAC signature validation
- Token-based authentication
- Rate limiting prevents abuse

---

*Document Version: 1.0*
*Last Updated: 2025-01-19*
*Next Review: 2025-04-19*
