import { verifyMessage } from 'ethers';
import { randomBytes } from 'crypto';

const NONCE_TTL = 5 * 60 * 1000;

const nonceStore = new Map<string, { address: string; expiresAt: number }>();

function pruneExpired() {
  const now = Date.now();
  for (const [key, data] of nonceStore.entries()) {
    if (data.expiresAt < now) nonceStore.delete(key);
  }
}

export function generateNonce(address: string): string {
  pruneExpired();
  const nonce = randomBytes(16).toString('hex');
  nonceStore.set(nonce, {
    address: address.toLowerCase(),
    expiresAt: Date.now() + NONCE_TTL,
  });
  return nonce;
}

export function consumeNonce(nonce: string, address: string): boolean {
  const stored = nonceStore.get(nonce);
  if (!stored) return false;
  if (stored.address !== address.toLowerCase()) return false;
  if (stored.expiresAt < Date.now()) {
    nonceStore.delete(nonce);
    return false;
  }
  nonceStore.delete(nonce);
  return true;
}

export function createSiweMessage(params: {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
}): string {
  const { domain, address, statement, uri, chainId, nonce, issuedAt } = params;
  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    '',
    statement,
    '',
    `URI: ${uri}`,
    'Version: 1',
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join('\n');
}

interface ParsedSiwe {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
}

export function parseSiweMessage(message: string): ParsedSiwe {
  const lines = message.split('\n');
  const domain = lines[0].replace(' wants you to sign in with your Ethereum account:', '');
  const address = lines[1];

  const getValue = (prefix: string): string => {
    const line = lines.find((l) => l.startsWith(prefix));
    return line ? line.slice(prefix.length).trim() : '';
  };

  const uriIdx = lines.findIndex((l) => l.startsWith('URI:'));
  const statement = lines.slice(3, uriIdx).join('\n').trim();

  return {
    domain,
    address,
    statement,
    uri: getValue('URI: '),
    version: getValue('Version: '),
    chainId: parseInt(getValue('Chain ID: '), 10),
    nonce: getValue('Nonce: '),
    issuedAt: getValue('Issued At: '),
  };
}

export function verifySiweSignature(message: string, signature: string): string {
  return verifyMessage(message, signature);
}

export function validateSiweMessage(
  parsed: ParsedSiwe,
  expectedDomain: string,
  expectedAddress: string
): { valid: boolean; error?: string } {
  if (parsed.domain !== expectedDomain) {
    return { valid: false, error: 'Domain mismatch' };
  }
  if (parsed.address.toLowerCase() !== expectedAddress.toLowerCase()) {
    return { valid: false, error: 'Address mismatch' };
  }
  if (parsed.version !== '1') {
    return { valid: false, error: 'Invalid SIWE version' };
  }

  const issuedAt = new Date(parsed.issuedAt).getTime();
  const now = Date.now();

  if (now - issuedAt > NONCE_TTL) {
    return { valid: false, error: 'Message expired' };
  }
  if (issuedAt > now + 30_000) {
    return { valid: false, error: 'Message issued in the future' };
  }

  return { valid: true };
}
