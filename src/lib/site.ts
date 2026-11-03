// Site-wide switches.

/**
 * The journal is hidden until Eliana's real entries replace the samples.
 * Set to true to bring back the My Journal page, its nav and footer links,
 * and the "From my journal" section on the homepage.
 */
export const SHOW_JOURNAL = true;

/** Absolute URL of the default link-preview image (1200 x 630). */
export const SHARE_IMAGE = '/og-image.jpg';

/**
 * Google Analytics 4 measurement ID (looks like G-XXXXXXXXXX). Leave empty to
 * load no analytics at all; paste the ID from GA4 > Admin > Data streams to turn it on.
 */
export const GA_MEASUREMENT_ID = '';

/**
 * Web3Forms access key for the Let's Talk form, so messages are emailed straight to
 * Eliana. Leave empty to keep collecting them in Netlify Forms; paste the key that
 * web3forms.com emails her to switch over. The key is public by design.
 */
export const WEB3FORMS_ACCESS_KEY = '';
