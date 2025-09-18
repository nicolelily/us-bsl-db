import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  template: 'welcome' | 'newsletter' | 'submission_update'
  data?: Record<string, any>
  userId?: string
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Email templates
const templates: Record<string, (data: any) => EmailTemplate> = {
  welcome: (data) => ({
    subject: 'Welcome to the BSL Database Community!',
    html: generateWelcomeEmailHTML(data),
    text: generateWelcomeEmailText(data)
  }),
  newsletter: (data) => ({
    subject: data.subject || 'BSL Database Newsletter',
    html: generateNewsletterHTML(data),
    text: generateNewsletterText(data)
  }),
  submission_update: (data) => ({
    subject: `Your BSL Database submission has been ${data.status}`,
    html: generateSubmissionUpdateHTML(data),
    text: generateSubmissionUpdateText(data)
  })
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify request is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { to, subject, template, data, userId }: EmailRequest = await req.json()

    if (!to || !template) {
      throw new Error('Missing required fields: to, template')
    }

    // Generate email content from template
    const emailTemplate = templates[template]
    if (!emailTemplate) {
      throw new Error(`Unknown template: ${template}`)
    }

    const emailContent = emailTemplate(data || {})

    // Send email using your preferred service (example with a generic service)
    const emailResult = await sendEmail({
      to,
      subject: subject || emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    })

    // Log the email send
    if (userId) {
      await supabaseClient.rpc('log_email_send', {
        p_user_id: userId,
        p_email_type: template,
        p_subject: subject || emailContent.subject,
        p_recipient_email: to,
        p_provider_id: emailResult.messageId,
        p_status: emailResult.success ? 'sent' : 'failed'
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResult.messageId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Email send error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Email sending function - replace with your preferred email service
async function sendEmail({ to, subject, html, text }: {
  to: string
  subject: string
  html: string
  text: string
}) {
  // Example using Resend (you can replace with SendGrid, Mailgun, etc.)
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BSL Database <noreply@bsldatabase.com>',
      to: [to],
      subject,
      html,
      text,
    }),
  })

  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(`Email service error: ${result.message}`)
  }

  return {
    success: true,
    messageId: result.id
  }
}

// Welcome email HTML template
function generateWelcomeEmailHTML(data: any): string {
  const { userName, userEmail, newsletterOptIn } = data
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to BSL Database</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .guidelines { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐕 Welcome to the BSL Database Community!</h1>
    </div>
    
    <div class="content">
        <p>Hi ${userName || 'there'},</p>
        
        <p>Thank you for joining our community of contributors working to document breed-specific legislation across the United States. Your participation helps create transparency and awareness about these important laws.</p>
        
        <div class="guidelines">
            <h3>🚀 How to Get Started</h3>
            <ol>
                <li><strong>Explore the Database:</strong> Browse existing legislation to understand what's already documented</li>
                <li><strong>Submit New Legislation:</strong> Found BSL in your area? Click "Contribute" to add it</li>
                <li><strong>Report Updates:</strong> See outdated information? Use "Report Update" on any record</li>
                <li><strong>Track Your Contributions:</strong> Visit your profile to see your submission history and achievements</li>
            </ol>
        </div>
        
        <div class="guidelines">
            <h3>📋 Contribution Guidelines</h3>
            <ul>
                <li>Provide accurate municipality and state information</li>
                <li>Include source documents or URLs when possible</li>
                <li>Check for duplicates before submitting</li>
                <li>Be patient - all submissions are reviewed by our team</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL')}" class="button">Start Contributing</a>
            <a href="${Deno.env.get('SITE_URL')}/profile" class="button">View My Profile</a>
        </div>
        
        ${newsletterOptIn ? `
        <div style="background: #ecfdf5; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3>📧 Newsletter Subscription</h3>
            <p>You've opted to receive our newsletter! You'll get updates about:</p>
            <ul>
                <li>Database growth and new features</li>
                <li>Community highlights and top contributors</li>
                <li>Legislative trend analysis</li>
                <li>Important BSL developments</li>
            </ul>
            <p><small>You can unsubscribe anytime from your profile settings.</small></p>
        </div>
        ` : `
        <div style="background: #fef3c7; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3>📧 Stay Connected</h3>
            <p>Want to receive updates about new features, database improvements, and community highlights?</p>
            <div style="text-align: center;">
                <a href="${Deno.env.get('SITE_URL')}/profile?tab=settings" class="button">Subscribe to Newsletter</a>
            </div>
        </div>
        `}
        
        <p>Questions? Simply reply to this email or check out our FAQ section.</p>
        
        <p>Best regards,<br>The BSL Database Team</p>
    </div>
    
    <div class="footer">
        <p>BSL Database | Documenting Breed-Specific Legislation</p>
        <p><a href="${Deno.env.get('SITE_URL')}/profile?tab=settings">Manage Email Preferences</a></p>
    </div>
</body>
</html>
  `
}

// Welcome email text template
function generateWelcomeEmailText(data: any): string {
  const { userName, newsletterOptIn } = data
  
  return `
Welcome to the BSL Database Community!

Hi ${userName || 'there'},

Thank you for joining our community of contributors working to document breed-specific legislation across the United States.

HOW TO GET STARTED:
1. Explore the Database: Browse existing legislation at ${Deno.env.get('SITE_URL')}
2. Submit New Legislation: Found BSL in your area? Click "Contribute" to add it
3. Report Updates: See outdated information? Use "Report Update" on any record
4. Track Your Contributions: Visit your profile to see your submission history

CONTRIBUTION GUIDELINES:
- Provide accurate municipality and state information
- Include source documents or URLs when possible
- Check for duplicates before submitting
- Be patient - all submissions are reviewed by our team

${newsletterOptIn ? 
  'NEWSLETTER SUBSCRIPTION: You\'ve opted to receive our newsletter with database updates, community highlights, and legislative trends.' :
  'STAY CONNECTED: Subscribe to our newsletter in your profile settings to receive updates about new features and community highlights.'
}

Questions? Reply to this email or visit our FAQ.

Best regards,
The BSL Database Team

---
Manage your email preferences: ${Deno.env.get('SITE_URL')}/profile?tab=settings
  `
}

// Placeholder functions for other templates
function generateNewsletterHTML(data: any): string {
  return `<h1>${data.title}</h1><div>${data.content}</div>`
}

function generateNewsletterText(data: any): string {
  return `${data.title}\n\n${data.content}`
}

function generateSubmissionUpdateHTML(data: any): string {
  return `<h1>Submission Update</h1><p>Your submission has been ${data.status}.</p>`
}

function generateSubmissionUpdateText(data: any): string {
  return `Submission Update\n\nYour submission has been ${data.status}.`
}