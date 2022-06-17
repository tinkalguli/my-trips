import React, { useEffect, useState } from "react"
import axios from "axios";

import PaytmChecksum from "./PaytmChecksum";

export default function PaytmButton () {

    const [paymentData, setPaymentData] = useState({
        token: "", 
        order: "", 
        mid: "",
        amount: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        let orderId = 'Order_'+new Date().getTime();

        // Sandbox Credentials
        let mid = "zEJcdm94949150303573"; // Merchant ID
        let mkey = "uEzt@IwG38EGLE2C"; // Merhcant Key
        var paytmParams = {};

        paytmParams.body = {
            "requestType"   : "Payment",
            "mid"           : mid,
            "websiteName"   : "WEBSTAGING",
            "orderId"       : orderId,
            "callbackUrl"   : "https://merchant.com/callback",
            "txnAmount"     : {
                "value"     : 100,
                "currency"  : "INR",
            },
            "userInfo"      : {
                "custId"    : '1001',
            }
        };

        const checksum = PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), mkey);

        console.log(checksum);
        paytmParams.head = {
            "signature"    : checksum
        };

        var post_data = JSON.stringify(paytmParams);

        var options = {
            /* for Staging */
            hostname: 'securegw-stage.paytm.in',

            /* for Production */
            // hostname: 'securegw.paytm.in',

            port: 443,
            path: `/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': post_data.length
            }
        };

        // var response = "";
        try {
          const response = await axios.post(
            `https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}`,
          );
          console.log(response, "response")
          setPaymentData({
            ...paymentData,
            token: response.data.body.txnToken, 
            order: orderId, 
            mid: mid,
            amount: 100
          })
        } catch (error) {
          console.log(error);
        }
        // const post_req = await axios.post();
        // var post_req = https.request(options, function(post_res) {
        //     post_res.on('data', function (chunk) {
        //         response += chunk;
        //     });
        //     post_res.on('end', function(){
        //         console.log('Response: ', response);
        //         // res.json({data: JSON.parse(response), orderId: orderId, mid: mid, amount: amount});
        //         setPaymentData({
        //             ...paymentData,
        //             token: JSON.parse(response).body.txnToken, 
        //             order: orderId, 
        //             mid: mid,
        //             amount: 100
        //         })
        //     });
        // });

        // post_req.write(post_data);
        // post_req.end();
    }

    const makePayment = () => {
        setLoading(true);
        var config = {
            "root":"",
            "style": {
              "bodyBackgroundColor": "#fafafb",
              "bodyColor": "",
              "themeBackgroundColor": "#0FB8C9",
              "themeColor": "#ffffff",
              "headerBackgroundColor": "#284055",
              "headerColor": "#ffffff",
              "errorColor": "",
              "successColor": "",
              "card": {
                "padding": "",
                "backgroundColor": ""
              }
            },
            "data": {
              "orderId": paymentData.order,
              "token": paymentData.token,
              "tokenType": "TXN_TOKEN",
              "amount": paymentData.amount /* update amount */
            },
            "payMode": {
              "labels": {},
              "filter": {
                "exclude": []
              },
              "order": [
                  "CC",
                  "DC",
                  "NB",
                  "UPI",
                  "PPBL",
                  "PPI",
                  "BALANCE"
              ]
            },
            "website": "WEBSTAGING",
            "flow": "DEFAULT",
            "merchant": {
              "mid": paymentData.mid,
              "redirect": false
            },
            "handler": {
              "transactionStatus":function transactionStatus(paymentStatus){
                console.log("paymentStatus => ",paymentStatus);
                setLoading(false);
              },
              "notifyMerchant":function notifyMerchant(eventName,data){
                console.log("Closed");
                setLoading(false);
              }
            }
        };
        console.log(window.Paytm)
        if (window.Paytm && window.Paytm.CheckoutJS) {
        // initialze configuration using init method
        window.Paytm.CheckoutJS.init(config).then(function onSuccess() {
            console.log('Before JS Checkout invoke');
            // after successfully update configuration invoke checkoutjs
            window.Paytm.CheckoutJS.invoke();
        }).catch(function onError(error) {
            console.log("Error => ", error);
        });
        }
        setLoading(false)
    }

    return (
        <div>
            {
                loading ? (
                    <img src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif" />
                ) : (
                    <button onClick={makePayment}>Pay Now</button>
                )
            }
        </div>
    )
}