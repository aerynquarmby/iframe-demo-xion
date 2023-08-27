const popup = document.getElementById('popup');
const iframe = document.getElementById('checkout-iframe');
let referenceId = 1500; // Starting reference ID

document.getElementById('top-up-button').addEventListener('click', async function() {
    const zarAmount = parseFloat(document.getElementById('amount-input').value);
    console.log(`Top up amount in ZAR: ${zarAmount}`);
    document.getElementById('close-button').addEventListener('click', function() {
        popup.classList.add('hidden');
    });

    popup.classList.remove('hidden');

    const dropdown = document.getElementById('product-dropdown');
    const productName = dropdown.options[dropdown.selectedIndex].text;

    try {
        // Fetch currency exchange rate
        const exchangeRateResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const exchangeRateData = exchangeRateResponse.data;
        const usdRate = exchangeRateData.rates.ZAR;

        const usdAmount = zarAmount / usdRate;
        console.log(`Top up amount in USD: ${usdAmount}`);

        const response = await axios.post(
            'https://devp-api.xion.app/api/v2/iframe/create-product',
            [
                {
                    reference_id: referenceId.toString(),
                    product_name: productName,
                    product_price: usdAmount,
                },
            ],
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization:
                        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMHhlQWQzZjNhNzJFMTdiZTEwODQzMzBEOWI3ODBjRTNCZDE1MjhkQUVmIiwiY2xpZW50X2lkIjoiMm9hN2JrbWplMmxlaHNlYzRzYnMxbWZrcTAiLCJjbGllbnRfc2VjcmV0IjoiMWxncG9wYWRkM2J0aGt1NHMwdXJxY2pjcWR1Yjd1Yjk4MW5iYWNtdTh2MG5tMHNpaWwwOCIsImV4cCI6MTY5NTc1ODQ2MywiaWF0IjoxNjkzMTY2NDYzLCJpc3MiOiJYaW9uIEdsb2JhbCBTZXJ2aWNlIEFQSSJ9.cr0YlReYuug5r-_HLz10jCU7ry8okPeCSXSFHIk9xGo',
                },
            }
        );

        const data = response.data;
        console.log('Product creation response:', data);

        const productToken = data[0].product_code;
        console.log(`Product token: ${productToken}`);
        iframe.src = `https://devp-checkout.xion.app/?token=${productToken}`;
        console.log(`Checkout URL: ${iframe.src}`);

        referenceId++; // Increment reference ID

        window.addEventListener(
            'message',
            async function(event) {
                if (event.data && event.data.orderCode) {
                    popup.classList.add('hidden');
                    const message = document.getElementById('message');
                    message.textContent = 'Purchase Successful';
                    console.log('Purchase successful');

                    let orderCode = event.data.orderCode;
                    let orderStatus = 'pending';

                    while (orderStatus !== 'successful') {
                        const statusResponse = await axios.get(
                            `https://devp-api.xion.app/api/v2/order/status/${orderCode}`,
                            {
                                headers: {
                                    Authorization:
                                        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMHhFMTMxNzJhODI5RjBiQTYyMDIwQ0M4MDJlOGQ2OGFkNDM5NjNGOTgzIiwiY2xpZW50X2lkIjoiM24zcG03NjluZzhlZHA5OGNwdWdxYmQ4MmIiLCJjbGllbnRfc2VjcmV0IjoiMWU0c2dydGU4bGxxbGo0bmVjbWtzb292a2wzdjRmM2J2cXY3Y3A1bWQ5OW5pN2U3MGFtMSIsImV4cCI6MTY4NzQ1ODQ5MiwiaWF0IjoxNjg0ODY2NDkyLCJpc3MiOiJYaW9uIEdsb2JhbCBTZXJ2aWNlIEFQSSJ9.0cvfNKXFmK-OxmQiAMotrAFy0-zh8gio2AaNFXThzb8',
                                },
                            }
                        );

                        const statusData = statusResponse.data;
                        console.log('Order status response:', statusData);

                        orderStatus = statusData.status;
                        console.log(`Order status: ${orderStatus}`);

                        if (orderStatus !== 'successful') {
                            // Add some delay to prevent overloading the API
                            await new Promise(resolve => setTimeout(resolve, 5000));
                        }
                    }
                }
            },
            false
        );
    } catch (error) {
        console.error('Error:', error);
    }
});

// Display exchange rate as user enters ZAR amount
document.getElementById('amount-input').addEventListener('input', async function() {
    const zarAmount = parseFloat(this.value);
    if (!isNaN(zarAmount)) {
        const exchangeRateResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const exchangeRateData = exchangeRateResponse.data;
        const usdRate = exchangeRateData.rates.ZAR;

        const usdAmount = zarAmount / usdRate;
        const exchangeRateText = `R${zarAmount.toFixed(2)} = $${usdAmount.toFixed(2)}`;
        document.getElementById('exchange-rate').textContent = exchangeRateText;
    } else {
        document.getElementById('exchange-rate').textContent = '';
    }
});
