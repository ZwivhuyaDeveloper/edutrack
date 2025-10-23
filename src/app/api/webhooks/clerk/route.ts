import { NextRequest } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { secureLog, sanitizeForLog } from '@/lib/secure-logger'

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    secureLog.error('Error verifying webhook', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type
  secureLog.info('Webhook received', sanitizeForLog({ eventType }))

  // Handle organization events
  if (eventType === 'organization.created') {
    const { id, name, slug } = evt.data
    secureLog.info('Organization created', sanitizeForLog({ id, name, slug }))
    // School creation is handled by our /api/schools route to keep logic consistent.
    // We only log this event here.
  }

  if (eventType === 'organization.updated') {
    const { id, name } = evt.data
    secureLog.info('Organization updated', sanitizeForLog({ id, name }))

    try {
      await prisma.school.update({
        where: { clerkOrganizationId: id },
        data: { name }
      })
      secureLog.info('School updated in database by clerkOrganizationId', sanitizeForLog({ id }))
    } catch (error) {
      secureLog.error('Error updating school (by clerkOrganizationId)', error)
    }
  }

  if (eventType === 'organization.deleted') {
    const { id } = evt.data
    secureLog.info('Organization deleted', sanitizeForLog({ id }))

    try {
      await prisma.school.update({
        where: { clerkOrganizationId: id },
        data: { isActive: false }
      })
      secureLog.info('School deactivated in database by clerkOrganizationId', sanitizeForLog({ id }))
    } catch (error) {
      secureLog.error('Error deactivating school (by clerkOrganizationId)', error)
    }
  }

  // Handle organization membership events
  if (eventType === 'organizationMembership.created') {
    const { organization, public_user_data } = evt.data
    secureLog.info('Organization membership created', sanitizeForLog({
      orgId: organization.id,
      userId: public_user_data.user_id
    }))

    // User will be linked to school through the sign-up flow
    // This webhook just logs the membership for now
  }

  // Handle user events
  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data
    secureLog.info('User created in Clerk', sanitizeForLog({ id, email: email_addresses[0]?.email_address }))

    // Don't create user in database yet - wait for profile completion
    // The sign-up flow will create the user with role and school
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data
    secureLog.info('User updated in Clerk', sanitizeForLog({ id }))

    try {
      // Only update if user exists in database
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: id }
      })

      if (existingUser) {
        await prisma.user.update({
          where: { clerkId: id },
          data: {
            email: email_addresses[0]?.email_address || existingUser.email,
            firstName: first_name || existingUser.firstName,
            lastName: last_name || existingUser.lastName
          }
        })
        secureLog.info('User updated in database', sanitizeForLog({ id }))
      }
    } catch (error) {
      secureLog.error('Error updating user', error)
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data
    secureLog.info('User deleted in Clerk', sanitizeForLog({ id }))

    try {
      await prisma.user.update({
        where: { clerkId: id },
        data: { isActive: false }
      })
      secureLog.info('User deactivated in database', sanitizeForLog({ id }))
    } catch (error) {
      secureLog.error('Error deactivating user', error)
    }
  }

  return new Response('', { status: 200 })
}
