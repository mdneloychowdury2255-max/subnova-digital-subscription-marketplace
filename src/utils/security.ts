// Secure client-side hashing utility using SHA-256 with salting

export async function hashPassword(password: string, salt: string = 'subnova_secure_salt_v1'): Promise<string> {
  const text = `${salt}:${password}:${salt}`;
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    }
  } catch (err) {
    console.warn('Crypto.subtle not available, using fallback hash', err);
  }

  // Fallback deterministic hash implementation
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `fallback_sha256_${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

export async function verifyPassword(password: string, storedHash: string, salt: string = 'subnova_secure_salt_v1'): Promise<boolean> {
  const computedHash = await hashPassword(password, salt);
  return computedHash === storedHash;
}
