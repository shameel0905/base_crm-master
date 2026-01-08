Orders
The orders API allows you to create, view, update, and delete individual, or a batch, of orders.

Order properties
Attribute	Type	Description
id	integer	Unique identifier for the resource.read-only
parent_id	integer	Parent order ID.
number	string	Order number.read-only
order_key	string	Order key.read-only
created_via	string	Shows where the order was created. It can only be set during order creation and cannot be modified afterward.
version	string	Version of WooCommerce which last updated the order.read-only
status	string	Order status. Options: pending, processing, on-hold, completed, cancelled, refunded, failed and trash. Default is pending.
currency	string	Currency the order was created with, in ISO format. Options: AED, AFN, ALL, AMD, ANG, AOA, ARS, AUD, AWG, AZN, BAM, BBD, BDT, BGN, BHD, BIF, BMD, BND, BOB, BRL, BSD, BTC, BTN, BWP, BYR, BZD, CAD, CDF, CHF, CLP, CNY, COP, CRC, CUC, CUP, CVE, CZK, DJF, DKK, DOP, DZD, EGP, ERN, ETB, EUR, FJD, FKP, GBP, GEL, GGP, GHS, GIP, GMD, GNF, GTQ, GYD, HKD, HNL, HRK, HTG, HUF, IDR, ILS, IMP, INR, IQD, IRR, IRT, ISK, JEP, JMD, JOD, JPY, KES, KGS, KHR, KMF, KPW, KRW, KWD, KYD, KZT, LAK, LBP, LKR, LRD, LSL, LYD, MAD, MDL, MGA, MKD, MMK, MNT, MOP, MRO, MUR, MVR, MWK, MXN, MYR, MZN, NAD, NGN, NIO, NOK, NPR, NZD, OMR, PAB, PEN, PGK, PHP, PKR, PLN, PRB, PYG, QAR, RON, RSD, RUB, RWF, SAR, SBD, SCR, SDG, SEK, SGD, SHP, SLL, SOS, SRD, SSP, STD, SYP, SZL, THB, TJS, TMT, TND, TOP, TRY, TTD, TWD, TZS, UAH, UGX, USD, UYU, UZS, VEF, VND, VUV, WST, XAF, XCD, XOF, XPF, YER, ZAR and ZMW. Default is USD.
date_created	date-time	The date the order was created, in the site's timezone.read-only
date_created_gmt	date-time	The date the order was created, as GMT.read-only
date_modified	date-time	The date the order was last modified, in the site's timezone.read-only
date_modified_gmt	date-time	The date the order was last modified, as GMT.read-only
discount_total	string	Total discount amount for the order.read-only
discount_tax	string	Total discount tax amount for the order.read-only
shipping_total	string	Total shipping amount for the order.read-only
shipping_tax	string	Total shipping tax amount for the order.read-only
cart_tax	string	Sum of line item taxes only.read-only
total	string	Grand total.read-only
total_tax	string	Sum of all taxes.read-only
prices_include_tax	boolean	True the prices included tax during checkout.read-only
customer_id	integer	User ID who owns the order. 0 for guests. Default is 0.
customer_ip_address	string	Customer's IP address.read-only
customer_user_agent	string	User agent of the customer.read-only
customer_note	string	Note left by customer during checkout.
billing	object	Billing address. See Order - Billing properties
shipping	object	Shipping address. See Order - Shipping properties
payment_method	string	Payment method ID.
payment_method_title	string	Payment method title.
transaction_id	string	Unique transaction ID.
date_paid	date-time	The date the order was paid, in the site's timezone.read-only
date_paid_gmt	date-time	The date the order was paid, as GMT.read-only
date_completed	date-time	The date the order was completed, in the site's timezone.read-only
date_completed_gmt	date-time	The date the order was completed, as GMT.read-only
cart_hash	string	MD5 hash of cart items to ensure orders are not modified.read-only
meta_data	array	Meta data. See Order - Meta data properties
line_items	array	Line items data. See Order - Line items properties
tax_lines	array	Tax lines data. See Order - Tax lines propertiesread-only
shipping_lines	array	Shipping lines data. See Order - Shipping lines properties
fee_lines	array	Fee lines data. See Order - Fee lines properties
coupon_lines	array	Coupons line data. See Order - Coupon lines properties
refunds	array	List of refunds. See Order - Refunds propertiesread-only
set_paid	boolean	Define if the order is paid. It will set the status to processing and reduce stock items. Default is false.write-only
Order - Billing properties
Attribute	Type	Description
first_name	string	First name.
last_name	string	Last name.
company	string	Company name.
address_1	string	Address line 1
address_2	string	Address line 2
city	string	City name.
state	string	ISO code or name of the state, province or district.
postcode	string	Postal code.
country	string	Country code in ISO 3166-1 alpha-2 format.
email	string	Email address.
phone	string	Phone number.
Order - Shipping properties
Attribute	Type	Description
first_name	string	First name.
last_name	string	Last name.
company	string	Company name.
address_1	string	Address line 1
address_2	string	Address line 2
city	string	City name.
state	string	ISO code or name of the state, province or district.
postcode	string	Postal code.
country	string	Country code in ISO 3166-1 alpha-2 format.
Order - Meta data properties
Attribute	Type	Description
id	integer	Meta ID.read-only
key	string	Meta key.
value	string	Meta value.
Order - Line items properties
Attribute	Type	Description
id	integer	Item ID.read-only
name	string	Product name.
product_id	integer	Product ID.
variation_id	integer	Variation ID, if applicable.
quantity	integer	Quantity ordered.
tax_class	string	Slug of the tax class of product.
subtotal	string	Line subtotal (before discounts).
subtotal_tax	string	Line subtotal tax (before discounts).read-only
total	string	Line total (after discounts).
total_tax	string	Line total tax (after discounts).read-only
taxes	array	Line taxes. See Order - Tax lines propertiesread-only
meta_data	array	Meta data. See Order - Meta data properties
sku	string	Product SKU.read-only
price	string	Product price.read-only
Order - Tax lines properties
Attribute	Type	Description
id	integer	Item ID.read-only
rate_code	string	Tax rate code.read-only
rate_id	integer	Tax rate ID.read-only
label	string	Tax rate label.read-only
compound	boolean	Whether or not this is a compound tax rate.read-only
tax_total	string	Tax total (not including shipping taxes).read-only
shipping_tax_total	string	Shipping tax total.read-only
meta_data	array	Meta data. See Order - Meta data properties
Order - Shipping lines properties
Attribute	Type	Description
id	integer	Item ID.read-only
method_title	string	Shipping method name.
method_id	string	Shipping method ID.
total	string	Line total (after discounts).
total_tax	string	Line total tax (after discounts).read-only
taxes	array	Line taxes. See Order - Tax lines propertiesread-only
meta_data	array	Meta data. See Order - Meta data properties
Order - Fee lines properties
Attribute	Type	Description
id	integer	Item ID.read-only
name	string	Fee name.
tax_class	string	Tax class of fee.
tax_status	string	Tax status of fee. Options: taxable and none.
total	string	Line total (after discounts).
total_tax	string	Line total tax (after discounts).read-only
taxes	array	Line taxes. See Order - Tax lines propertiesread-only
meta_data	array	Meta data. See Order - Meta data properties
Order - Coupon lines properties
Attribute	Type	Description
id	integer	Item ID.read-only
code	string	Coupon code.
discount	string	Discount total.read-only
discount_tax	string	Discount total tax.read-only
meta_data	array	Meta data. See Order - Meta data properties
Order - Refunds properties
Attribute	Type	Description
id	integer	Refund ID.read-only
reason	string	Refund reason.read-only
total	string	Refund total.read-only
Create an order
This API helps you to create a new order.

HTTP request
POST /wp-json/wc/v3/orders
Example of create a paid order:

const data = {
  payment_method: "bacs",
  payment_method_title: "Direct Bank Transfer",
  set_paid: true,
  billing: {
    first_name: "John",
    last_name: "Doe",
    address_1: "969 Market",
    address_2: "",
    city: "San Francisco",
    state: "CA",
    postcode: "94103",
    country: "US",
    email: "john.doe@example.com",
    phone: "(555) 555-5555"
  },
  shipping: {
    first_name: "John",
    last_name: "Doe",
    address_1: "969 Market",
    address_2: "",
    city: "San Francisco",
    state: "CA",
    postcode: "94103",
    country: "US"
  },
  line_items: [
    {
      product_id: 93,
      quantity: 2
    },
    {
      product_id: 22,
      variation_id: 23,
      quantity: 1
    }
  ],
  shipping_lines: [
    {
      method_id: "flat_rate",
      method_title: "Flat Rate",
      total: "10.00"
    }
  ]
};

WooCommerce.post("orders", data)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

{
  "id": 727,
  "parent_id": 0,
  "number": "727",
  "order_key": "wc_order_58d2d042d1d",
  "created_via": "rest-api",
  "version": "3.0.0",
  "status": "processing",
  "currency": "USD",
  "date_created": "2017-03-22T16:28:02",
  "date_created_gmt": "2017-03-22T19:28:02",
  "date_modified": "2017-03-22T16:28:08",
  "date_modified_gmt": "2017-03-22T19:28:08",
  "discount_total": "0.00",
  "discount_tax": "0.00",
  "shipping_total": "10.00",
  "shipping_tax": "0.00",
  "cart_tax": "1.35",
  "total": "29.35",
  "total_tax": "1.35",
  "prices_include_tax": false,
  "customer_id": 0,
  "customer_ip_address": "",
  "customer_user_agent": "",
  "customer_note": "",
  "billing": {
    "first_name": "John",
    "last_name": "Doe",
    "company": "",
    "address_1": "969 Market",
    "address_2": "",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94103",
    "country": "US",
    "email": "john.doe@example.com",
    "phone": "(555) 555-5555"
  },
  "shipping": {
    "first_name": "John",
    "last_name": "Doe",
    "company": "",
    "address_1": "969 Market",
    "address_2": "",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94103",
    "country": "US"
  },
  "payment_method": "bacs",
  "payment_method_title": "Direct Bank Transfer",
  "transaction_id": "",
  "date_paid": "2017-03-22T16:28:08",
  "date_paid_gmt": "2017-03-22T19:28:08",
  "date_completed": null,
  "date_completed_gmt": null,
  "cart_hash": "",
  "meta_data": [
    {
      "id": 13106,
      "key": "_download_permissions_granted",
      "value": "yes"
    }
  ],
  "line_items": [
    {
      "id": 315,
      "name": "Woo Single #1",
      "product_id": 93,
      "variation_id": 0,
      "quantity": 2,
      "tax_class": "",
      "subtotal": "6.00",
      "subtotal_tax": "0.45",
      "total": "6.00",
      "total_tax": "0.45",
      "taxes": [
        {
          "id": 75,
          "total": "0.45",
          "subtotal": "0.45"
        }
      ],
      "meta_data": [],
      "sku": "",
      "price": 3
    },
    {
      "id": 316,
      "name": "Ship Your Idea &ndash; Color: Black, Size: M Test",
      "product_id": 22,
      "variation_id": 23,
      "quantity": 1,
      "tax_class": "",
      "subtotal": "12.00",
      "subtotal_tax": "0.90",
      "total": "12.00",
      "total_tax": "0.90",
      "taxes": [
        {
          "id": 75,
          "total": "0.9",
          "subtotal": "0.9"
        }
      ],
      "meta_data": [
        {
          "id": 2095,
          "key": "pa_color",
          "value": "black"
        },
        {
          "id": 2096,
          "key": "size",
          "value": "M Test"
        }
      ],
      "sku": "Bar3",
      "price": 12
    }
  ],
  "tax_lines": [
    {
      "id": 318,
      "rate_code": "US-CA-STATE TAX",
      "rate_id": 75,
      "label": "State Tax",
      "compound": false,
      "tax_total": "1.35",
      "shipping_tax_total": "0.00",
      "meta_data": []
    }
  ],
  "shipping_lines": [
    {
      "id": 317,
      "method_title": "Flat Rate",
      "method_id": "flat_rate",
      "total": "10.00",
      "total_tax": "0.00",
      "taxes": [],
      "meta_data": []
    }
  ],
  "fee_lines": [],
  "coupon_lines": [],
  "refunds": [],
  "_links": {
    "self": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/727"
      }
    ],
    "collection": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders"
      }
    ]
  }
}
Retrieve an order
This API lets you retrieve and view a specific order.

HTTP request
GET /wp-json/wc/v3/orders/<id>
WooCommerce.get("orders/727")
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

{
  "id": 727,
  "parent_id": 0,
  "number": "727",
  "order_key": "wc_order_58d2d042d1d",
  "created_via": "rest-api",
  "version": "3.0.0",
  "status": "processing",
  "currency": "USD",
  "date_created": "2017-03-22T16:28:02",
  "date_created_gmt": "2017-03-22T19:28:02",
  "date_modified": "2017-03-22T16:28:08",
  "date_modified_gmt": "2017-03-22T19:28:08",
  "discount_total": "0.00",
  "discount_tax": "0.00",
  "shipping_total": "10.00",
  "shipping_tax": "0.00",
  "cart_tax": "1.35",
  "total": "29.35",
  "total_tax": "1.35",
  "prices_include_tax": false,
  "customer_id": 0,
  "customer_ip_address": "",
  "customer_user_agent": "",
  "customer_note": "",
  "billing": {
    "first_name": "John",
    "last_name": "Doe",
    "company": "",
    "address_1": "969 Market",
    "address_2": "",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94103",
    "country": "US",
    "email": "john.doe@example.com",
    "phone": "(555) 555-5555"
  },
  "shipping": {
    "first_name": "John",
    "last_name": "Doe",
    "company": "",
    "address_1": "969 Market",
    "address_2": "",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94103",
    "country": "US"
  },
  "payment_method": "bacs",
  "payment_method_title": "Direct Bank Transfer",
  "transaction_id": "",
  "date_paid": "2017-03-22T16:28:08",
  "date_paid_gmt": "2017-03-22T19:28:08",
  "date_completed": null,
  "date_completed_gmt": null,
  "cart_hash": "",
  "meta_data": [
    {
      "id": 13106,
      "key": "_download_permissions_granted",
      "value": "yes"
    }
  ],
  "line_items": [
    {
      "id": 315,
      "name": "Woo Single #1",
      "product_id": 93,
      "variation_id": 0,
      "quantity": 2,
      "tax_class": "",
      "subtotal": "6.00",
      "subtotal_tax": "0.45",
      "total": "6.00",
      "total_tax": "0.45",
      "taxes": [
        {
          "id": 75,
          "total": "0.45",
          "subtotal": "0.45"
        }
      ],
      "meta_data": [],
      "sku": "",
      "price": 3
    },
    {
      "id": 316,
      "name": "Ship Your Idea &ndash; Color: Black, Size: M Test",
      "product_id": 22,
      "variation_id": 23,
      "quantity": 1,
      "tax_class": "",
      "subtotal": "12.00",
      "subtotal_tax": "0.90",
      "total": "12.00",
      "total_tax": "0.90",
      "taxes": [
        {
          "id": 75,
          "total": "0.9",
          "subtotal": "0.9"
        }
      ],
      "meta_data": [
        {
          "id": 2095,
          "key": "pa_color",
          "value": "black"
        },
        {
          "id": 2096,
          "key": "size",
          "value": "M Test"
        }
      ],
      "sku": "Bar3",
      "price": 12
    }
  ],
  "tax_lines": [
    {
      "id": 318,
      "rate_code": "US-CA-STATE TAX",
      "rate_id": 75,
      "label": "State Tax",
      "compound": false,
      "tax_total": "1.35",
      "shipping_tax_total": "0.00",
      "meta_data": []
    }
  ],
  "shipping_lines": [
    {
      "id": 317,
      "method_title": "Flat Rate",
      "method_id": "flat_rate",
      "total": "10.00",
      "total_tax": "0.00",
      "taxes": [],
      "meta_data": []
    }
  ],
  "fee_lines": [],
  "coupon_lines": [],
  "refunds": [],
  "_links": {
    "self": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/727"
      }
    ],
    "collection": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders"
      }
    ]
  }
}
Available parameters
Parameter	Type	Description
dp	string	Number of decimal points to use in each resource.
List all orders
This API helps you to view all the orders.

HTTP request
GET /wp-json/wc/v3/orders
WooCommerce.get("orders")
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

[
  {
    "id": 727,
    "parent_id": 0,
    "number": "727",
    "order_key": "wc_order_58d2d042d1d",
    "created_via": "rest-api",
    "version": "3.0.0",
    "status": "processing",
    "currency": "USD",
    "date_created": "2017-03-22T16:28:02",
    "date_created_gmt": "2017-03-22T19:28:02",
    "date_modified": "2017-03-22T16:28:08",
    "date_modified_gmt": "2017-03-22T19:28:08",
    "discount_total": "0.00",
    "discount_tax": "0.00",
    "shipping_total": "10.00",
    "shipping_tax": "0.00",
    "cart_tax": "1.35",
    "total": "29.35",
    "total_tax": "1.35",
    "prices_include_tax": false,
    "customer_id": 0,
    "customer_ip_address": "",
    "customer_user_agent": "",
    "customer_note": "",
    "billing": {
      "first_name": "John",
      "last_name": "Doe",
      "company": "",
      "address_1": "969 Market",
      "address_2": "",
      "city": "San Francisco",
      "state": "CA",
      "postcode": "94103",
      "country": "US",
      "email": "john.doe@example.com",
      "phone": "(555) 555-5555"
    },
    "shipping": {
      "first_name": "John",
      "last_name": "Doe",
      "company": "",
      "address_1": "969 Market",
      "address_2": "",
      "city": "San Francisco",
      "state": "CA",
      "postcode": "94103",
      "country": "US"
    },
    "payment_method": "bacs",
    "payment_method_title": "Direct Bank Transfer",
    "transaction_id": "",
    "date_paid": "2017-03-22T16:28:08",
    "date_paid_gmt": "2017-03-22T19:28:08",
    "date_completed": null,
    "date_completed_gmt": null,
    "cart_hash": "",
    "meta_data": [
      {
        "id": 13106,
        "key": "_download_permissions_granted",
        "value": "yes"
      },
      {
        "id": 13109,
        "key": "_order_stock_reduced",
        "value": "yes"
      }
    ],
    "line_items": [
      {
        "id": 315,
        "name": "Woo Single #1",
        "product_id": 93,
        "variation_id": 0,
        "quantity": 2,
        "tax_class": "",
        "subtotal": "6.00",
        "subtotal_tax": "0.45",
        "total": "6.00",
        "total_tax": "0.45",
        "taxes": [
          {
            "id": 75,
            "total": "0.45",
            "subtotal": "0.45"
          }
        ],
        "meta_data": [],
        "sku": "",
        "price": 3
      },
      {
        "id": 316,
        "name": "Ship Your Idea &ndash; Color: Black, Size: M Test",
        "product_id": 22,
        "variation_id": 23,
        "quantity": 1,
        "tax_class": "",
        "subtotal": "12.00",
        "subtotal_tax": "0.90",
        "total": "12.00",
        "total_tax": "0.90",
        "taxes": [
          {
            "id": 75,
            "total": "0.9",
            "subtotal": "0.9"
          }
        ],
        "meta_data": [
          {
            "id": 2095,
            "key": "pa_color",
            "value": "black"
          },
          {
            "id": 2096,
            "key": "size",
            "value": "M Test"
          }
        ],
        "sku": "Bar3",
        "price": 12
      }
    ],
    "tax_lines": [
      {
        "id": 318,
        "rate_code": "US-CA-STATE TAX",
        "rate_id": 75,
        "label": "State Tax",
        "compound": false,
        "tax_total": "1.35",
        "shipping_tax_total": "0.00",
        "meta_data": []
      }
    ],
    "shipping_lines": [
      {
        "id": 317,
        "method_title": "Flat Rate",
        "method_id": "flat_rate",
        "total": "10.00",
        "total_tax": "0.00",
        "taxes": [],
        "meta_data": []
      }
    ],
    "fee_lines": [],
    "coupon_lines": [],
    "refunds": [],
    "_links": {
      "self": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/727"
        }
      ],
      "collection": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders"
        }
      ],
      "email_templates": [
        {
          "embeddable": true,
          "href": "http://example.com/wp-json/wc/v3/orders/723/actions/email_templates"
        }
      ]
    }
  },
  {
    "id": 723,
    "parent_id": 0,
    "number": "723",
    "order_key": "wc_order_58d17c18352",
    "created_via": "checkout",
    "version": "3.0.0",
    "status": "completed",
    "currency": "USD",
    "date_created": "2017-03-21T16:16:00",
    "date_created_gmt": "2017-03-21T19:16:00",
    "date_modified": "2017-03-21T16:54:51",
    "date_modified_gmt": "2017-03-21T19:54:51",
    "discount_total": "0.00",
    "discount_tax": "0.00",
    "shipping_total": "10.00",
    "shipping_tax": "0.00",
    "cart_tax": "0.00",
    "total": "39.00",
    "total_tax": "0.00",
    "prices_include_tax": false,
    "customer_id": 26,
    "customer_ip_address": "127.0.0.1",
    "customer_user_agent": "mozilla/5.0 (x11; ubuntu; linux x86_64; rv:52.0) gecko/20100101 firefox/52.0",
    "customer_note": "",
    "billing": {
      "first_name": "João",
      "last_name": "Silva",
      "company": "",
      "address_1": "Av. Brasil, 432",
      "address_2": "",
      "city": "Rio de Janeiro",
      "state": "RJ",
      "postcode": "12345-000",
      "country": "BR",
      "email": "joao.silva@example.com",
      "phone": "(11) 1111-1111"
    },
    "shipping": {
      "first_name": "João",
      "last_name": "Silva",
      "company": "",
      "address_1": "Av. Brasil, 432",
      "address_2": "",
      "city": "Rio de Janeiro",
      "state": "RJ",
      "postcode": "12345-000",
      "country": "BR"
    },
    "payment_method": "bacs",
    "payment_method_title": "Direct bank transfer",
    "transaction_id": "",
    "date_paid": null,
    "date_paid_gmt": null,
    "date_completed": "2017-03-21T16:54:51",
    "date_completed_gmt": "2017-03-21T19:54:51",
    "cart_hash": "5040ce7273261e31d8bcf79f9be3d279",
    "meta_data": [
      {
        "id": 13023,
        "key": "_download_permissions_granted",
        "value": "yes"
      }
    ],
    "line_items": [
      {
        "id": 311,
        "name": "Woo Album #2",
        "product_id": 87,
        "variation_id": 0,
        "quantity": 1,
        "tax_class": "",
        "subtotal": "9.00",
        "subtotal_tax": "0.00",
        "total": "9.00",
        "total_tax": "0.00",
        "taxes": [],
        "meta_data": [],
        "sku": "",
        "price": 9
      },
      {
        "id": 313,
        "name": "Woo Ninja",
        "product_id": 34,
        "variation_id": 0,
        "quantity": 1,
        "tax_class": "",
        "subtotal": "20.00",
        "subtotal_tax": "0.00",
        "total": "20.00",
        "total_tax": "0.00",
        "taxes": [],
        "meta_data": [],
        "sku": "",
        "price": 20
      }
    ],
    "tax_lines": [],
    "shipping_lines": [
      {
        "id": 312,
        "method_title": "Flat rate",
        "method_id": "flat_rate:25",
        "total": "10.00",
        "total_tax": "0.00",
        "taxes": [],
        "meta_data": [
          {
            "id": 2057,
            "key": "Items",
            "value": "Woo Album #2 &times; 1"
          }
        ]
      }
    ],
    "fee_lines": [],
    "coupon_lines": [],
    "refunds": [
      {
        "id": 726,
        "refund": "",
        "total": "-10.00"
      },
      {
        "id": 724,
        "refund": "",
        "total": "-9.00"
      }
    ],
    "_links": {
      "self": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723"
        }
      ],
      "collection": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders"
        }
      ],
      "email_templates": [
        {
          "embeddable": true,
          "href": "http://example.com/wp-json/wc/v3/orders/723/actions/email_templates"
        }
      ],
      "customer": [
        {
          "href": "https://example.com/wp-json/wc/v3/customers/26"
        }
      ]
    }
  }
]
Available parameters
Parameter	Type	Description
context	string	Scope under which the request is made; determines fields present in response. Options: view and edit. Default is view.
page	integer	Current page of the collection. Default is 1.
per_page	integer	Maximum number of items to be returned in result set. Default is 10.
search	string	Limit results to those matching a string.
after	string	Limit response to resources published after a given ISO8601 compliant date.
before	string	Limit response to resources published before a given ISO8601 compliant date.
modified_after	string	Limit response to resources modified after a given ISO8601 compliant date.
modified_before	string	Limit response to resources modified after a given ISO8601 compliant date.
dates_are_gmt	boolean	Whether to interpret dates as GMT when limiting response by published or modified date.
exclude	array	Ensure result set excludes specific IDs.
include	array	Limit result set to specific ids.
offset	integer	Offset the result set by a specific number of items.
order	string	Order sort attribute ascending or descending. Options: asc and desc. Default is desc.
orderby	string	Sort collection by object attribute. Options: date, modified, id, include, title and slug. Default is date.
parent	array	Limit result set to those of particular parent IDs.
parent_exclude	array	Limit result set to all items except those of a particular parent ID.
status	array	Limit result set to orders assigned a specific status. Options: any, pending, processing, on-hold, completed, cancelled, refunded, failed and trash. Default is any.
customer	integer	Limit result set to orders assigned a specific customer.
product	integer	Limit result set to orders assigned a specific product.
dp	integer	Number of decimal points to use in each resource. Default is 2.
created_via	string	Limit result set to orders created via specific sources (e.g. checkout, store-api). Multiple options can be provided as a comma-separated list.
Update an Order
This API lets you make changes to an order.

HTTP Request
PUT /wp-json/wc/v3/orders/<id>
const data = {
  status: "completed"
};

WooCommerce.put("orders/727", data)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

{
  "id": 727,
  "parent_id": 0,
  "number": "727",
  "order_key": "wc_order_58d2d042d1d",
  "created_via": "rest-api",
  "version": "3.0.0",
  "status": "completed",
  "currency": "USD",
  "date_created": "2017-03-22T16:28:02",
  "date_created_gmt": "2017-03-22T19:28:02",
  "date_modified": "2017-03-22T16:30:35",
  "date_modified_gmt": "2017-03-22T19:30:35",
  "discount_total": "0.00",
  "discount_tax": "0.00",
  "shipping_total": "10.00",
  "shipping_tax": "0.00",
  "cart_tax": "1.35",
  "total": "29.35",
  "total_tax": "1.35",
  "prices_include_tax": false,
  "customer_id": 0,
  "customer_ip_address": "",
  "customer_user_agent": "",
  "customer_note": "",
  "billing": {
    "first_name": "John",
    "last_name": "Doe",
    "company": "",
    "address_1": "969 Market",
    "address_2": "",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94103",
    "country": "US",
    "email": "john.doe@example.com",
    "phone": "(555) 555-5555"
  },
  "shipping": {
    "first_name": "John",
    "last_name": "Doe",
    "company": "",
    "address_1": "969 Market",
    "address_2": "",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94103",
    "country": "US"
  },
  "payment_method": "bacs",
  "payment_method_title": "Direct Bank Transfer",
  "transaction_id": "",
  "date_paid": "2017-03-22T16:28:08",
  "date_paid_gmt": "2017-03-22T19:28:08",
  "date_completed": "2017-03-22T16:30:35",
  "date_completed_gmt": "2017-03-22T19:30:35",
  "cart_hash": "",
  "meta_data": [
    {
      "id": 13106,
      "key": "_download_permissions_granted",
      "value": "yes"
    },
    {
      "id": 13109,
      "key": "_order_stock_reduced",
      "value": "yes"
    }
  ],
  "line_items": [
    {
      "id": 315,
      "name": "Woo Single #1",
      "product_id": 93,
      "variation_id": 0,
      "quantity": 2,
      "tax_class": "",
      "subtotal": "6.00",
      "subtotal_tax": "0.45",
      "total": "6.00",
      "total_tax": "0.45",
      "taxes": [
        {
          "id": 75,
          "total": "0.45",
          "subtotal": "0.45"
        }
      ],
      "meta_data": [],
      "sku": "",
      "price": 3
    },
    {
      "id": 316,
      "name": "Ship Your Idea &ndash; Color: Black, Size: M Test",
      "product_id": 22,
      "variation_id": 23,
      "quantity": 1,
      "tax_class": "",
      "subtotal": "12.00",
      "subtotal_tax": "0.90",
      "total": "12.00",
      "total_tax": "0.90",
      "taxes": [
        {
          "id": 75,
          "total": "0.9",
          "subtotal": "0.9"
        }
      ],
      "meta_data": [
        {
          "id": 2095,
          "key": "pa_color",
          "value": "black"
        },
        {
          "id": 2096,
          "key": "size",
          "value": "M Test"
        }
      ],
      "sku": "Bar3",
      "price": 12
    }
  ],
  "tax_lines": [
    {
      "id": 318,
      "rate_code": "US-CA-STATE TAX",
      "rate_id": 75,
      "label": "State Tax",
      "compound": false,
      "tax_total": "1.35",
      "shipping_tax_total": "0.00",
      "meta_data": []
    }
  ],
  "shipping_lines": [
    {
      "id": 317,
      "method_title": "Flat Rate",
      "method_id": "flat_rate",
      "total": "10.00",
      "total_tax": "0.00",
      "taxes": [],
      "meta_data": []
    }
  ],
  "fee_lines": [],
  "coupon_lines": [],
  "refunds": [],
  "_links": {
    "self": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/727"
      }
    ],
    "collection": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders"
      }
    ]
  }
}
Delete an order
This API helps you delete an order.

HTTP request
DELETE /wp-json/wc/v3/orders/<id>
WooCommerce.delete("orders/727", {
  force: true
})
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

{
  "id": 727,
  "parent_id": 0,
  "number": "727",
  "order_key": "wc_order_58d2d042d1d",
  "created_via": "rest-api",
  "version": "3.0.0",
  "status": "completed",
  "currency": "USD",
  "date_created": "2017-03-22T16:28:02",
  "date_created_gmt": "2017-03-22T19:28:02",
  "date_modified": "2017-03-22T16:30:35",
  "date_modified_gmt": "2017-03-22T19:30:35",
  "discount_total": "0.00",
  "discount_tax": "0.00",
  "shipping_total": "10.00",
  "shipping_tax": "0.00",
  "cart_tax": "1.35",
  "total": "29.35",
  "total_tax": "1.35",
  "prices_include_tax": false,
  "customer_id": 0,
  "customer_ip_address": "",
  "customer_user_agent": "",
  "customer_note": "",
  "billing": {
    "first_name": "John",
    "last_name": "Doe",
    "company": "",
    "address_1": "969 Market",
    "address_2": "",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94103",
    "country": "US",
    "email": "john.doe@example.com",
    "phone": "(555) 555-5555"
  },
  "shipping": {
    "first_name": "John",
    "last_name": "Doe",
    "company": "",
    "address_1": "969 Market",
    "address_2": "",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94103",
    "country": "US"
  },
  "payment_method": "bacs",
  "payment_method_title": "Direct Bank Transfer",
  "transaction_id": "",
  "date_paid": "2017-03-22T16:28:08",
  "date_paid_gmt": "2017-03-22T19:28:08",
  "date_completed": "2017-03-22T16:30:35",
  "date_completed_gmt": "2017-03-22T19:30:35",
  "cart_hash": "",
  "meta_data": [
    {
      "id": 13106,
      "key": "_download_permissions_granted",
      "value": "yes"
    },
    {
      "id": 13109,
      "key": "_order_stock_reduced",
      "value": "yes"
    }
  ],
  "line_items": [
    {
      "id": 315,
      "name": "Woo Single #1",
      "product_id": 93,
      "variation_id": 0,
      "quantity": 2,
      "tax_class": "",
      "subtotal": "6.00",
      "subtotal_tax": "0.45",
      "total": "6.00",
      "total_tax": "0.45",
      "taxes": [
        {
          "id": 75,
          "total": "0.45",
          "subtotal": "0.45"
        }
      ],
      "meta_data": [],
      "sku": "",
      "price": 3
    },
    {
      "id": 316,
      "name": "Ship Your Idea &ndash; Color: Black, Size: M Test",
      "product_id": 22,
      "variation_id": 23,
      "quantity": 1,
      "tax_class": "",
      "subtotal": "12.00",
      "subtotal_tax": "0.90",
      "total": "12.00",
      "total_tax": "0.90",
      "taxes": [
        {
          "id": 75,
          "total": "0.9",
          "subtotal": "0.9"
        }
      ],
      "meta_data": [
        {
          "id": 2095,
          "key": "pa_color",
          "value": "black"
        },
        {
          "id": 2096,
          "key": "size",
          "value": "M Test"
        }
      ],
      "sku": "Bar3",
      "price": 12
    }
  ],
  "tax_lines": [
    {
      "id": 318,
      "rate_code": "US-CA-STATE TAX",
      "rate_id": 75,
      "label": "State Tax",
      "compound": false,
      "tax_total": "1.35",
      "shipping_tax_total": "0.00",
      "meta_data": []
    }
  ],
  "shipping_lines": [
    {
      "id": 317,
      "method_title": "Flat Rate",
      "method_id": "flat_rate",
      "total": "10.00",
      "total_tax": "0.00",
      "taxes": [],
      "meta_data": []
    }
  ],
  "fee_lines": [],
  "coupon_lines": [],
  "refunds": [],
  "_links": {
    "self": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/727"
      }
    ],
    "collection": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders"
      }
    ]
  }
}
Available parameters
Parameter	Type	Description
force	string	Use true whether to permanently delete the order, Default is false.
Batch update orders
This API helps you to batch create, update and delete multiple orders.

 Note: By default it's limited to up to 100 objects to be created, updated or deleted.
HTTP request
POST /wp-json/wc/v3/orders/batch
const data = {
  create: [
    {
      payment_method: "bacs",
      payment_method_title: "Direct Bank Transfer",
      billing: {
        first_name: "John",
        last_name: "Doe",
        address_1: "969 Market",
        address_2: "",
        city: "San Francisco",
        state: "CA",
        postcode: "94103",
        country: "US",
        email: "john.doe@example.com",
        phone: "(555) 555-5555"
      },
      shipping: {
        first_name: "John",
        last_name: "Doe",
        address_1: "969 Market",
        address_2: "",
        city: "San Francisco",
        state: "CA",
        postcode: "94103",
        country: "US"
      },
      line_items: [
        {
          product_id: 79,
          quantity: 1
        },
        {
          product_id: 93,
          quantity: 1
        },
        {
          product_id: 22,
          variation_id: 23,
          quantity: 1
        }
      ],
      shipping_lines: [
        {
          method_id: "flat_rate",
          method_title: "Flat Rate",
          total: "30.00"
        }
      ]
    },
    {
      payment_method: "bacs",
      payment_method_title: "Direct Bank Transfer",
      set_paid: true,
      billing: {
        first_name: "John",
        last_name: "Doe",
        address_1: "969 Market",
        address_2: "",
        city: "San Francisco",
        state: "CA",
        postcode: "94103",
        country: "US",
        email: "john.doe@example.com",
        phone: "(555) 555-5555"
      },
      shipping: {
        first_name: "John",
        last_name: "Doe",
        address_1: "969 Market",
        address_2: "",
        city: "San Francisco",
        state: "CA",
        postcode: "94103",
        country: "US"
      },
      line_items: [
        {
          product_id: 22,
          variation_id: 23,
          quantity: 1
        },
        {
          product_id: 22,
          variation_id: 24,
          quantity: 1
        }
      ],
      shipping_lines: [
        {
          method_id: "flat_rate",
          method_title: "Flat Rate",
          total: "20.00"
        }
      ]
    }
  ],
  update: [
    {
      id: 727,
      shipping_methods: "Local Delivery"
    }
  ],
  delete: [
    723
  ]
};

WooCommerce.post("orders/batch", data)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

{
  "create": [
    {
      "id": 728,
      "parent_id": 0,
      "number": "728",
      "order_key": "wc_order_58d2d18e580",
      "created_via": "rest-api",
      "version": "3.0.0",
      "status": "pending",
      "currency": "USD",
      "date_created": "2017-03-22T16:33:34",
      "date_created_gmt": "2017-03-22T19:33:34",
      "date_modified": "2017-03-22T16:33:34",
      "date_modified_gmt": "2017-03-22T19:33:34",
      "discount_total": "0.00",
      "discount_tax": "0.00",
      "shipping_total": "30.00",
      "shipping_tax": "0.00",
      "cart_tax": "2.25",
      "total": "62.25",
      "total_tax": "2.25",
      "prices_include_tax": false,
      "customer_id": 0,
      "customer_ip_address": "",
      "customer_user_agent": "",
      "customer_note": "",
      "billing": {
        "first_name": "John",
        "last_name": "Doe",
        "company": "",
        "address_1": "969 Market",
        "address_2": "",
        "city": "San Francisco",
        "state": "CA",
        "postcode": "94103",
        "country": "US",
        "email": "john.doe@example.com",
        "phone": "(555) 555-5555"
      },
      "shipping": {
        "first_name": "John",
        "last_name": "Doe",
        "company": "",
        "address_1": "969 Market",
        "address_2": "",
        "city": "San Francisco",
        "state": "CA",
        "postcode": "94103",
        "country": "US"
      },
      "payment_method": "bacs",
      "payment_method_title": "Direct Bank Transfer",
      "transaction_id": "",
      "date_paid": null,
      "date_paid_gmt": null,
      "date_completed": null,
      "date_completed_gmt": null,
      "cart_hash": "",
      "meta_data": [],
      "line_items": [
        {
          "id": 319,
          "name": "Woo Logo",
          "product_id": 79,
          "variation_id": 0,
          "quantity": 1,
          "tax_class": "",
          "subtotal": "15.00",
          "subtotal_tax": "1.13",
          "total": "15.00",
          "total_tax": "1.13",
          "taxes": [
            {
              "id": 75,
              "total": "1.125",
              "subtotal": "1.125"
            }
          ],
          "meta_data": [],
          "sku": "",
          "price": 15
        },
        {
          "id": 320,
          "name": "Woo Single #1",
          "product_id": 93,
          "variation_id": 0,
          "quantity": 1,
          "tax_class": "",
          "subtotal": "3.00",
          "subtotal_tax": "0.23",
          "total": "3.00",
          "total_tax": "0.23",
          "taxes": [
            {
              "id": 75,
              "total": "0.225",
              "subtotal": "0.225"
            }
          ],
          "meta_data": [],
          "sku": "",
          "price": 3
        },
        {
          "id": 321,
          "name": "Ship Your Idea &ndash; Color: Black, Size: M Test",
          "product_id": 22,
          "variation_id": 23,
          "quantity": 1,
          "tax_class": "",
          "subtotal": "12.00",
          "subtotal_tax": "0.90",
          "total": "12.00",
          "total_tax": "0.90",
          "taxes": [
            {
              "id": 75,
              "total": "0.9",
              "subtotal": "0.9"
            }
          ],
          "meta_data": [
            {
              "id": 2133,
              "key": "pa_color",
              "value": "black"
            },
            {
              "id": 2134,
              "key": "size",
              "value": "M Test"
            }
          ],
          "sku": "Bar3",
          "price": 12
        }
      ],
      "tax_lines": [
        {
          "id": 323,
          "rate_code": "US-CA-STATE TAX",
          "rate_id": 75,
          "label": "State Tax",
          "compound": false,
          "tax_total": "2.25",
          "shipping_tax_total": "0.00",
          "meta_data": []
        }
      ],
      "shipping_lines": [
        {
          "id": 322,
          "method_title": "Flat Rate",
          "method_id": "flat_rate",
          "total": "30.00",
          "total_tax": "0.00",
          "taxes": [],
          "meta_data": []
        }
      ],
      "fee_lines": [],
      "coupon_lines": [],
      "refunds": [],
      "_links": {
        "self": [
          {
            "href": "https://example.com/wp-json/wc/v3/orders/728"
          }
        ],
        "collection": [
          {
            "href": "https://example.com/wp-json/wc/v3/orders"
          }
        ]
      }
    },
    {
      "id": 729,
      "parent_id": 0,
      "number": "729",
      "order_key": "wc_order_58d2d196171",
      "created_via": "rest-api",
      "version": "3.0.0",
      "status": "processing",
      "currency": "USD",
      "date_created": "2017-03-22T16:33:42",
      "date_created_gmt": "2017-03-22T19:33:42",
      "date_modified": "2017-03-22T16:33:47",
      "date_modified_gmt": "2017-03-22T19:33:47",
      "discount_total": "0.00",
      "discount_tax": "0.00",
      "shipping_total": "20.00",
      "shipping_tax": "0.00",
      "cart_tax": "2.40",
      "total": "54.40",
      "total_tax": "2.40",
      "prices_include_tax": false,
      "customer_id": 0,
      "customer_ip_address": "",
      "customer_user_agent": "",
      "customer_note": "",
      "billing": {
        "first_name": "John",
        "last_name": "Doe",
        "company": "",
        "address_1": "969 Market",
        "address_2": "",
        "city": "San Francisco",
        "state": "CA",
        "postcode": "94103",
        "country": "US",
        "email": "john.doe@example.com",
        "phone": "(555) 555-5555"
      },
      "shipping": {
        "first_name": "John",
        "last_name": "Doe",
        "company": "",
        "address_1": "969 Market",
        "address_2": "",
        "city": "San Francisco",
        "state": "CA",
        "postcode": "94103",
        "country": "US"
      },
      "payment_method": "bacs",
      "payment_method_title": "Direct Bank Transfer",
      "transaction_id": "",
      "date_paid": "2017-03-22T16:33:47",
      "date_paid_gmt": "2017-03-22T19:33:47",
      "date_completed": null,
      "date_completed_gmt": null,
      "cart_hash": "",
      "meta_data": [
        {
          "id": 13198,
          "key": "_download_permissions_granted",
          "value": "yes"
        }
      ],
      "line_items": [
        {
          "id": 324,
          "name": "Ship Your Idea &ndash; Color: Black, Size: M Test",
          "product_id": 22,
          "variation_id": 23,
          "quantity": 1,
          "tax_class": "",
          "subtotal": "12.00",
          "subtotal_tax": "0.90",
          "total": "12.00",
          "total_tax": "0.90",
          "taxes": [
            {
              "id": 75,
              "total": "0.9",
              "subtotal": "0.9"
            }
          ],
          "meta_data": [
            {
              "id": 2153,
              "key": "pa_color",
              "value": "black"
            },
            {
              "id": 2154,
              "key": "size",
              "value": "M Test"
            }
          ],
          "sku": "Bar3",
          "price": 12
        },
        {
          "id": 325,
          "name": "Ship Your Idea &ndash; Color: Green, Size: S Test",
          "product_id": 22,
          "variation_id": 24,
          "quantity": 1,
          "tax_class": "",
          "subtotal": "20.00",
          "subtotal_tax": "1.50",
          "total": "20.00",
          "total_tax": "1.50",
          "taxes": [
            {
              "id": 75,
              "total": "1.5",
              "subtotal": "1.5"
            }
          ],
          "meta_data": [
            {
              "id": 2164,
              "key": "pa_color",
              "value": "green"
            },
            {
              "id": 2165,
              "key": "size",
              "value": "S Test"
            }
          ],
          "sku": "",
          "price": 20
        }
      ],
      "tax_lines": [
        {
          "id": 327,
          "rate_code": "US-CA-STATE TAX",
          "rate_id": 75,
          "label": "State Tax",
          "compound": false,
          "tax_total": "2.40",
          "shipping_tax_total": "0.00",
          "meta_data": []
        }
      ],
      "shipping_lines": [
        {
          "id": 326,
          "method_title": "Flat Rate",
          "method_id": "flat_rate",
          "total": "20.00",
          "total_tax": "0.00",
          "taxes": [],
          "meta_data": []
        }
      ],
      "fee_lines": [],
      "coupon_lines": [],
      "refunds": [],
      "_links": {
        "self": [
          {
            "href": "https://example.com/wp-json/wc/v3/orders/729"
          }
        ],
        "collection": [
          {
            "href": "https://example.com/wp-json/wc/v3/orders"
          }
        ]
      }
    }
  ],
  "update": [
    {
      "id": 727,
      "parent_id": 0,
      "number": "727",
      "order_key": "wc_order_58d2d042d1d",
      "created_via": "rest-api",
      "version": "3.0.0",
      "status": "completed",
      "currency": "USD",
      "date_created": "2017-03-22T16:28:02",
      "date_created_gmt": "2017-03-22T19:28:02",
      "date_modified": "2017-03-22T16:30:35",
      "date_modified_gmt": "2017-03-22T19:30:35",
      "discount_total": "0.00",
      "discount_tax": "0.00",
      "shipping_total": "10.00",
      "shipping_tax": "0.00",
      "cart_tax": "1.35",
      "total": "29.35",
      "total_tax": "1.35",
      "prices_include_tax": false,
      "customer_id": 0,
      "customer_ip_address": "",
      "customer_user_agent": "",
      "customer_note": "",
      "billing": {
        "first_name": "John",
        "last_name": "Doe",
        "company": "",
        "address_1": "969 Market",
        "address_2": "",
        "city": "San Francisco",
        "state": "CA",
        "postcode": "94103",
        "country": "US",
        "email": "john.doe@example.com",
        "phone": "(555) 555-5555"
      },
      "shipping": {
        "first_name": "John",
        "last_name": "Doe",
        "company": "",
        "address_1": "969 Market",
        "address_2": "",
        "city": "San Francisco",
        "state": "CA",
        "postcode": "94103",
        "country": "US"
      },
      "payment_method": "bacs",
      "payment_method_title": "Direct Bank Transfer",
      "transaction_id": "",
      "date_paid": "2017-03-22T16:28:08",
      "date_paid_gmt": "2017-03-22T19:28:08",
      "date_completed": "2017-03-22T16:30:35",
      "date_completed_gmt": "2017-03-22T19:30:35",
      "cart_hash": "",
      "meta_data": [
        {
          "id": 13106,
          "key": "_download_permissions_granted",
          "value": "yes"
        },
        {
          "id": 13109,
          "key": "_order_stock_reduced",
          "value": "yes"
        }
      ],
      "line_items": [
        {
          "id": 315,
          "name": "Woo Single #1",
          "product_id": 93,
          "variation_id": 0,
          "quantity": 2,
          "tax_class": "",
          "subtotal": "6.00",
          "subtotal_tax": "0.45",
          "total": "6.00",
          "total_tax": "0.45",
          "taxes": [
            {
              "id": 75,
              "total": "0.45",
              "subtotal": "0.45"
            }
          ],
          "meta_data": [],
          "sku": "",
          "price": 3
        },
        {
          "id": 316,
          "name": "Ship Your Idea &ndash; Color: Black, Size: M Test",
          "product_id": 22,
          "variation_id": 23,
          "quantity": 1,
          "tax_class": "",
          "subtotal": "12.00",
          "subtotal_tax": "0.90",
          "total": "12.00",
          "total_tax": "0.90",
          "taxes": [
            {
              "id": 75,
              "total": "0.9",
              "subtotal": "0.9"
            }
          ],
          "meta_data": [
            {
              "id": 2095,
              "key": "pa_color",
              "value": "black"
            },
            {
              "id": 2096,
              "key": "size",
              "value": "M Test"
            }
          ],
          "sku": "Bar3",
          "price": 12
        }
      ],
      "tax_lines": [
        {
          "id": 318,
          "rate_code": "US-CA-STATE TAX",
          "rate_id": 75,
          "label": "State Tax",
          "compound": false,
          "tax_total": "1.35",
          "shipping_tax_total": "0.00",
          "meta_data": []
        }
      ],
      "shipping_lines": [
        {
          "id": 317,
          "method_title": "Flat Rate",
          "method_id": "flat_rate",
          "total": "10.00",
          "total_tax": "0.00",
          "taxes": [],
          "meta_data": []
        }
      ],
      "fee_lines": [],
      "coupon_lines": [],
      "refunds": [],
      "_links": {
        "self": [
          {
            "href": "https://example.com/wp-json/wc/v3/orders/727"
          }
        ],
        "collection": [
          {
            "href": "https://example.com/wp-json/wc/v3/orders"
          }
        ]
      }
    }
  ],
  "delete": [
    {
      "id": 723,
      "parent_id": 0,
      "number": "723",
      "order_key": "wc_order_58d17c18352",
      "created_via": "checkout",
      "version": "3.0.0",
      "status": "completed",
      "currency": "USD",
      "date_created": "2017-03-21T16:16:00",
      "date_created_gmt": "2017-03-21T19:16:00",
      "date_modified": "2017-03-21T16:54:51",
      "date_modified_gmt": "2017-03-21T19:54:51",
      "discount_total": "0.00",
      "discount_tax": "0.00",
      "shipping_total": "10.00",
      "shipping_tax": "0.00",
      "cart_tax": "0.00",
      "total": "39.00",
      "total_tax": "0.00",
      "prices_include_tax": false,
      "customer_id": 26,
      "customer_ip_address": "127.0.0.1",
      "customer_user_agent": "mozilla/5.0 (x11; ubuntu; linux x86_64; rv:52.0) gecko/20100101 firefox/52.0",
      "customer_note": "",
      "billing": {
        "first_name": "João",
        "last_name": "Silva",
        "company": "",
        "address_1": "Av. Brasil, 432",
        "address_2": "",
        "city": "Rio de Janeiro",
        "state": "RJ",
        "postcode": "12345-000",
        "country": "BR",
        "email": "joao.silva@example.com",
        "phone": "(11) 1111-1111"
      },
      "shipping": {
        "first_name": "João",
        "last_name": "Silva",
        "company": "",
        "address_1": "Av. Brasil, 432",
        "address_2": "",
        "city": "Rio de Janeiro",
        "state": "RJ",
        "postcode": "12345-000",
        "country": "BR"
      },
      "payment_method": "bacs",
      "payment_method_title": "Direct bank transfer",
      "transaction_id": "",
      "date_paid": null,
      "date_paid_gmt": null,
      "date_completed": "2017-03-21T16:54:51",
      "date_completed_gmt": "2017-03-21T19:54:51",
      "cart_hash": "5040ce7273261e31d8bcf79f9be3d279",
      "meta_data": [
        {
          "id": 13023,
          "key": "_download_permissions_granted",
          "value": "yes"
        }
      ],
      "line_items": [
        {
          "id": 311,
          "name": "Woo Album #2",
          "product_id": 87,
          "variation_id": 0,
          "quantity": 1,
          "tax_class": "",
          "subtotal": "9.00",
          "subtotal_tax": "0.00",
          "total": "9.00",
          "total_tax": "0.00",
          "taxes": [],
          "meta_data": [],
          "sku": "",
          "price": 9
        },
        {
          "id": 313,
          "name": "Woo Ninja",
          "product_id": 34,
          "variation_id": 0,
          "quantity": 1,
          "tax_class": "",
          "subtotal": "20.00",
          "subtotal_tax": "0.00",
          "total": "20.00",
          "total_tax": "0.00",
          "taxes": [],
          "meta_data": [],
          "sku": "",
          "price": 20
        }
      ],
      "tax_lines": [],
      "shipping_lines": [
        {
          "id": 312,
          "method_title": "Flat rate",
          "method_id": "flat_rate:25",
          "total": "10.00",
          "total_tax": "0.00",
          "taxes": [],
          "meta_data": [
            {
              "id": 2057,
              "key": "Items",
              "value": "Woo Album #2 &times; 1"
            }
          ]
        }
      ],
      "fee_lines": [],
      "coupon_lines": [],
      "refunds": [
        {
          "id": 726,
          "refund": "",
          "total": "-10.00"
        },
        {
          "id": 724,
          "refund": "",
          "total": "-9.00"
        }
      ],
      "_links": {
        "self": [
          {
            "href": "https://example.com/wp-json/wc/v3/orders/723"
          }
        ],
        "collection": [
          {
            "href": "https://example.com/wp-json/wc/v3/orders"
          }
        ],
        "customer": [
          {
            "href": "https://example.com/wp-json/wc/v3/customers/26"
          }
        ]
      }
    }
  ]
}
Order actions
The order actions API allows you to perform specific actions with existing orders like you can from the Edit Order screen in the web app.

Note: currently only some actions are available, other actions will be introduced at a later time.

Send order details to customer
This endpoint allows you to trigger an email to the customer with the details of their order. In case the order doesn't yet have a billing email set, you can specify an email recipient. However, if the order does have an existing billing email, this will return an error, unless you also specify that the existing email should be overwritten by using the force_email_update parameter.

HTTP request
POST /wp-json/wc/v3/orders/<id>/actions/send_order_details
const data = {
    email: "somebody@example.com",
    force_email_update: true
};

WooCommerce.post("orders/723/actions/send_order_details", data)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response examples:

{
  "message": "Billing email updated to somebody@example.com. Order details sent to somebody@example.com, via REST API."
}
{
    "code": "woocommerce_rest_missing_email",
    "message": "Order does not have an email address.",
    "data": {
        "status": 400
    }
}
Send order notification email to customer
This endpoint allows you to trigger an email to a customer about the status of their order. This is similar to the send_order_details endpoint, but allows you to specify which email template to send, based on which email templates are relevant to the order. For example, an order that is on hold has the customer_on_hold_order template available. A completed order that also has a partial refund has both the customer_completed_order and customer_refunded_order templates available. Specifying the customer_invoice template is the same as using the send_order_details endpoint.

HTTP request
POST /wp-json/wc/v3/orders/<id>/actions/send_email
const data = {
    template_id: "customer_completed_order",
    email: "somebody@example.com",
    force_email_update: true
};

WooCommerce.post("orders/723/actions/send_email", data)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response examples:

{
  "message": "Billing email updated to somebody@example.com. Email template &quot;Completed order&quot; sent to somebody@example.com, via REST API."
}
{
    "code": "woocommerce_rest_invalid_email_template",
    "message": "customer_completed_order is not a valid template for this order.",
    "data": {
        "status": 400
    }
}
Get available email templates for an order
This endpoint allows you to retrieve a list of email templates that are available for the specified order. You can also get this data embedded in the response for the orders endpoint.

HTTP request
GET /wp-json/wc/v3/orders/<id>/actions/email_templates
WooCommerce.get("orders/723/actions/email_templates")
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response examples:

[
    {
        "id": "customer_completed_order",
        "title": "Completed order",
        "description": "Order complete emails are sent to customers when their orders are marked completed and usually indicate that their orders have been shipped."
    },
    {
        "id": "customer_invoice",
        "title": "Order details",
        "description": "Order detail emails can be sent to customers containing their order information and payment links."
    }
]
Order notes
The order notes API allows you to create, view, and delete individual order notes.
Order notes are added by administrators and programmatically to store data about an order, or order events.

Order note properties
Attribute	Type	Description
id	integer	Unique identifier for the resource.read-only
author	string	Order note author.read-only
date_created	date-time	The date the order note was created, in the site's timezone.read-only
date_created_gmt	date-time	The date the order note was created, as GMT.read-only
note	string	Order note content.mandatory
customer_note	boolean	If true, the note will be shown to customers and they will be notified. If false, the note will be for admin reference only. Default is false.
added_by_user	boolean	If true, this note will be attributed to the current user. If false, the note will be attributed to the system. Default is false.
Create an order note
This API helps you to create a new note for an order.

HTTP request
POST /wp-json/wc/v3/orders/<id>/notes
const data = {
  note: "Order ok!!!"
};

WooCommerce.post("orders/723/notes", data)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

{
  "id": 281,
  "author": "system",
  "date_created": "2017-03-21T16:46:41",
  "date_created_gmt": "2017-03-21T19:46:41",
  "note": "Order ok!!!",
  "customer_note": false,
  "_links": {
    "self": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723/notes/281"
      }
    ],
    "collection": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723/notes"
      }
    ],
    "up": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723"
      }
    ]
  }
}
Retrieve an order note
This API lets you retrieve and view a specific note from an order.

HTTP request
GET /wp-json/wc/v3/orders/<id>/notes/<note_id>
WooCommerce.get("orders/723/notes/281")
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

{
  "id": 281,
  "author": "system",
  "date_created": "2017-03-21T16:46:41",
  "date_created_gmt": "2017-03-21T19:46:41",
  "note": "Order ok!!!",
  "customer_note": false,
  "_links": {
    "self": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723/notes/281"
      }
    ],
    "collection": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723/notes"
      }
    ],
    "up": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723"
      }
    ]
  }
}
List all order notes
This API helps you to view all the notes from an order.

HTTP request
GET /wp-json/wc/v3/orders/<id>/notes
WooCommerce.get("orders/723/notes")
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

[
  {
    "id": 281,
    "author": "system",
    "date_created": "2017-03-21T16:46:41",
    "date_created_gmt": "2017-03-21T19:46:41",
    "note": "Order ok!!!",
    "customer_note": false,
    "_links": {
      "self": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723/notes/281"
        }
      ],
      "collection": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723/notes"
        }
      ],
      "up": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723"
        }
      ]
    }
  },
  {
    "id": 280,
    "author": "system",
    "date_created": "2017-03-21T16:16:58",
    "date_created_gmt": "2017-03-21T19:16:58",
    "note": "Order status changed from On hold to Completed.",
    "customer_note": false,
    "_links": {
      "self": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723/notes/280"
        }
      ],
      "collection": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723/notes"
        }
      ],
      "up": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723"
        }
      ]
    }
  },
  {
    "id": 279,
    "author": "system",
    "date_created": "2017-03-21T16:16:46",
    "date_created_gmt": "2017-03-21T19:16:46",
    "note": "Awaiting BACS payment Order status changed from Pending payment to On hold.",
    "customer_note": false,
    "_links": {
      "self": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723/notes/279"
        }
      ],
      "collection": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723/notes"
        }
      ],
      "up": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723"
        }
      ]
    }
  }
]
Available parameters
Parameter	Type	Description
context	string	Scope under which the request is made; determines fields present in response. Options: view and edit. Default is view.
type	string	Limit result to customers or internal notes. Options: any, customer and internal. Default is any.
Delete an order note
This API helps you delete an order note.

HTTP request
DELETE /wp-json/wc/v3/orders/<id>/notes/<note_id>
WooCommerce.delete("orders/723/notes/281", {
  force: true
})
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

{
  "id": 281,
  "author": "system",
  "date_created": "2017-03-21T16:46:41",
  "date_created_gmt": "2017-03-21T19:46:41",
  "note": "Order ok!!!",
  "customer_note": false,
  "_links": {
    "self": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723/notes/281"
      }
    ],
    "collection": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723/notes"
      }
    ],
    "up": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723"
      }
    ]
  }
}
Available parameters
Parameter	Type	Description
force	string	Required to be true, as resource does not support trashing.
Order refunds
The order refunds API allows you to create, view, and delete individual refunds, based on an existing order.

Order refund properties
Attribute	Type	Description
id	integer	Unique identifier for the resource.read-only
date_created	date-time	The date the order refund was created, in the site's timezone.read-only
date_created_gmt	date-time	The date the order refund was created, as GMT.read-only
amount	string	Total refund amount. Optional. If this parameter is provided, it will take precedence over line item totals, even when total of line items does not matches with this amount.
reason	string	Reason for refund.
refunded_by	integer	User ID of user who created the refund.
refunded_payment	boolean	If the payment was refunded via the API. See api_refund.read-only
meta_data	array	Meta data. See Order refund - Meta data properties
line_items	array	Line items data. See Order refund - Line items properties
tax_lines	array	Tax lines data. See Order refund - Tax lines propertiesread-only
shipping_lines	array	Shipping lines data. See Order refund - Shipping lines properties
fee_lines	array	Fee lines data. See Order refund - Fee lines properties
api_refund	boolean	When true, the payment gateway API is used to generate the refund. Default is true.write-only
api_restock	boolean	When true, the selected line items are restocked Default is true.write-only
Order refund - Meta data properties
Attribute	Type	Description
id	integer	Meta ID.read-only
key	string	Meta key.
value	string	Meta value.
Order refund - Line items properties
Attribute	Type	Description
id	integer	Item ID.read-only
name	string	Product name.
product_id	integer	Product ID.
variation_id	integer	Variation ID, if applicable.
quantity	integer	Quantity ordered.
tax_class	string	Tax class of product.
subtotal	string	Line subtotal (before discounts).
subtotal_tax	string	Line subtotal tax (before discounts).read-only
total	string	Line total (after discounts).
total_tax	string	Line total tax (after discounts).read-only
taxes	array	Line taxes. See Order refund line item - Taxes propertiesread-only
meta_data	array	Meta data. See Order refund - Meta data properties
sku	string	Product SKU.read-only
price	string	Product price.read-only
Order refund line item - Taxes properties
Attribute	Type	Description
id	integer	Tax rate ID.read-only
total	string	Tax total.read-only
subtotal	string	Tax subtotal.read-only
Order refund - Tax lines properties
Attribute	Type	Description
id	integer	Item ID.read-only
rate_code	string	Tax rate code.read-only
rate_id	integer	Tax rate ID.read-only
label	string	Tax rate label.read-only
compound	boolean	Whether or not this is a compound tax rate.read-only
tax_total	string	Tax total (not including shipping taxes).read-only
shipping_tax_total	string	Shipping tax total.read-only
meta_data	array	Meta data. See Order refund - Meta data properties
Order refund - Shipping lines properties
Attribute	Type	Description
id	integer	Item ID.read-only
method_title	string	Shipping method name.
method_id	string	Shipping method ID.
total	string	Line total (after discounts).
total_tax	string	Line total tax (after discounts).read-only
taxes	array	Line taxes. See Order refund - Tax lines propertiesread-only
meta_data	array	Meta data. See Order refund - Meta data properties
Order refund - Fee lines properties
Attribute	Type	Description
id	integer	Item ID.read-only
name	string	Fee name.
tax_class	string	Tax class of fee.
tax_status	string	Tax status of fee. Options: taxable and none.
total	string	Line total (after discounts).
total_tax	string	Line total tax (after discounts).read-only
taxes	array	Line taxes. See Order refund - Tax lines propertiesread-only
meta_data	array	Meta data. See Order refund - Meta data properties
Create a refund
This API helps you to create a new refund for an order.

HTTP request
POST /wp-json/wc/v3/orders/<id>/refunds
const data = {
    amount: "30",
    line_items: [
      {
         id: "111",
         refund_total: 10,
         refund_tax: [
           {
             id: "222",
             refund_total: 20
           }
         ]
      }
   ]
};

WooCommerce.post("orders/723/refunds", data)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

{
  "id": 726,
  "date_created": "2017-03-21T17:07:11",
  "date_created_gmt": "2017-03-21T20:07:11",
  "amount": "10.00",
  "reason": "",
  "refunded_by": 1,
  "refunded_payment": false,
  "meta_data": [],
  "line_items": [],
  "_links": {
    "self": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723/refunds/726"
      }
    ],
    "collection": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723/refunds"
      }
    ],
    "up": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723"
      }
    ]
  }
}
Line item parameters
Parameter	Type	Description
id	integer	The ID of the line item in the order.
refund_total	number	The amount to refund for this line item, excluding taxes.
refund_tax	array	Refunds for tax rates. See Refund tax parameters
Refund tax parameters
Parameter	Type	Description
id	integer	The ID of the tax rate.
refund_total	number	The amount of tax to refund for this line item.
Retrieve a refund
This API lets you retrieve and view a specific refund from an order.

HTTP request
GET /wp-json/wc/v3/orders/<id>/refunds/<refund_id>
WooCommerce.get("orders/723/refunds/726")
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

{
  "id": 726,
  "date_created": "2017-03-21T17:07:11",
  "date_created_gmt": "2017-03-21T20:07:11",
  "amount": "10.00",
  "reason": "",
  "refunded_by": 1,
  "refunded_payment": false,
  "meta_data": [],
  "line_items": [],
  "_links": {
    "self": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723/refunds/726"
      }
    ],
    "collection": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723/refunds"
      }
    ],
    "up": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723"
      }
    ]
  }
}
Available parameters
Parameter	Type	Description
dp	string	Number of decimal points to use in each resource.
List all refunds
This API helps you to view all the refunds from an order.

Note: To view a list of refunds from your store, regardless of order, check out the refunds endpoint.

HTTP request
GET /wp-json/wc/v3/orders/<id>/refunds
WooCommerce.get("orders/723/refunds")
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

[
  {
    "id": 726,
    "date_created": "2017-03-21T17:07:11",
    "date_created_gmt": "2017-03-21T20:07:11",
    "amount": "10.00",
    "reason": "",
    "refunded_by": 1,
    "refunded_payment": false,
    "meta_data": [],
    "line_items": [],
    "_links": {
      "self": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723/refunds/726"
        }
      ],
      "collection": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723/refunds"
        }
      ],
      "up": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723"
        }
      ]
    }
  },
  {
    "id": 724,
    "date_created": "2017-03-21T16:55:37",
    "date_created_gmt": "2017-03-21T19:55:37",
    "amount": "9.00",
    "reason": "",
    "refunded_by": 1,
    "refunded_payment": false,
    "meta_data": [],
    "line_items": [
      {
        "id": 314,
        "name": "Woo Album #2",
        "product_id": 87,
        "variation_id": 0,
        "quantity": -1,
        "tax_class": "",
        "subtotal": "-9.00",
        "subtotal_tax": "0.00",
        "total": "-9.00",
        "total_tax": "0.00",
        "taxes": [],
        "meta_data": [
          {
            "id": 2076,
            "key": "_refunded_item_id",
            "value": "311"
          }
        ],
        "sku": "",
        "price": -9
      }
    ],
    "_links": {
      "self": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723/refunds/724"
        }
      ],
      "collection": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723/refunds"
        }
      ],
      "up": [
        {
          "href": "https://example.com/wp-json/wc/v3/orders/723"
        }
      ]
    }
  }
]
Available parameters
Parameter	Type	Description
context	string	Scope under which the request is made; determines fields present in response. Options: view and edit. Default is view.
page	integer	Current page of the collection. Default is 1.
per_page	integer	Maximum number of items to be returned in result set. Default is 10.
search	string	Limit results to those matching a string.
after	string	Limit response to resources published after a given ISO8601 compliant date.
before	string	Limit response to resources published before a given ISO8601 compliant date.
dates_are_gmt	boolean	Interpret after and before as UTC dates when true.
exclude	array	Ensure result set excludes specific IDs.
include	array	Limit result set to specific ids.
offset	integer	Offset the result set by a specific number of items.
order	string	Order sort attribute ascending or descending. Options: asc and desc. Default is desc.
orderby	string	Sort collection by object attribute. Options: date, modified, id, include, title and slug. Default is date.
parent	array	Limit result set to those of particular parent IDs.
parent_exclude	array	Limit result set to all items except those of a particular parent ID.
dp	integer	Number of decimal points to use in each resource. Default is 2.
Delete a refund
This API helps you delete an order refund.

HTTP request
DELETE /wp-json/wc/v3/orders/<id>/refunds/<refund_id>
WooCommerce.delete("orders/723/refunds/726", {
  force: true
})
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
JSON response example:

{
  "id": 726,
  "date_created": "2017-03-21T17:07:11",
  "date_created_gmt": "2017-03-21T20:07:11",
  "amount": "10.00",
  "reason": "",
  "refunded_by": 1,
  "refunded_payment": false,
  "meta_data": [],
  "line_items": [],
  "_links": {
    "self": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723/refunds/726"
      }
    ],
    "collection": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723/refunds"
      }
    ],
    "up": [
      {
        "href": "https://example.com/wp-json/wc/v3/orders/723"
      }
    ]
  }
}
Available parameters
Parameter	Type	Description
force	string	Required to be true, as resource does not support trashing.
