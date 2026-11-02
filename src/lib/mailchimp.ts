// Newsletter signups ("Join my Garden") go to Eliana's Mailchimp audience.
//
// To connect: in Mailchimp, Audience > Signup forms > Embedded forms, copy the
// form's action URL (it looks like
// https://XXXX.usNN.list-manage.com/subscribe/post?u=...&id=...&f_id=...)
// and paste it below. Until then the forms keep saving to Netlify Forms.
const MAILCHIMP_FORM_ACTION = '';

export interface MailchimpForm {
  action: string;
  /** Name of Mailchimp's bot-trap field, which must be sent empty. */
  honeypot: string;
}

function parse(raw: string): MailchimpForm | null {
  if (!raw.trim()) return null;
  const url = new URL(raw.trim().replace(/&amp;/g, '&'));
  const u = url.searchParams.get('u');
  const id = url.searchParams.get('id');
  // Fail the build rather than ship a form that silently drops signups.
  if (!url.hostname.endsWith('.list-manage.com') || !url.pathname.startsWith('/subscribe/post') || !u || !id) {
    throw new Error(`MAILCHIMP_FORM_ACTION doesn't look like a Mailchimp embedded form URL: ${raw}`);
  }
  return { action: url.toString(), honeypot: `b_${u}_${id}` };
}

export const mailchimp = parse(MAILCHIMP_FORM_ACTION);
