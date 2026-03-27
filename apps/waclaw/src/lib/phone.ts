import { t } from 'elysia';

/**
 * Elysia / TypeBox schema for E.164 phone numbers.
 * Requires a leading '+' followed by 1–15 digits (ITU-T E.164).
 */
export const E164PhoneSchema = t.String({
  pattern: '^\\+[1-9]\\d{1,14}$',
  description: 'E.164 phone number with leading + (e.g. +12025550123)',
});

export function normalizeToE164(phone: string): string {
  return phone.startsWith('+') ? phone : `+${phone}`;
}

export function toMetaFormat(phone: string): string {
  return phone.replace(/^\+/, '');
}
