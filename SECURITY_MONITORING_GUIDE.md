# GeoVera SaaS - Security Monitoring & Incident Response Guide

**Project:** staging-geovera (vozjwptzutolvkvfpknk)
**Date:** 2026-02-12
**Classification:** Production Operations Security

---

## Table of Contents
1. [Security Monitoring Overview](#1-security-monitoring-overview)
2. [Audit Logging](#2-audit-logging)
3. [Security Event Detection](#3-security-event-detection)
4. [Real-Time Alerting](#4-real-time-alerting)
5. [Incident Response](#5-incident-response)
6. [Compliance & Reporting](#6-compliance--reporting)
7. [Monitoring Dashboards](#7-monitoring-dashboards)
8. [Metrics & KPIs](#8-metrics--kpis)

---

## 1. Security Monitoring Overview

### 1.1 Monitoring Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│  (Frontend, Edge Functions, Supabase Realtime)          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Security Layer                          │
│  • Authentication Events                                 │
│  • Authorization Checks                                  │
│  • Rate Limiting                                         │
│  • Input Validation                                      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Logging Layer                           │
│  • audit_logs (user actions)                            │
│  • security_events (threats & incidents)                │
│  • rate_limits (rate limit violations)                  │
│  • active_sessions (session tracking)                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Analysis & Alerting                     │
│  • Real-time anomaly detection                          │
│  • Automated alerts (Slack, Email, PagerDuty)          │
│  • Dashboard visualization (Grafana, Supabase)          │
│  • Compliance reporting                                  │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Monitoring Objectives

**Primary Goals:**
- Detect security incidents in real-time
- Track user activity for audit compliance
- Identify anomalous behavior patterns
- Measure security posture over time
- Enable rapid incident response

**Key Metrics:**
- Failed login attempts per hour
- Account lockouts per day
- Rate limit violations per minute
- Unauthorized access attempts
- Suspicious activity patterns
- Data access by sensitivity level

---

## 2. Audit Logging

### 2.1 Audit Log Schema

The `audit_logs` table captures all significant user actions:

```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.gv_brands(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB, -- Before state (for updates/deletes)
  new_data JSONB, -- After state (for creates/updates)
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 What to Audit

**Critical Actions (ALWAYS log):**
```typescript
const CRITICAL_ACTIONS = {
  // Authentication
  'user_login': { severity: 'medium', retention: '2 years' },
  'user_logout': { severity: 'low', retention: '1 year' },
  'password_changed': { severity: 'high', retention: '2 years' },
  'password_reset': { severity: 'high', retention: '2 years' },
  'mfa_enabled': { severity: 'high', retention: '2 years' },
  'mfa_disabled': { severity: 'high', retention: '2 years' },

  // User Management
  'user_created': { severity: 'medium', retention: '2 years' },
  'user_deleted': { severity: 'high', retention: '7 years' },
  'role_changed': { severity: 'high', retention: '2 years' },
  'user_invited': { severity: 'medium', retention: '1 year' },

  // Data Access
  'sensitive_data_accessed': { severity: 'high', retention: '2 years' },
  'data_exported': { severity: 'high', retention: '2 years' },
  'bulk_delete': { severity: 'critical', retention: '7 years' },

  // Payment
  'payment_processed': { severity: 'high', retention: '7 years' },
  'subscription_changed': { severity: 'medium', retention: '7 years' },
  'invoice_viewed': { severity: 'low', retention: '2 years' },

  // API
  'api_key_created': { severity: 'high', retention: '2 years' },
  'api_key_revoked': { severity: 'high', retention: '2 years' },
  'api_key_used': { severity: 'low', retention: '90 days' },

  // System
  'settings_changed': { severity: 'medium', retention: '2 years' },
  'integration_connected': { severity: 'medium', retention: '1 year' },
  'webhook_configured': { severity: 'medium', retention: '1 year' }
}
```

### 2.3 Audit Logging Implementation

```typescript
// audit-logger.ts
interface AuditLogEntry {
  action: string
  table_name: string
  record_id?: string
  old_data?: Record<string, any>
  new_data?: Record<string, any>
}

export async function logAudit(
  entry: AuditLogEntry,
  context: {
    userId?: string
    brandId?: string
    ipAddress?: string
    userAgent?: string
  }
) {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: context.userId,
      brand_id: context.brandId,
      action: entry.action,
      table_name: entry.table_name,
      record_id: entry.record_id,
      old_data: entry.old_data,
      new_data: entry.new_data,
      ip_address: context.ipAddress,
      user_agent: context.userAgent
    })

  if (error) {
    console.error('Failed to log audit entry:', error)
    // Send to backup logging service (e.g., Sentry)
    await sendToBackupLogger(entry, context)
  }

  return { data, error }
}

// Example usage: Log brand update
async function updateBrand(brandId: string, updates: Partial<Brand>) {
  // Get old state
  const { data: oldBrand } = await supabase
    .from('gv_brands')
    .select('*')
    .eq('id', brandId)
    .single()

  // Perform update
  const { data: newBrand } = await supabase
    .from('gv_brands')
    .update(updates)
    .eq('id', brandId)
    .select()
    .single()

  // Log audit
  await logAudit(
    {
      action: 'update',
      table_name: 'gv_brands',
      record_id: brandId,
      old_data: oldBrand,
      new_data: newBrand
    },
    {
      userId: currentUser.id,
      brandId: brandId,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent')
    }
  )
}
```

### 2.4 Automatic Audit Logging with Database Triggers

```sql
-- Create audit logging function
CREATE OR REPLACE FUNCTION public.audit_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_data
    ) VALUES (
      auth.uid(),
      'delete',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data
    ) VALUES (
      auth.uid(),
      'update',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      new_data
    ) VALUES (
      auth.uid(),
      'create',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Apply trigger to critical tables
CREATE TRIGGER audit_gv_brands
  AFTER INSERT OR UPDATE OR DELETE ON public.gv_brands
  FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

CREATE TRIGGER audit_gv_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON public.gv_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

CREATE TRIGGER audit_user_brands
  AFTER INSERT OR UPDATE OR DELETE ON public.user_brands
  FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

-- Add triggers for other sensitive tables...
```

---

## 3. Security Event Detection

### 3.1 Security Events Schema

```sql
CREATE TABLE public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_event_type ON public.security_events(event_type);
```

### 3.2 Event Types & Severity Levels

```typescript
enum SecurityEventType {
  // Authentication Threats
  FAILED_LOGIN = 'failed_login',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_LOGIN = 'suspicious_login',
  BRUTE_FORCE_DETECTED = 'brute_force_detected',

  // Authorization Violations
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PRIVILEGE_ESCALATION_ATTEMPT = 'privilege_escalation_attempt',
  CROSS_BRAND_ACCESS_ATTEMPT = 'cross_brand_access_attempt',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  API_ABUSE_DETECTED = 'api_abuse_detected',

  // Data Security
  SENSITIVE_DATA_BREACH_ATTEMPT = 'sensitive_data_breach_attempt',
  SUSPICIOUS_DATA_EXPORT = 'suspicious_data_export',
  BULK_OPERATION_ANOMALY = 'bulk_operation_anomaly',

  // Input Validation
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  INVALID_INPUT_PATTERN = 'invalid_input_pattern',

  // Account Security
  PASSWORD_RESET_ABUSE = 'password_reset_abuse',
  ACCOUNT_TAKEOVER_ATTEMPT = 'account_takeover_attempt',
  SESSION_HIJACKING_DETECTED = 'session_hijacking_detected',

  // System Security
  CONFIGURATION_TAMPERED = 'configuration_tampered',
  SUSPICIOUS_API_KEY_USAGE = 'suspicious_api_key_usage',
  WEBHOOK_COMPROMISE = 'webhook_compromise'
}

enum Severity {
  LOW = 'low',           // Informational, no immediate action required
  MEDIUM = 'medium',     // Investigate within 24 hours
  HIGH = 'high',         // Investigate within 1 hour
  CRITICAL = 'critical'  // Immediate action required
}
```

### 3.3 Anomaly Detection Rules

```typescript
// anomaly-detector.ts
interface AnomalyRule {
  name: string
  condition: (context: any) => Promise<boolean>
  severity: Severity
  action: (context: any) => Promise<void>
}

const ANOMALY_RULES: AnomalyRule[] = [
  {
    name: 'Multiple Failed Logins',
    condition: async (context) => {
      const { data } = await supabase
        .from('security_events')
        .select('count')
        .eq('event_type', 'failed_login')
        .eq('ip_address', context.ipAddress)
        .gte('created_at', new Date(Date.now() - 15 * 60 * 1000)) // Last 15 min

      return data?.[0]?.count >= 5
    },
    severity: Severity.HIGH,
    action: async (context) => {
      await lockIPAddress(context.ipAddress, 60) // Lock for 60 minutes
      await sendAlert({
        title: 'Brute Force Attack Detected',
        message: `IP ${context.ipAddress} locked due to multiple failed login attempts`,
        severity: Severity.HIGH
      })
    }
  },

  {
    name: 'Impossible Travel',
    condition: async (context) => {
      // Get last login location
      const { data: lastLogin } = await supabase
        .from('security_events')
        .select('metadata, created_at')
        .eq('user_id', context.userId)
        .eq('event_type', 'user_login')
        .order('created_at', { ascending: false })
        .limit(2)

      if (!lastLogin || lastLogin.length < 2) return false

      const location1 = lastLogin[0].metadata.location
      const location2 = lastLogin[1].metadata.location
      const timeDiff = new Date(lastLogin[0].created_at).getTime() -
                       new Date(lastLogin[1].created_at).getTime()

      // Calculate if distance/time implies impossible travel speed
      const distance = calculateDistance(location1, location2) // in km
      const timeHours = timeDiff / (1000 * 60 * 60)
      const speed = distance / timeHours

      // If speed > 1000 km/h (faster than commercial flight)
      return speed > 1000
    },
    severity: Severity.CRITICAL,
    action: async (context) => {
      await lockAccount(context.userId, 24 * 60) // Lock for 24 hours
      await sendAlert({
        title: 'Account Takeover Suspected',
        message: `Impossible travel detected for user ${context.userId}`,
        severity: Severity.CRITICAL
      })
      await sendEmailAlert(context.userEmail, 'suspicious_login')
    }
  },

  {
    name: 'Unusual Data Export Volume',
    condition: async (context) => {
      const { data } = await supabase
        .from('audit_logs')
        .select('count')
        .eq('user_id', context.userId)
        .eq('action', 'data_exported')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000)) // Last hour

      return data?.[0]?.count >= 10 // More than 10 exports in 1 hour
    },
    severity: Severity.HIGH,
    action: async (context) => {
      await flagAccountForReview(context.userId)
      await sendAlert({
        title: 'Unusual Data Export Activity',
        message: `User ${context.userId} exported data ${context.count} times in 1 hour`,
        severity: Severity.HIGH
      })
    }
  },

  {
    name: 'Off-Hours Access',
    condition: async (context) => {
      const hour = new Date().getUTCHours()
      // Suspicious if accessing between 2 AM - 5 AM user's local time
      return hour >= 2 && hour <= 5 && context.action === 'sensitive_data_accessed'
    },
    severity: Severity.MEDIUM,
    action: async (context) => {
      await logSecurityEvent({
        event_type: 'suspicious_access_time',
        severity: Severity.MEDIUM,
        description: 'User accessed sensitive data during off-hours',
        user_id: context.userId
      })
    }
  },

  {
    name: 'Privilege Escalation Attempt',
    condition: async (context) => {
      // User tries to modify their own role
      return context.action === 'update' &&
             context.table_name === 'user_brands' &&
             context.old_data?.role !== context.new_data?.role &&
             context.old_data?.user_id === context.userId
    },
    severity: Severity.CRITICAL,
    action: async (context) => {
      // Rollback the change
      await supabase
        .from('user_brands')
        .update({ role: context.old_data.role })
        .eq('id', context.record_id)

      await lockAccount(context.userId, 24 * 60)
      await sendAlert({
        title: 'CRITICAL: Privilege Escalation Attempt',
        message: `User ${context.userId} attempted to elevate their role`,
        severity: Severity.CRITICAL
      })
    }
  }
]

// Run anomaly detection
export async function detectAnomalies(context: any) {
  for (const rule of ANOMALY_RULES) {
    const isAnomaly = await rule.condition(context)

    if (isAnomaly) {
      console.warn(`Anomaly detected: ${rule.name}`)

      // Log security event
      await logSecurityEvent({
        event_type: rule.name.toLowerCase().replace(/ /g, '_'),
        severity: rule.severity,
        description: `Anomaly detected: ${rule.name}`,
        user_id: context.userId,
        metadata: context
      })

      // Execute action
      await rule.action(context)
    }
  }
}
```

---

## 4. Real-Time Alerting

### 4.1 Alert Channels

```typescript
// alert-manager.ts
enum AlertChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  PAGERDUTY = 'pagerduty',
  WEBHOOK = 'webhook',
  SMS = 'sms'
}

interface Alert {
  title: string
  message: string
  severity: Severity
  metadata?: Record<string, any>
  channels?: AlertChannel[]
}

export async function sendAlert(alert: Alert) {
  const channels = alert.channels || getDefaultChannels(alert.severity)

  const promises = channels.map(channel => {
    switch (channel) {
      case AlertChannel.EMAIL:
        return sendEmailAlert(alert)
      case AlertChannel.SLACK:
        return sendSlackAlert(alert)
      case AlertChannel.PAGERDUTY:
        return sendPagerDutyAlert(alert)
      case AlertChannel.WEBHOOK:
        return sendWebhookAlert(alert)
      case AlertChannel.SMS:
        return sendSMSAlert(alert)
      default:
        return Promise.resolve()
    }
  })

  await Promise.allSettled(promises)
}

function getDefaultChannels(severity: Severity): AlertChannel[] {
  switch (severity) {
    case Severity.CRITICAL:
      return [AlertChannel.EMAIL, AlertChannel.SLACK, AlertChannel.PAGERDUTY, AlertChannel.SMS]
    case Severity.HIGH:
      return [AlertChannel.EMAIL, AlertChannel.SLACK]
    case Severity.MEDIUM:
      return [AlertChannel.SLACK]
    case Severity.LOW:
      return [] // Only logged, no alerts
    default:
      return []
  }
}
```

### 4.2 Slack Alerts

```typescript
// slack-alerts.ts
async function sendSlackAlert(alert: Alert) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  const color = {
    [Severity.LOW]: '#36a64f',
    [Severity.MEDIUM]: '#ff9900',
    [Severity.HIGH]: '#ff6600',
    [Severity.CRITICAL]: '#ff0000'
  }[alert.severity]

  const payload = {
    username: 'GeoVera Security',
    icon_emoji: ':shield:',
    attachments: [
      {
        color,
        title: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        text: alert.message,
        fields: [
          {
            title: 'Time',
            value: new Date().toISOString(),
            short: true
          },
          {
            title: 'Severity',
            value: alert.severity.toUpperCase(),
            short: true
          }
        ],
        footer: 'GeoVera Security Monitoring',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}
```

### 4.3 Email Alerts

```typescript
// email-alerts.ts
async function sendEmailAlert(alert: Alert) {
  const recipients = getSecurityTeamEmails(alert.severity)

  const subject = `[GeoVera Security ${alert.severity.toUpperCase()}] ${alert.title}`

  const body = `
    <h2>${alert.title}</h2>
    <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
    <p><strong>Message:</strong></p>
    <p>${alert.message}</p>

    ${alert.metadata ? `
      <p><strong>Additional Details:</strong></p>
      <pre>${JSON.stringify(alert.metadata, null, 2)}</pre>
    ` : ''}

    <hr>
    <p>
      <a href="${process.env.APP_URL}/admin/security">View Security Dashboard</a>
    </p>
  `

  // Send via your email service (SendGrid, Resend, etc.)
  await sendEmail({
    to: recipients,
    subject,
    html: body
  })
}

function getSecurityTeamEmails(severity: Severity): string[] {
  if (severity === Severity.CRITICAL || severity === Severity.HIGH) {
    return [
      'security@geovera.com',
      'cto@geovera.com',
      'oncall@geovera.com'
    ]
  }

  return ['security@geovera.com']
}
```

### 4.4 PagerDuty Integration

```typescript
// pagerduty-alerts.ts
async function sendPagerDutyAlert(alert: Alert) {
  const apiKey = process.env.PAGERDUTY_API_KEY

  const payload = {
    routing_key: apiKey,
    event_action: 'trigger',
    payload: {
      summary: alert.title,
      severity: alert.severity,
      source: 'GeoVera Security',
      timestamp: new Date().toISOString(),
      custom_details: alert.metadata
    }
  }

  await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
}
```

---

## 5. Incident Response

### 5.1 Incident Response Plan

**Phase 1: Detection (Automated)**
```typescript
1. Security event triggers alert
2. Alert sent to security team via configured channels
3. Incident ticket created automatically
4. On-call engineer notified
```

**Phase 2: Triage (< 15 minutes)**
```typescript
1. Assess severity and scope
2. Determine if active attack
3. Identify affected users/brands
4. Escalate if necessary
```

**Phase 3: Containment (< 1 hour)**
```typescript
1. Lock compromised accounts
2. Revoke suspicious API keys
3. Block malicious IP addresses
4. Isolate affected systems
5. Preserve evidence
```

**Phase 4: Investigation (< 24 hours)**
```typescript
1. Review audit logs
2. Identify attack vector
3. Determine data exposure
4. Document timeline
5. Collect forensic evidence
```

**Phase 5: Remediation (< 48 hours)**
```typescript
1. Patch vulnerabilities
2. Reset credentials
3. Restore systems
4. Verify security measures
5. Deploy fixes
```

**Phase 6: Recovery (< 7 days)**
```typescript
1. Unlock legitimate accounts
2. Notify affected users
3. Provide support
4. Monitor for recurrence
```

**Phase 7: Post-Mortem (< 14 days)**
```typescript
1. Write incident report
2. Conduct lessons learned
3. Update security policies
4. Improve detection rules
5. Train team on findings
```

### 5.2 Incident Response Runbook

#### Runbook 1: Account Takeover

**Detection Signals:**
- Impossible travel
- Login from new device/location
- Password changed by unknown party
- Suspicious data exports

**Immediate Actions:**
```typescript
async function handleAccountTakeover(userId: string) {
  // 1. Lock account
  await lockAccount(userId, 24 * 60) // 24 hours

  // 2. Invalidate all sessions
  await supabase.auth.admin.signOut(userId, 'global')

  // 3. Revoke API keys
  await supabase
    .from('api_keys')
    .update({ revoked: true })
    .in('brand_id', getBrandIds(userId))

  // 4. Notify user via verified email
  await sendEmailAlert(user.verified_email, 'account_locked_security')

  // 5. Log incident
  await logSecurityEvent({
    event_type: 'account_takeover_response',
    severity: Severity.CRITICAL,
    description: 'Account locked due to takeover attempt',
    user_id: userId
  })

  // 6. Create incident ticket
  await createIncidentTicket({
    title: 'Account Takeover Detected',
    severity: Severity.CRITICAL,
    user_id: userId
  })

  // 7. Alert security team
  await sendAlert({
    title: 'CRITICAL: Account Takeover Response',
    message: `Account ${userId} locked. Immediate investigation required.`,
    severity: Severity.CRITICAL
  })
}
```

**Investigation Steps:**
1. Review audit logs for suspicious activity
2. Check login history (IPs, devices, locations)
3. Identify data accessed/exported
4. Determine entry point (weak password, phishing, etc.)
5. Assess if other accounts compromised

**Recovery Steps:**
1. Contact user via verified channels
2. Verify identity (phone, ID verification)
3. Force password reset
4. Enable MFA
5. Review account activity with user
6. Unlock account if verified
7. Monitor for 30 days

---

#### Runbook 2: Data Breach

**Detection Signals:**
- Unusual data export volume
- Access to sensitive tables by unauthorized user
- Database intrusion detected
- RLS policy bypassed

**Immediate Actions:**
```typescript
async function handleDataBreach() {
  // 1. Assess scope
  const { data: suspiciousActivity } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('action', 'read')
    .eq('table_name', 'gv_invoices') // Example: payment data
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000))

  // 2. Identify affected users
  const affectedUserIds = [...new Set(suspiciousActivity.map(a => a.user_id))]

  // 3. Lock accounts
  for (const userId of affectedUserIds) {
    await lockAccount(userId, 24 * 60)
  }

  // 4. Notify stakeholders
  await sendAlert({
    title: 'CRITICAL: Potential Data Breach',
    message: `${affectedUserIds.length} users may have been affected`,
    severity: Severity.CRITICAL,
    channels: [AlertChannel.EMAIL, AlertChannel.SLACK, AlertChannel.PAGERDUTY, AlertChannel.SMS]
  })

  // 5. Preserve evidence
  await exportAuditLogs(suspiciousActivity)

  // 6. Initiate incident response
  await createIncidentTicket({
    title: 'Data Breach Investigation',
    severity: Severity.CRITICAL,
    affected_users: affectedUserIds.length
  })
}
```

**Investigation Steps:**
1. Determine what data was accessed
2. Identify all affected users
3. Review RLS policies for vulnerabilities
4. Check for SQL injection or other exploits
5. Document attack timeline

**Notification Requirements:**
- Notify affected users within 72 hours (GDPR)
- Notify regulatory bodies if required
- Prepare public statement if necessary
- Offer credit monitoring if PII exposed

---

#### Runbook 3: DDoS Attack

**Detection Signals:**
- Extremely high request rate
- Multiple rate limit violations
- Single IP or IP range flooding
- Service degradation

**Immediate Actions:**
```typescript
async function handleDDoS(attackPattern: string) {
  // 1. Identify attack IPs
  const { data: attackIPs } = await supabase
    .from('rate_limits')
    .select('identifier')
    .gte('count', 1000)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000))

  // 2. Block IPs at CDN level (Cloudflare, etc.)
  for (const ip of attackIPs) {
    await blockIPAtCDN(ip.identifier)
  }

  // 3. Enable stricter rate limits
  await updateRateLimits({
    api_call: { maxAttempts: 50, windowSeconds: 60 } // Reduce from 100 to 50
  })

  // 4. Alert team
  await sendAlert({
    title: 'DDoS Attack Detected',
    message: `${attackIPs.length} IPs blocked. Stricter rate limits enabled.`,
    severity: Severity.HIGH
  })

  // 5. Monitor for escalation
  scheduleHealthCheck(5) // Check every 5 minutes
}
```

---

## 6. Compliance & Reporting

### 6.1 Compliance Requirements

**GDPR (EU)**
- Right to access (Article 15)
- Right to erasure (Article 17)
- Right to data portability (Article 20)
- Breach notification within 72 hours (Article 33)

**CCPA (California)**
- Right to know what data is collected
- Right to delete personal information
- Right to opt-out of data sales
- Non-discrimination for exercising rights

**PCI-DSS (Payment Card Industry)**
- Never store full credit card numbers
- Encrypt payment data
- Maintain audit logs
- Regular security testing

### 6.2 Compliance Reporting Queries

```sql
-- GDPR: Export all user data
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'profile', (SELECT jsonb_agg(row_to_json(p)) FROM profiles p WHERE id = target_user_id),
    'brands', (SELECT jsonb_agg(row_to_json(b)) FROM gv_brands b
               JOIN user_brands ub ON b.id = ub.brand_id
               WHERE ub.user_id = target_user_id),
    'audit_logs', (SELECT jsonb_agg(row_to_json(a)) FROM audit_logs a
                   WHERE user_id = target_user_id),
    'security_events', (SELECT jsonb_agg(row_to_json(s)) FROM security_events s
                        WHERE user_id = target_user_id)
  );
$$;

-- GDPR: Delete all user data
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete user brands (ownership transfer may be needed first)
  DELETE FROM user_brands WHERE user_id = target_user_id;

  -- Anonymize audit logs (don't delete for compliance)
  UPDATE audit_logs SET user_id = NULL WHERE user_id = target_user_id;
  UPDATE security_events SET user_id = NULL WHERE user_id = target_user_id;

  -- Delete profile
  DELETE FROM profiles WHERE id = target_user_id;

  -- Delete auth user
  -- This must be done via Supabase Auth API: supabase.auth.admin.deleteUser(target_user_id)
END;
$$;

-- Monthly security report
CREATE OR REPLACE FUNCTION generate_monthly_security_report(month_start DATE)
RETURNS TABLE(
  metric TEXT,
  value BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'Failed Login Attempts'::TEXT, COUNT(*)::BIGINT
  FROM security_events
  WHERE event_type = 'failed_login'
    AND created_at >= month_start
    AND created_at < month_start + INTERVAL '1 month'

  UNION ALL

  SELECT 'Account Lockouts', COUNT(*)
  FROM security_events
  WHERE event_type = 'account_locked'
    AND created_at >= month_start
    AND created_at < month_start + INTERVAL '1 month'

  UNION ALL

  SELECT 'Rate Limit Violations', COUNT(*)
  FROM security_events
  WHERE event_type = 'rate_limit_exceeded'
    AND created_at >= month_start
    AND created_at < month_start + INTERVAL '1 month'

  UNION ALL

  SELECT 'Critical Security Events', COUNT(*)
  FROM security_events
  WHERE severity = 'critical'
    AND created_at >= month_start
    AND created_at < month_start + INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;
```

---

## 7. Monitoring Dashboards

### 7.1 Security Dashboard (Supabase SQL)

```sql
-- Create materialized view for dashboard
CREATE MATERIALIZED VIEW security_dashboard AS
SELECT
  -- Authentication metrics
  (SELECT COUNT(*) FROM security_events
   WHERE event_type = 'failed_login'
     AND created_at > NOW() - INTERVAL '24 hours') AS failed_logins_24h,

  (SELECT COUNT(*) FROM security_events
   WHERE event_type = 'account_locked'
     AND created_at > NOW() - INTERVAL '24 hours') AS account_lockouts_24h,

  -- Authorization metrics
  (SELECT COUNT(*) FROM security_events
   WHERE event_type = 'unauthorized_access'
     AND created_at > NOW() - INTERVAL '24 hours') AS unauthorized_access_24h,

  -- Rate limiting metrics
  (SELECT COUNT(*) FROM rate_limits
   WHERE window_end > NOW()
     AND count >= 100) AS active_rate_limits,

  -- Critical events
  (SELECT COUNT(*) FROM security_events
   WHERE severity = 'critical'
     AND created_at > NOW() - INTERVAL '7 days') AS critical_events_7d,

  -- High severity events
  (SELECT COUNT(*) FROM security_events
   WHERE severity = 'high'
     AND created_at > NOW() - INTERVAL '7 days') AS high_events_7d,

  -- Active sessions
  (SELECT COUNT(*) FROM active_sessions
   WHERE expires_at > NOW()) AS active_sessions,

  -- Audit activity
  (SELECT COUNT(*) FROM audit_logs
   WHERE created_at > NOW() - INTERVAL '1 hour') AS audit_entries_1h;

-- Refresh every 5 minutes
CREATE OR REPLACE FUNCTION refresh_security_dashboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW security_dashboard;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (via pg_cron or Edge Function)
```

### 7.2 Real-Time Metrics (Supabase Realtime)

```typescript
// Subscribe to real-time security events
supabase
  .channel('security_events')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'security_events',
      filter: "severity=eq.critical"
    },
    (payload) => {
      console.log('CRITICAL SECURITY EVENT:', payload)
      showNotification({
        title: 'Critical Security Alert',
        message: payload.new.description,
        type: 'error'
      })
    }
  )
  .subscribe()
```

---

## 8. Metrics & KPIs

### 8.1 Security KPIs

**Authentication Security:**
- Failed login rate (< 5% of total logins)
- Account lockout rate (< 0.1% of users)
- MFA adoption rate (target: > 50% for admins)
- Password reset frequency (monitor for abuse)

**Authorization Security:**
- Unauthorized access attempts (target: 0)
- RLS policy violations (target: 0)
- Privilege escalation attempts (target: 0)

**API Security:**
- Rate limit hit rate (< 1% of requests)
- Invalid token rate (< 0.5% of requests)
- API key revocation rate (monitor for compromises)

**Data Security:**
- Sensitive data access events (audit all)
- Data export volume (monitor for anomalies)
- Encryption coverage (target: 100%)

**Incident Response:**
- Mean time to detect (MTTD) (target: < 5 minutes)
- Mean time to respond (MTTR) (target: < 15 minutes)
- Mean time to remediate (target: < 24 hours)

---

## Conclusion

This security monitoring and incident response guide provides a comprehensive framework for maintaining security in production. Key takeaways:

**Proactive Monitoring:**
- Continuous audit logging
- Real-time anomaly detection
- Automated alerting

**Rapid Response:**
- Defined incident response procedures
- Automated containment actions
- Clear escalation paths

**Continuous Improvement:**
- Regular security reviews
- Post-mortem analysis
- Updated detection rules

**Compliance:**
- GDPR/CCPA compliance
- PCI-DSS adherence
- Audit trail maintenance

Deploy these monitoring systems alongside the RLS migration to ensure production-ready security for GeoVera SaaS.
