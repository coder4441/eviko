const http = require('http');

const loginBody = JSON.stringify({ username: '+998500023778', password: 'kamol1014' });

const req = http.request({
  hostname: 'localhost', port: 3005,
  path: '/api/auth/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': loginBody.length }
}, (res) => {
  let data = '';
  const cookies = res.headers['set-cookie'] || [];
  res.on('data', c => data += c);
  res.on('end', async () => {
    const resp = JSON.parse(data);
    console.log('=== LOGIN ===');
    console.log('Status:', res.statusCode);
    console.log('isSuperAdmin:', resp.isSuperAdmin);
    console.log('User:', resp.user?.name, '|', resp.user?.role);
    
    const sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
    
    // Test tenants
    const req2 = http.request({
      hostname: 'localhost', port: 3005,
      path: '/api/super-admin/tenants', method: 'GET',
      headers: { 'Cookie': sessionCookie }
    }, (res2) => {
      let d = '';
      res2.on('data', c => d += c);
      res2.on('end', () => {
        const r = JSON.parse(d);
        console.log('\n=== TASHKILOTLAR ===');
        console.log('Jami:', r.tenants?.length);
        r.tenants?.forEach(t => console.log(' -', t.shopName, '|', t.status));
        
        // Test users
        const req3 = http.request({
          hostname: 'localhost', port: 3005,
          path: '/api/super-admin/users', method: 'GET',
          headers: { 'Cookie': sessionCookie }
        }, (res3) => {
          let d3 = '';
          res3.on('data', c => d3 += c);
          res3.on('end', () => {
            const r3 = JSON.parse(d3);
            console.log('\n=== FOYDALANUVCHILAR ===');
            console.log('Jami:', r3.users?.length);
            r3.users?.forEach(u => console.log(' -', u.name, '|', u.role, '|', u.phone));
          });
        });
        req3.end();
      });
    });
    req2.end();
  });
});
req.write(loginBody);
req.end();
