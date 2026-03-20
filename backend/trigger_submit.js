// using native fetch

async function testSubmit() {
  const res = await fetch('http://localhost:3000/api/assessment/submit-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'console.log(1)', language: 'javascript', problemTitle: 'Two Sum' })
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log(text.replace(/\\n/g, ' '));
}
testSubmit();
