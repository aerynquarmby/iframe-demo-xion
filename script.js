document.getElementById('top-up-button').addEventListener('click', async function() {
    const amount = parseFloat(document.getElementById('amount-input').value);
    console.log(`Top up amount: ${amount}`);

    const popup = document.getElementById('popup');
    popup.classList.remove('hidden');
    const iframe = document.getElementById('checkout-iframe');

    try {
        const response = await axios.post('https://devp-api.xion.app/api/v2/iframe/create-product', [{
            reference_id: "3",
            product_name: "top up",
            product_price: amount
        }], {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMHhFMTMxNzJhODI5RjBiQTYyMDIwQ0M4MDJlOGQ2OGFkNDM5NjNGOTgzIiwiY2xpZW50X2lkIjoiM24zcG03NjluZzhlZHA5OGNwdWdxYmQ4MmIiLCJjbGllbnRfc2VjcmV0IjoiMWU0c2dydGU4bGxxbGo0bmVjbWtzb292a2wzdjRmM2J2cXY3Y3A1bWQ5OW5pN2U3MGFtMSIsImV4cCI6MTY4NzQ1ODQ5MiwiaWF0IjoxNjg0ODY2NDkyLCJpc3MiOiJYaW9uIEdsb2JhbCBTZXJ2aWNlIEFQSSJ9.0cvfNKXFmK-OxmQiAMotrAFy0-zh8gio2AaNFXThzb8'
            }
        });

        const data = response.data;
        console.log('Product creation response:', data);

        const productToken = data[0].product_code;
        console.log(`Product token: ${productToken}`);
        iframe.src = `https://devp-checkout.xionpay.app/?token=${productToken}`;

        window.addEventListener("message", async function(event) {
            if (event.data && event.data.orderCode) {
                popup.classList.add('hidden');
                const message = document.getElementById('message');
                message.textContent = 'Purchase Successful';
                console.log('Purchase successful');

                let orderCode = event.data.orderCode;
                let orderStatus = 'pending';

                while (orderStatus !== 'successful') {
                    const statusResponse = await axios.get(`https://devp-api.xion.app/api/v2/order/status/${orderCode}`, {
                        headers: {
                            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMHhFMTMxNzJhODI5RjBiQTYyMDIwQ0M4MDJlOGQ2OGFkNDM5NjNGOTgzIiwiY2xpZW50X2lkIjoiM24zcG03NjluZzhlZHA5OGNwdWdxYmQ4MmIiLCJjbGllbnRfc2VjcmV0IjoiMWU0c2dydGU4bGxxbGo0bmVjbWtzb292a2wzdjRmM2J2cXY3Y3A1bWQ5OW5pN2U3MGFtMSIsImV4cCI6MTY4NzQ1ODQ5MiwiaWF0IjoxNjg0ODY2NDkyLCJpc3MiOiJYaW9uIEdsb2JhbCBTZXJ2aWNlIEFQSSJ9.0cvfNKXFmK-OxmQiAMotrAFy0-zh8gio2AaNFXThzb8'
                        }
                    });

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
        }, false);
        
    } catch (error) {
        console.error('Error:', error);
    }
});
