# Email and DNS Configuration

## Overview

This document tracks the email and DNS setup for bsldb.app, including the decision-making process and configuration details.

## Current Setup

### Domain: bsldb.app
- **Registrar**: Third Party (IONOS)
- **DNS Provider**: Vercel
- **Hosting**: Vercel
- **SSL**: Managed by Vercel (Let's Encrypt)

### Email Services

#### Contact Form Email
- **Service**: Formspree
- **Purpose**: Handles contact form submissions from website visitors
- **Configuration**: Environment variable `VITE_FORMSPREE_ENDPOINT`

#### Authentication Email (In Progress)
- **Service**: Mailgun (being set up)
- **Purpose**: Handles user authentication emails (signup, password reset, email verification)
- **Free Tier**: 5,000 emails/month
- **Future Use**: Can also handle newsletters and marketing emails

## DNS Records (Current)

Based on Vercel dashboard:

```
Type    Name        Value                           TTL    Purpose
A       subdomain   76.76.21.21                    60     Vercel hosting
TXT     _atproto    did=did:plc:hexq6m7n5dcrzy6loj27bj  60     AT Protocol
ALIAS   *           cname.vercel-dns.com           60     Vercel wildcard
ALIAS   @           a9b4g9553b65c2a3.vercel-dns.com  60  Vercel root domain
CAA     @           0 issue "letsencrypt.org"      60     SSL certificate authority
```

## Mailgun Setup Process

### Step 1: Account Creation
- [ ] Sign up at mailgun.com
- [ ] Choose free plan (5,000 emails/month)
- [ ] Verify account

### Step 2: Domain Verification
- [ ] Add bsldb.app domain to Mailgun
- [ ] Get DNS records from Mailgun
- [ ] Add DNS records to Vercel

### Step 3: SMTP Configuration
- [ ] Get SMTP credentials from Mailgun
- [ ] Configure in Supabase Authentication settings
- [ ] Test email delivery

## DNS Records Added (Mailgun) ✅

```
Type    Name                    Value                                   Status
TXT     k1._domainkey          k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA...   ✅ Verified
TXT     @                      v=spf1 include:mailgun.org ~all         ✅ Verified
MX      @                      mxa.mailgun.org (Priority: 10)          ✅ Verified
MX      @                      mxb.mailgun.org (Priority: 10)          ✅ Verified
CNAME   email                  mailgun.org                             ✅ Verified
TXT     _dmarc                 v=DMARC1; p=none; pct=100; fo=1...     🟡 Propagating
```

## Supabase Email Configuration

### Before Setup
- **Status**: Email provider not configured
- **Issue**: Cannot enable "Prevent use of leaked passwords" security feature
- **Impact**: Authentication emails not sent

### After Setup ✅
- **SMTP Server**: smtp.mailgun.org
- **Port**: 587
- **Username**: hello@bsldb.app
- **Password**: [configured in Supabase]
- **From Address**: hello@bsldb.app
- **Status**: Configured and ready

## Security Improvements Addressed

### Completed
- ✅ **OTP Long Expiry**: Fixed in Supabase dashboard (set to 3600 seconds/1 hour)

### Future (Pro Plan Required)
- 💰 **Leaked Password Protection**: Requires Supabase Pro plan upgrade

### Future Considerations
- 🟡 **Function Search Path Warnings**: Low priority database function security improvements

## Alternative Options Considered

### DNS Providers
- **Cloudflare**: Excellent features, but switching would be complex since Vercel already manages DNS well
- **IONOS**: Current registrar, poor interface for DNS management
- **Decision**: Stay with Vercel DNS for simplicity

### Email Providers
- **Gmail SMTP**: Free but limited, uses personal account
- **Supabase Built-in**: Requires paid plan upgrade
- **Mailgun**: Chosen for generous free tier and future newsletter capabilities
- **SendGrid**: Good but lower free tier (100/day vs 5000/month)
- **Brevo**: Middle ground option (300/day)

## Future Enhancements

### Email Marketing
- Newsletter signup integration
- User segmentation for targeted emails
- Email templates and automation
- Analytics and tracking

### DNS Optimizations
- Consider Cloudflare for CDN and security features
- Implement additional security headers
- Monitor DNS performance

## Troubleshooting

### Common Issues
- **DNS propagation delays**: Can take up to 48 hours
- **Email deliverability**: New domains may have emails marked as spam initially
- **DKIM verification**: Most critical for email reputation

### Testing
- Use Mailgun's email validation tools
- Test authentication flows after setup
- Monitor email delivery rates

## Maintenance

### Regular Tasks
- Monitor Mailgun usage (5,000/month limit)
- Review email delivery statistics
- Update DNS records if services change
- Renew SSL certificates (automatic via Vercel)

### Monitoring
- Supabase Security Advisor for ongoing warnings
- Mailgun dashboard for email metrics
- Vercel analytics for DNS performance

---

*Last updated: [Current Date]*
*Next review: After Mailgun setup completion*