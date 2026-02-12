// ── Mailchimp CRM Integration ──
// Adds/tags subscribers in Mailchimp. Guest emails (guest-*) are skipped.

import mailchimp from '@mailchimp/mailchimp_marketing'
import crypto from 'crypto'

const API_KEY = process.env.MAILCHIMP_API_KEY
const LIST_ID = process.env.MAILCHIMP_LIST_ID
const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX

if (API_KEY && SERVER_PREFIX) {
  mailchimp.setConfig({ apiKey: API_KEY, server: SERVER_PREFIX })
}

function isConfigured(): boolean {
  return !!(API_KEY && LIST_ID && SERVER_PREFIX)
}

function subscriberHash(email: string): string {
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex')
}

function isGuestEmail(email: string): boolean {
  return email.startsWith('guest-')
}

export async function addSubscriber(email: string, tags: string[]) {
  if (!isConfigured() || isGuestEmail(email)) return

  try {
    await mailchimp.lists.setListMember(LIST_ID!, subscriberHash(email), {
      email_address: email,
      status_if_new: 'subscribed' as const,
    })

    if (tags.length > 0) {
      await mailchimp.lists.updateListMemberTags(LIST_ID!, subscriberHash(email), {
        tags: tags.map((name) => ({ name, status: 'active' as const })),
      })
    }
  } catch (err) {
    console.error('Mailchimp addSubscriber error:', err)
  }
}

export async function tagSubscriber(email: string, tags: string[]) {
  if (!isConfigured() || isGuestEmail(email) || tags.length === 0) return

  try {
    await mailchimp.lists.updateListMemberTags(LIST_ID!, subscriberHash(email), {
      tags: tags.map((name) => ({ name, status: 'active' as const })),
    })
  } catch (err) {
    console.error('Mailchimp tagSubscriber error:', err)
  }
}
