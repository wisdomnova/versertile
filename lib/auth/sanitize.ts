const HTML_TAG_RE = /<\/?[^>]+(>|$)/g;
const SCRIPT_RE =
  /(<script[\s\S]*?>[\s\S]*?<\/script>|javascript\s*:|on\w+\s*=)/gi;
const NULL_BYTE_RE = /\0/g;
const CONTROL_CHARS_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

const ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

function encodeEntities(str: string): string {
  return str.replace(/[&<>"']/g, (char) => ENTITY_MAP[char] || char);
}

export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  let clean = input;
  clean = clean.replace(NULL_BYTE_RE, '');
  clean = clean.replace(CONTROL_CHARS_RE, '');
  clean = clean.replace(SCRIPT_RE, '');
  clean = clean.replace(HTML_TAG_RE, '');
  clean = clean.normalize('NFC');
  clean = clean.trim();
  return clean;
}

export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return encodeEntities(sanitizeText(input));
}

export function sanitizePassword(input: string): string {
  if (typeof input !== 'string') return '';
  let clean = input;
  clean = clean.replace(NULL_BYTE_RE, '');
  clean = clean.replace(CONTROL_CHARS_RE, '');
  return clean;
}

export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') return '';
  const email = input.toLowerCase().trim();

  const emailRe =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;
  if (!emailRe.test(email)) {
    throw new Error('Invalid email format');
  }

  if (
    email.includes('\n') ||
    email.includes('\r') ||
    email.includes('%0a') ||
    email.includes('%0d')
  ) {
    throw new Error('Invalid email format');
  }

  return email;
}

export function sanitizeEthAddress(input: string): string {
  if (typeof input !== 'string') return '';
  const address = input.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    throw new Error('Invalid Ethereum address');
  }
  return address;
}
