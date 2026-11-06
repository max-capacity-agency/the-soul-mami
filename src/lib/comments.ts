// Journal comments ("Write back") are Netlify Forms submissions to the
// journal-comments form, read from the Netlify API once per build and shown
// under each entry. A new comment triggers a rebuild through
// netlify/functions/submission-created.mjs.
//
// Needs NETLIFY_COMMENTS_TOKEN (a Netlify personal access token, set as an
// environment variable in Netlify, never committed). SITE_ID is set by Netlify
// during builds. Without them, or if the API fails, the site builds with no
// comments and logs one warning.

export interface JournalComment {
  name: string;
  comment: string;
  date: Date;
}

interface NetlifyForm {
  id: string;
  name: string;
}

interface Submission {
  created_at: string;
  data?: { entry?: string; name?: string; comment?: string };
}

const API = 'https://api.netlify.com/api/v1';
// Same limits as the form fields, in case a submission skipped the form.
const MAX_NAME = 60;
const MAX_COMMENT = 2000;

let loading: Promise<Map<string, JournalComment[]>> | undefined;

async function load(): Promise<Map<string, JournalComment[]>> {
  const byEntry = new Map<string, JournalComment[]>();
  const token = process.env.NETLIFY_COMMENTS_TOKEN;
  const siteId = process.env.SITE_ID;
  if (!token || !siteId) {
    console.warn('[comments] NETLIFY_COMMENTS_TOKEN or SITE_ID is not set: building without journal comments.');
    return byEntry;
  }

  const get = async <T>(path: string): Promise<T> => {
    const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${path}`);
    return res.json() as Promise<T>;
  };

  try {
    const forms = await get<NetlifyForm[]>(`/sites/${siteId}/forms`);
    const form = forms.find((f) => f.name === 'journal-comments');
    if (!form) {
      console.warn('[comments] No journal-comments form on Netlify yet: building without journal comments.');
      return byEntry;
    }
    for (let page = 1; page <= 100; page++) {
      const submissions = await get<Submission[]>(`/forms/${form.id}/submissions?per_page=100&page=${page}`);
      if (submissions.length === 0) break;
      for (const s of submissions) {
        const entry = s.data?.entry?.trim();
        const name = s.data?.name?.trim().slice(0, MAX_NAME);
        const comment = s.data?.comment?.trim().slice(0, MAX_COMMENT);
        if (!entry || !name || !comment) continue;
        const list = byEntry.get(entry) ?? [];
        list.push({ name, comment, date: new Date(s.created_at) });
        byEntry.set(entry, list);
      }
    }
    for (const list of byEntry.values()) list.sort((a, b) => a.date.valueOf() - b.date.valueOf());
  } catch (err) {
    console.warn(`[comments] Could not load journal comments (${(err as Error).message}): building without them.`);
    byEntry.clear();
  }
  return byEntry;
}

/** Comments for one journal entry, oldest first. Fetched once per build. */
export async function commentsFor(entryId: string): Promise<JournalComment[]> {
  loading ??= load();
  return (await loading).get(entryId) ?? [];
}
