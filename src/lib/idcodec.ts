// Mengubah id integer berurutan (PK backend) menjadi kode opaque untuk URL,
// dan sebaliknya. Memakai perkalian modular bijektif (mod 2^32) sehingga
// id yang berdekatan menghasilkan kode yang tampak acak.
//
// PENTING: ini hanya KOSMETIK / anti-enumerasi, BUKAN keamanan — kode bisa
// dibalik di sisi klien. Otorisasi sebenarnya tetap di server (request ke
// project milik user lain dibalas 404).
//
// Catatan: memakai konstruktor BigInt() (bukan literal `1n`) agar tidak
// bergantung pada tsconfig "target" >= ES2020.

const MOD = BigInt(2 ** 32); // 2^32
const MULT = BigInt(2654435761); // konstanta multiplikatif Knuth (ganjil, coprime 2^32)
const ZERO = BigInt(0);
const B36 = BigInt(36);

function modInverse(a: bigint, m: bigint): bigint {
  let oldR = a % m;
  let r = m;
  let oldS = BigInt(1);
  let s = ZERO;
  while (r !== ZERO) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return ((oldS % m) + m) % m;
}

const INV = modInverse(MULT, MOD);

export function encodeId(id: number): string {
  if (!Number.isInteger(id) || id < 0) return "";
  return ((BigInt(id) * MULT) % MOD).toString(36);
}

export function decodeId(code: string): number | null {
  if (!code || !/^[0-9a-z]+$/i.test(code)) return null;
  let v = ZERO;
  for (const ch of code.toLowerCase()) {
    v = v * B36 + BigInt(parseInt(ch, 36));
  }
  if (v >= MOD) return null;
  const id = Number((v * INV) % MOD);
  return Number.isSafeInteger(id) ? id : null;
}
