
const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

export async function requestReset(email: string) {
  const res = await fetch(`${API_URL}/request-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  console.log('Request Reset Response:', res);
  return res.json();
}

export async function verifyOtp(email: string, otp: string) {
  const res = await fetch(`${API_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  return res.json();
}

export async function resetPassword(email: string, password: string) {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  console.log('Reset Password Response:', res);
  return res.json();
}
