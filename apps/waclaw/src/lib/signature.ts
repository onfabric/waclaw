export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  appSecret: string,
): boolean {
  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256' || !parts[1]) {
    return false;
  }

  const expectedHex = parts[1];

  const hasher = new Bun.CryptoHasher('sha256', appSecret);
  hasher.update(rawBody);
  const actualHex = hasher.digest('hex');

  if (actualHex.length !== expectedHex.length) {
    return false;
  }

  // Constant-time comparison
  let diff = 0;
  for (let i = 0; i < actualHex.length; i++) {
    diff |= actualHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return diff === 0;
}
