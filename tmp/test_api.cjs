const http = require('http');

http.get('http://localhost:5000/api/products?random=true&limit=2', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Success:', json.success);
      console.log('Products Count:', json.data.length);
      if (json.data.length > 0) {
        console.log('Product 1:', json.data[0].name);
        if (json.data[1]) console.log('Product 2:', json.data[1].name);
      }
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      console.log('Raw data:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
