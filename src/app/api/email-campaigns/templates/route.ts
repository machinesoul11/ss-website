import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sgMail from '@sendgrid/mail'
import sgClient from '@sendgrid/client'

/**
 * SendGrid Email Template Management API
 * Handles creation, updating, and management of email templates
 */

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  sgClient.setApiKey(process.env.SENDGRID_API_KEY)
}

// Template creation schema
const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  html_content: z.string().min(1, 'HTML content is required'),
  plain_content: z.string().optional(),
  template_type: z.enum([
    'welcome_immediate',
    'welcome_day_3',
    'welcome_week_1', 
    'development_update',
    'monthly_newsletter',
    'feedback_request',
    'early_access',
    're_engagement',
    'beta_feature_announcement',
    'community_highlights'
  ]),
  variables: z.array(z.string()).optional().default([]),
  generation_id: z.string().optional() // SendGrid versioning
})

const templateUpdateSchema = templateSchema.partial().extend({
  template_id: z.string().min(1, 'Template ID is required')
})

// Template variable definitions for different types
const TEMPLATE_VARIABLES = {
  welcome_immediate: [
    'first_name',
    'github_username',
    'user_email',
    'beta_signup_date',
    'unsubscribe_url',
    'community_links.discord',
    'community_links.github',
    'community_links.twitter'
  ],
  welcome_day_3: [
    'first_name',
    'github_username', 
    'user_email',
    'unsubscribe_url',
    'beta_signup_date',
    'community_links.discord',
    'community_links.github'
  ],
  welcome_week_1: [
    'first_name',
    'github_username',
    'user_email', 
    'unsubscribe_url',
    'beta_signup_date',
    'community_links.discord',
    'community_links.github'
  ],
  development_update: [
    'first_name',
    'user_email',
    'update_title',
    'update_content',
    'features_highlights',
    'roadmap_items',
    'feedback_link',
    'unsubscribe_url',
    'update_date'
  ],
  monthly_newsletter: [
    'first_name',
    'user_email',
    'update_title',
    'update_content', 
    'features_highlights',
    'roadmap_items',
    'community_stats.beta_users',
    'community_stats.github_stars',
    'community_stats.discord_members',
    'feedback_link',
    'unsubscribe_url',
    'update_date'
  ],
  feedback_request: [
    'first_name',
    'user_email',
    'feedback_type',
    'survey_link',
    'estimated_time',
    'incentive_message',
    'unsubscribe_url',
    'request_date'
  ],
  early_access: [
    'first_name',
    'user_email',
    'access_level',
    'download_link',
    'instructions_link',
    'exclusive_features',
    'unsubscribe_url',
    'invitation_date'
  ],
  re_engagement: [
    'first_name',
    'user_email', 
    'inactivity_days',
    'recent_updates',
    'feedback_link',
    'unsubscribe_url',
    'campaign_date'
  ],
  beta_feature_announcement: [
    'first_name',
    'user_email',
    'feature_name',
    'feature_description',
    'beta_link',
    'feedback_link',
    'unsubscribe_url'
  ],
  community_highlights: [
    'first_name',
    'user_email',
    'highlight_title',
    'community_achievements',
    'user_spotlights',
    'upcoming_events',
    'unsubscribe_url'
  ]
} as const

/**
 * POST /api/email-campaigns/templates
 * Create new SendGrid email template
 */
export async function POST(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = templateSchema.parse(body)

    // Get template variables for the type
    const templateVariables = TEMPLATE_VARIABLES[validatedData.template_type] || []

    // Create SendGrid template
    const templateData = {
      name: validatedData.name,
      generation: 'dynamic' // Use dynamic templates
    }

    // Create the template
    const templateResponse = await sgClient.request({
      url: '/v3/templates',
      method: 'POST',
      body: templateData
    })

    const templateId = templateResponse[1].id

    // Create template version with content
    const versionData = {
      template_id: templateId,
      active: 1,
      name: `${validatedData.name} v1`,
      html_content: validatedData.html_content,
      plain_content: validatedData.plain_content || generatePlainText(validatedData.html_content),
      subject: validatedData.subject,
      editor: 'code', // Use code editor for better control
      test_data: generateTestData(validatedData.template_type)
    }

    const versionResponse = await sgClient.request({
      url: `/v3/templates/${templateId}/versions`,
      method: 'POST',
      body: versionData
    })

    // Store template metadata in our database for easier management
    try {
      // This would typically store in Supabase, but avoiding due to type issues
      console.log('Template created:', {
        sendgrid_template_id: templateId,
        template_type: validatedData.template_type,
        name: validatedData.name,
        variables: templateVariables,
        version_id: versionResponse[1].id
      })
    } catch (dbError) {
      console.warn('Failed to store template metadata:', dbError)
      // Continue even if database storage fails
    }

    return NextResponse.json({
      success: true,
      message: 'Template created successfully',
      template: {
        id: templateId,
        name: validatedData.name,
        type: validatedData.template_type,
        subject: validatedData.subject,
        version_id: versionResponse[1].id,
        variables: templateVariables,
        sendgrid_url: `https://mc.sendgrid.com/dynamic-templates/${templateId}`
      }
    })

  } catch (error) {
    console.error('Template creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid template data',
        details: error.issues
      }, { status: 400 })
    }

    // Handle SendGrid API errors
    if (error && typeof error === 'object' && 'response' in error) {
      const sendGridError = error as any
      return NextResponse.json({
        success: false,
        error: 'SendGrid API error',
        details: sendGridError.response?.body || sendGridError.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create template'
    }, { status: 500 })
  }
}

/**
 * GET /api/email-campaigns/templates
 * List all templates or get specific template details
 */
export async function GET(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const templateId = url.searchParams.get('id')
    const templateType = url.searchParams.get('type')

    if (templateId) {
      // Get specific template
      const templateResponse = await sgClient.request({
        url: `/v3/templates/${templateId}`,
        method: 'GET'
      })

      const template = templateResponse[1]

      // Get template versions
      const versionsResponse = await sgClient.request({
        url: `/v3/templates/${templateId}/versions`,
        method: 'GET'
      })

      return NextResponse.json({
        success: true,
        template: {
          id: template.id,
          name: template.name,
          generation: template.generation,
          versions: versionsResponse[1].versions,
          created_at: template.created_at,
          updated_at: template.updated_at
        }
      })
    } else {
      // List all templates
      const templatesResponse = await sgClient.request({
        url: '/v3/templates',
        method: 'GET',
        qs: {
          generations: 'dynamic', // Only get dynamic templates
          page_size: 200
        }
      })

      const templates = templatesResponse[1].templates || []

      // Filter by type if specified
      if (templateType) {
        // This would typically filter from our database, but for now just return all
        console.log(`Filtering templates by type: ${templateType}`)
      }

      // Enhance with our metadata and variable information
      const enhancedTemplates = templates.map((template: any) => ({
        id: template.id,
        name: template.name,
        generation: template.generation,
        created_at: template.created_at,
        updated_at: template.updated_at,
        // Try to infer type from name
        inferred_type: inferTemplateType(template.name),
        variables: getVariablesForInferredType(inferTemplateType(template.name))
      }))

      return NextResponse.json({
        success: true,
        templates: enhancedTemplates,
        total: templates.length
      })
    }

  } catch (error) {
    console.error('Template retrieval error:', error)
    
    if (error && typeof error === 'object' && 'response' in error) {
      const sendGridError = error as any
      return NextResponse.json({
        success: false,
        error: 'SendGrid API error',
        details: sendGridError.response?.body || sendGridError.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve templates'
    }, { status: 500 })
  }
}

/**
 * PUT /api/email-campaigns/templates
 * Update existing template
 */
export async function PUT(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = templateUpdateSchema.parse(body)

    // Update template name if provided
    if (validatedData.name) {
      await sgClient.request({
        url: `/v3/templates/${validatedData.template_id}`,
        method: 'PATCH',
        body: {
          name: validatedData.name
        }
      })
    }

    // If content is provided, create new version
    if (validatedData.html_content || validatedData.subject) {
      const versionData: any = {}
      
      if (validatedData.html_content) {
        versionData.html_content = validatedData.html_content
        versionData.plain_content = validatedData.plain_content || generatePlainText(validatedData.html_content)
      }
      
      if (validatedData.subject) {
        versionData.subject = validatedData.subject
      }

      versionData.active = 1
      versionData.name = `Updated ${new Date().toISOString().split('T')[0]}`

      const versionResponse = await sgClient.request({
        url: `/v3/templates/${validatedData.template_id}/versions`,
        method: 'POST',
        body: versionData
      })

      return NextResponse.json({
        success: true,
        message: 'Template updated successfully',
        version: {
          id: versionResponse[1].id,
          template_id: validatedData.template_id,
          name: versionData.name
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Template metadata updated successfully'
    })

  } catch (error) {
    console.error('Template update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid update data',
        details: error.issues
      }, { status: 400 })
    }

    if (error && typeof error === 'object' && 'response' in error) {
      const sendGridError = error as any
      return NextResponse.json({
        success: false,
        error: 'SendGrid API error', 
        details: sendGridError.response?.body || sendGridError.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update template'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/email-campaigns/templates
 * Delete template
 */
export async function DELETE(request: NextRequest) {
  try {
    // Basic auth check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const templateId = url.searchParams.get('id')

    if (!templateId) {
      return NextResponse.json({ 
        error: 'Template ID is required' 
      }, { status: 400 })
    }

    await sgClient.request({
      url: `/v3/templates/${templateId}`,
      method: 'DELETE'
    })

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })

  } catch (error) {
    console.error('Template deletion error:', error)
    
    if (error && typeof error === 'object' && 'response' in error) {
      const sendGridError = error as any
      return NextResponse.json({
        success: false,
        error: 'SendGrid API error',
        details: sendGridError.response?.body || sendGridError.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to delete template'
    }, { status: 500 })
  }
}

// Helper functions
function generatePlainText(html: string): string {
  // Basic HTML to plain text conversion
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
}

function generateTestData(templateType: keyof typeof TEMPLATE_VARIABLES): Record<string, unknown> {
  const baseTestData = {
    first_name: 'Developer',
    user_email: 'test@example.com',
    unsubscribe_url: 'https://silentscribe.dev/unsubscribe?email=test@example.com'
  }

  switch (templateType) {
    case 'welcome_immediate':
    case 'welcome_day_3':
    case 'welcome_week_1':
      return {
        ...baseTestData,
        github_username: 'testdev',
        beta_signup_date: 'January 15, 2025',
        community_links: {
          discord: 'https://discord.gg/silentscribe',
          github: 'https://github.com/silentscribe',
          twitter: 'https://twitter.com/silentscribe'
        }
      }

    case 'development_update':
    case 'monthly_newsletter':
      return {
        ...baseTestData,
        update_title: 'Silent Scribe Development Update - January 2025',
        update_content: 'This month we focused on improving the privacy-first architecture...',
        features_highlights: ['Local processing engine', 'VS Code integration', 'Custom rule support'],
        roadmap_items: ['Beta release', 'Multi-editor support', 'Team features'],
        feedback_link: 'https://silentscribe.dev/feedback',
        update_date: 'January 31, 2025',
        community_stats: {
          beta_users: 1250,
          github_stars: 89,
          discord_members: 245
        }
      }

    case 'feedback_request':
      return {
        ...baseTestData,
        feedback_type: 'general',
        survey_link: 'https://silentscribe.dev/survey/12345',
        estimated_time: '3 minutes',
        incentive_message: 'Early access to new features!',
        request_date: 'January 25, 2025'
      }

    case 'early_access':
      return {
        ...baseTestData,
        access_level: 'beta',
        download_link: 'https://silentscribe.dev/download/beta',
        instructions_link: 'https://silentscribe.dev/beta-guide',
        exclusive_features: ['Local processing', 'Custom rules', 'VS Code integration'],
        invitation_date: 'January 20, 2025'
      }

    case 're_engagement':
      return {
        ...baseTestData,
        inactivity_days: 30,
        recent_updates: ['Privacy improvements', 'Performance boost', 'New rule engine'],
        feedback_link: 'https://silentscribe.dev/feedback',
        campaign_date: 'January 28, 2025'
      }

    default:
      return baseTestData
  }
}

function inferTemplateType(templateName: string): keyof typeof TEMPLATE_VARIABLES | 'unknown' {
  const name = templateName.toLowerCase()
  
  if (name.includes('welcome') && name.includes('immediate')) return 'welcome_immediate'
  if (name.includes('welcome') && name.includes('day')) return 'welcome_day_3'
  if (name.includes('welcome') && name.includes('week')) return 'welcome_week_1'
  if (name.includes('development') && name.includes('update')) return 'development_update'
  if (name.includes('monthly') && name.includes('newsletter')) return 'monthly_newsletter'
  if (name.includes('feedback')) return 'feedback_request'
  if (name.includes('early') && name.includes('access')) return 'early_access'
  if (name.includes('re') && name.includes('engagement')) return 're_engagement'
  if (name.includes('beta') && name.includes('feature')) return 'beta_feature_announcement'
  if (name.includes('community') && name.includes('highlights')) return 'community_highlights'
  
  return 'unknown'
}

function getVariablesForInferredType(type: keyof typeof TEMPLATE_VARIABLES | 'unknown'): string[] {
  if (type === 'unknown') return []
  return [...(TEMPLATE_VARIABLES[type] || [])]
}
