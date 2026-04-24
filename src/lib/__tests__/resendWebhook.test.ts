/**
 * @jest-environment node
 */
import { createHmac } from 'node:crypto';
import { verifyResendSignature } from '../resendWebhook';

const secret = 'whsec_' + Buffer.from('super-secret-key').toString('base64');
const secretRaw = 'super-secret-key';

function sign(body: string, id: string, ts: string): string {
  const signed = `${id}.${ts}.${body}`;
  return createHmac('sha256', Buffer.from(secretRaw, 'utf8'))
    .update(signed)
    .digest('base64');
}

describe('verifyResendSignature', () => {
  const body = '{"type":"email.bounced"}';
  const id = 'msg_1';

  it('verifies a valid signature', () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const sig = `v1,${sign(body, id, ts)}`;
    expect(
      verifyResendSignature({
        body,
        svixId: id,
        svixTimestamp: ts,
        svixSignature: sig,
        secret,
      }),
    ).toBe(true);
  });

  it('accepts non-prefixed secret (utf8 bytes)', () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const expected = createHmac('sha256', Buffer.from('plain-secret', 'utf8'))
      .update(`${id}.${ts}.${body}`)
      .digest('base64');
    expect(
      verifyResendSignature({
        body,
        svixId: id,
        svixTimestamp: ts,
        svixSignature: `v1,${expected}`,
        secret: 'plain-secret',
      }),
    ).toBe(true);
  });

  it('rejects tampered body', () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const sig = `v1,${sign(body, id, ts)}`;
    expect(
      verifyResendSignature({
        body: '{"type":"email.delivered"}',
        svixId: id,
        svixTimestamp: ts,
        svixSignature: sig,
        secret,
      }),
    ).toBe(false);
  });

  it('rejects missing headers', () => {
    expect(
      verifyResendSignature({
        body,
        svixId: null,
        svixTimestamp: '123',
        svixSignature: 'v1,aaa',
        secret,
      }),
    ).toBe(false);
  });

  it('rejects timestamp skew over 5 minutes', () => {
    const old = String(Math.floor(Date.now() / 1000) - 600);
    const sig = `v1,${sign(body, id, old)}`;
    expect(
      verifyResendSignature({
        body,
        svixId: id,
        svixTimestamp: old,
        svixSignature: sig,
        secret,
      }),
    ).toBe(false);
  });

  it('accepts signature from multi-signature header', () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const goodSig = sign(body, id, ts);
    const header = `v1,WRONGWRONGWRONG v1,${goodSig}`;
    expect(
      verifyResendSignature({
        body,
        svixId: id,
        svixTimestamp: ts,
        svixSignature: header,
        secret,
      }),
    ).toBe(true);
  });

  it('rejects invalid timestamp', () => {
    expect(
      verifyResendSignature({
        body,
        svixId: id,
        svixTimestamp: 'not-a-number',
        svixSignature: 'v1,aaa',
        secret,
      }),
    ).toBe(false);
  });
});
