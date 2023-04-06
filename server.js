
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const home = require("./routes/home");

const stripe = require("stripe")(process.env.REACT_APP_STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/home", home);

app.get("/", (req, res) => {
    res.send('Welcome to our shop')
})



/*
let totalAmount
const calculateOrderAmount = (items) => {
    const initialValue = 0;
    totalAmount = items.reduce((previousValue, currentValue) => {
        return previousValue + (currentValue.price * currentValue.count)
    }, initialValue);
    return totalAmount * 100;
};
*/

const array = [];
const calculateOrderAmount = (items) => {
    items.map((item) => {
        const { price, count } = item;
        const cartItemAmount = price * count;
        return array.push(cartItemAmount);
    });
    const totalAmount = array.reduce((a, b) => {
        return a + b;
    }, 0);

    return totalAmount * 100;
};


app.post("/create-payment-intent", async (req, res) => {
    const { items, customerEmail, shippingAddress, description } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "usd",
        automatic_payment_methods: {
            enabled: true,
        },
        shipping: {
            address: {
                /* lat: shippingAddress.lat,
                 long: shippingAddress.long,*/
                postal_code: shippingAddress.address,
                country: shippingAddress.country,
                state: shippingAddress.state,
                city: shippingAddress.city,
                line1: shippingAddress.line
            },
            phone: shippingAddress.phone,
            name: shippingAddress.name
        }
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

const PORT = process.env.PORT || 4242

app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));