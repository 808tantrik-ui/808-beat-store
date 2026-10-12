import dotenv from 'dotenv';
dotenv.config();

const token = process.env.INSTAGRAM_ACCESS_TOKEN;
const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

console.log('Testing Instagram Access Token...');
console.log('Account ID:', accountId);

try {
  const res = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${token}`);
  const data = await res.json();
  console.log('Meta API Response:', data);
} catch (e) {
  console.error('Error:', e.message);
}
