// Netlify runs this after every verified (non-spam) form submission.
// A new journal comment rebuilds the site so it appears under its entry
// (see src/lib/comments.ts). COMMENTS_BUILD_HOOK is a Netlify build hook URL,
// set as an environment variable in Netlify, never committed.
export const handler = async (event) => {
  try {
    const { payload } = JSON.parse(event.body || '{}');
    const hook = process.env.COMMENTS_BUILD_HOOK;
    if (payload?.form_name === 'journal-comments' && hook) {
      const res = await fetch(hook, { method: 'POST' });
      console.log(`Journal comment received: rebuild requested (${res.status}).`);
    }
  } catch (err) {
    console.error('submission-created:', err);
  }
  return { statusCode: 200 };
};
