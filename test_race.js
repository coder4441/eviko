const http = require('http');

const payload = {
    tableId: 'cms800xri00089qa1bes90whm',
    items: [{ item: { id: 'some_id', price: 1000 }, qty: 1, shotId: 1 }],
    waiterName: 'test',
    replace: false,
    skipAutoPrint: true
};

async function test() {
    console.log('Sending POST...');
    const postRes = await fetch('http://localhost:3005/api/smart/orders-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    console.log('POST status:', postRes.status);
    
    console.log('Sending GET immediately...');
    const getRes = await fetch('http://localhost:3005/api/smart/orders-db?tableId=cms800xri00089qa1bes90whm&_t=' + Date.now(), {
        headers: { 'Cache-Control': 'no-store' }
    });
    const data = await getRes.json();
    console.log('GET items length:', data.items?.length);
    if (data.items?.length > 0) {
        console.log('First item qty:', data.items[0].qty);
    }
}
test();
