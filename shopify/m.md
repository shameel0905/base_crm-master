---
title: Collect
description: >-
  After creating a custom collection, add products to it by creating a collect
  for each product. Each collect associates one product with one custom
  collection.
api_version: 2025-10
api_name: admin-rest
api_type: rest
source_url:
  html: 'https://shopify.dev/docs/api/admin-rest/latest/resources/collect'
  md: 'https://shopify.dev/docs/api/admin-rest/latest/resources/collect.md'
---

The REST Admin API is a legacy API as of October 1, 2024. Starting April 1, 2025, all new public apps must be built exclusively with the [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql). For details and migration steps, visit our [migration guide](https://shopify.dev/docs/apps/build/graphql/migrate).

# Collect

Requires `products` access scope.

The Collect resource connects a product to a custom collection.

![](https://shopify.dev/assets/api/reference/collect.png)

Collects are meant for managing the relationship between products and custom collections. For every product in a custom collection there is a collect that tracks the ID of both the product and the custom collection. A product can be in more than one collection, and will have a collect connecting it to each collection. Unlike many Shopify resources, collects aren't apparent to store owners.

Collects are for placing products in custom collections only. [Smart collections](https://shopify.dev/docs/admin-api/rest/reference/products/smartcollection) use rules to determine which products are their members. Creating a collect that links a product to a smart collection results in a **403 Forbidden** error.

For more information on custom collections, see the [CustomCollection](https://shopify.dev/docs/admin-api/rest/reference/products/customcollection) resource.

\#

## Endpoints

* [post](https://shopify.dev/docs/api/admin-rest/latest/resources/collect.md#post-collects)

  [/admin/api/latest/collects.​json](https://shopify.dev/docs/api/admin-rest/latest/resources/collect.md#post-collects)

  Adds a product to a custom collection

  [collectionAddProducts](https://shopify.dev/docs/api/admin-graphql/latest/mutations/collectionAddProducts?example=adds-a-product-to-a-custom-collection)

* [get](https://shopify.dev/docs/api/admin-rest/latest/resources/collect.md#get-collects)

  [/admin/api/latest/collects.​json](https://shopify.dev/docs/api/admin-rest/latest/resources/collect.md#get-collects)

  Retrieves a list of collects

  [collection](https://shopify.dev/docs/api/admin-graphql/latest/queries/collection)

  [product](https://shopify.dev/docs/api/admin-graphql/latest/queries/product)

* [get](https://shopify.dev/docs/api/admin-rest/latest/resources/collect.md#get-collects-collect-id)

  [/admin/api/latest/collects/{collect\_​id}.​json](https://shopify.dev/docs/api/admin-rest/latest/resources/collect.md#get-collects-collect-id)

  Retrieves a specific collect by its ID

  deprecated

* [get](https://shopify.dev/docs/api/admin-rest/latest/resources/collect.md#get-collects-count)

  [/admin/api/latest/collects/count.​json](https://shopify.dev/docs/api/admin-rest/latest/resources/collect.md#get-collects-count)

  Retrieves a count of collects

  [collection](https://shopify.dev/docs/api/admin-graphql/latest/queries/collection)

* [del](https://shopify.dev/docs/api/admin-rest/latest/resources/collect.md#delete-collects-collect-id)

  [/admin/api/latest/collects/{collect\_​id}.​json](https://shopify.dev/docs/api/admin-rest/latest/resources/collect.md#delete-collects-collect-id)

  Removes a product from a collection

  [collectionRemoveProducts](https://shopify.dev/docs/api/admin-graphql/latest/mutations/collectionRemoveProducts?example=removes-a-product-from-a-collection)

***

## The Collect resource

### Properties

***

collection\_id

deprecated

The ID of the custom collection containing the product.

***

created\_at

deprecated

The date and time ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format) when the collect was created.

***

id

deprecated

A unique numeric identifier for the collect.

***

position

deprecated

The position of this product in a manually sorted custom collection. The positions are not guaranteed to be consecutive. This value is applied only when the custom collection is sorted manually.

***

product\_id

deprecated

The unique numeric identifier for the product in the custom collection.

***

sort\_value

deprecated

This is the same value as `position` but padded with leading zeroes to make it alphanumeric-sortable. This value is applied only when the custom collection is sorted manually.

***

updated\_at

deprecated

The date and time ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format) when the collect was last updated.

***

{}

## The Collect resource

```json
{
  "collection_id": 841564295,
  "created_at": "2018-04-25T13:51:12-04:00",
  "id": 841564295,
  "position": 2,
  "product_id": 632910392,
  "sort_value": "0000000002",
  "updated_at": "2018-04-25T13:51:12-04:00"
}
```

***

## postAdds a product to a custom collection

[collectionAddProducts](https://shopify.dev/docs/api/admin-graphql/latest/mutations/collectionAddProducts?example=adds-a-product-to-a-custom-collection)

Adds a product to a custom collection.

### Parameters

***

api\_version

string

required

***

### Examples

Create a new link between an existing product and an existing collection

Request body

collect​

Collect resource

Show collect properties

collect.product\_​id:​921728736

deprecated

The unique numeric identifier for the product in the custom collection.

collect.collection\_​id:​841564295

deprecated

The ID of the custom collection containing the product.

Creating a collect without a product or collection ID fails and returns an error

post

## /admin/api/2025-10/collects.​json

```bash
curl -d '{"collect":{"product_id":921728736,"collection_id":841564295}}' \
-X POST "https://your-development-store.myshopify.com/admin/api/2025-10/collects.json" \
-H "X-Shopify-Access-Token: {access_token}" \
-H "Content-Type: application/json"
```

{}

## Response

JSON

```json
HTTP/1.1 201 Created
{
  "collect": {
    "id": 1071559574,
    "collection_id": 841564295,
    "product_id": 921728736,
    "created_at": "2025-10-01T15:07:14-04:00",
    "updated_at": "2025-10-01T15:07:14-04:00",
    "position": 2,
    "sort_value": "0000000002"
  }
}
```

### examples

* #### Create a new link between an existing product and an existing collection

  #####

  ```curl
  curl -d '{"collect":{"product_id":921728736,"collection_id":841564295}}' \
  -X POST "https://your-development-store.myshopify.com/admin/api/2025-10/collects.json" \
  -H "X-Shopify-Access-Token: {access_token}" \
  -H "Content-Type: application/json"
  ```

  #####

  ```remix
  const { admin, session } = await authenticate.admin(request);

  const collect = new admin.rest.resources.Collect({session: session});

  collect.product_id = 921728736;
  collect.collection_id = 841564295;
  await collect.save({
    update: true,
  });
  ```

  #####

  ```ruby
  # Session is activated via Authentication
  test_session = ShopifyAPI::Context.active_session

  collect = ShopifyAPI::Collect.new(session: test_session)
  collect.product_id = 921728736
  collect.collection_id = 841564295
  collect.save!
  ```

  #####

  ```node
  // Session is built by the OAuth process

  const collect = new shopify.rest.Collect({session: session});
  collect.product_id = 921728736;
  collect.collection_id = 841564295;
  await collect.save({
    update: true,
  });
  ```

  #### response

  ```json
  HTTP/1.1 201 Created{"collect":{"id":1071559574,"collection_id":841564295,"product_id":921728736,"created_at":"2025-10-01T15:07:14-04:00","updated_at":"2025-10-01T15:07:14-04:00","position":2,"sort_value":"0000000002"}}
  ```

* #### Creating a collect without a product or collection ID fails and returns an error

  #####

  ```curl
  curl -d '{"collect":{"body":"foobar"}}' \
  -X POST "https://your-development-store.myshopify.com/admin/api/2025-10/collects.json" \
  -H "X-Shopify-Access-Token: {access_token}" \
  -H "Content-Type: application/json"
  ```

  #####

  ```remix
  const { admin, session } = await authenticate.admin(request);

  const collect = new admin.rest.resources.Collect({session: session});

  collect.body = "foobar";
  await collect.save({
    update: true,
  });
  ```

  #####

  ```ruby
  # Session is activated via Authentication
  test_session = ShopifyAPI::Context.active_session

  collect = ShopifyAPI::Collect.new(session: test_session)
  collect.body = "foobar"
  collect.save!
  ```

  #####

  ```node
  // Session is built by the OAuth process

  const collect = new shopify.rest.Collect({session: session});
  collect.body = "foobar";
  await collect.save({
    update: true,
  });
  ```

  #### response

  ```json
  HTTP/1.1 422 Unprocessable Entity{"errors":{"product":["can't be blank"],"collection":["can't be blank"],"product_id":["must belong to John Smith Test Store"],"collection_id":["must belong to John Smith Test Store"]}}
  ```

***

## getRetrieves a list of collects

[collection](https://shopify.dev/docs/api/admin-graphql/latest/queries/collection)

[product](https://shopify.dev/docs/api/admin-graphql/latest/queries/product)

Retrieves a list of collects. **Note:** This endpoint implements pagination by using links that are provided in the response header. To learn more, refer to [Make paginated requests to the REST Admin API](https://shopify.dev/api/usage/pagination-rest).

### Parameters

***

api\_version

string

required

***

fields

Show only certain fields, specified by a comma-separated list of field names.

***

limit

≤ 250

default 50

The maximum number of results to show.

***

since\_id

Restrict results to after the specified ID.

***

### Examples

Retrieve all collects for the shop

Retrieve only collects for a certain collection

Query parameters

collection\_​id=​841564295

The ID of the custom collection containing the product.

Retrieve only collects for a certain product

Query parameters

product\_​id=​632910392

The unique numeric identifier for the product in the custom collection.

get

## /admin/api/2025-10/collects.​json

```bash
curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collects.json" \
-H "X-Shopify-Access-Token: {access_token}"
```

{}

## Response

JSON

```json
HTTP/1.1 200 OK
{
  "collects": [
    {
      "id": 455204334,
      "collection_id": 841564295,
      "product_id": 632910392,
      "created_at": null,
      "updated_at": null,
      "position": 1,
      "sort_value": "0000000001"
    },
    {
      "id": 773559378,
      "collection_id": 395646240,
      "product_id": 632910392,
      "created_at": null,
      "updated_at": null,
      "position": 1,
      "sort_value": "0000000001"
    }
  ]
}
```

### examples

* #### Retrieve all collects for the shop

  #####

  ```curl
  curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collects.json" \
  -H "X-Shopify-Access-Token: {access_token}"
  ```

  #####

  ```remix
  await admin.rest.resources.Collect.all({
    session: session,
  });
  ```

  #####

  ```ruby
  # Session is activated via Authentication
  test_session = ShopifyAPI::Context.active_session

  ShopifyAPI::Collect.all(
    session: test_session,
  )
  ```

  #####

  ```node
  // Session is built by the OAuth process

  await shopify.rest.Collect.all({
    session: session,
  });
  ```

  #### response

  ```json
  HTTP/1.1 200 OK{"collects":[{"id":455204334,"collection_id":841564295,"product_id":632910392,"created_at":null,"updated_at":null,"position":1,"sort_value":"0000000001"},{"id":773559378,"collection_id":395646240,"product_id":632910392,"created_at":null,"updated_at":null,"position":1,"sort_value":"0000000001"}]}
  ```

* #### Retrieve only collects for a certain collection

  #####

  ```curl
  curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collects.json?collection_id=841564295" \
  -H "X-Shopify-Access-Token: {access_token}"
  ```

  #####

  ```remix
  await admin.rest.resources.Collect.all({
    session: session,
    collection_id: "841564295",
  });
  ```

  #####

  ```ruby
  # Session is activated via Authentication
  test_session = ShopifyAPI::Context.active_session

  ShopifyAPI::Collect.all(
    session: test_session,
    collection_id: "841564295",
  )
  ```

  #####

  ```node
  // Session is built by the OAuth process

  await shopify.rest.Collect.all({
    session: session,
    collection_id: "841564295",
  });
  ```

  #### response

  ```json
  HTTP/1.1 200 OK{"collects":[{"id":455204334,"collection_id":841564295,"product_id":632910392,"created_at":null,"updated_at":null,"position":1,"sort_value":"0000000001"},{"id":1071559575,"collection_id":841564295,"product_id":921728736,"created_at":"2025-10-01T15:07:15-04:00","updated_at":"2025-10-01T15:07:15-04:00","position":2,"sort_value":"0000000002"}]}
  ```

* #### Retrieve only collects for a certain product

  #####

  ```curl
  curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collects.json?product_id=632910392" \
  -H "X-Shopify-Access-Token: {access_token}"
  ```

  #####

  ```remix
  await admin.rest.resources.Collect.all({
    session: session,
    product_id: "632910392",
  });
  ```

  #####

  ```ruby
  # Session is activated via Authentication
  test_session = ShopifyAPI::Context.active_session

  ShopifyAPI::Collect.all(
    session: test_session,
    product_id: "632910392",
  )
  ```

  #####

  ```node
  // Session is built by the OAuth process

  await shopify.rest.Collect.all({
    session: session,
    product_id: "632910392",
  });
  ```

  #### response

  ```json
  HTTP/1.1 200 OK{"collects":[{"id":455204334,"collection_id":841564295,"product_id":632910392,"created_at":null,"updated_at":null,"position":1,"sort_value":"0000000001"},{"id":773559378,"collection_id":395646240,"product_id":632910392,"created_at":null,"updated_at":null,"position":1,"sort_value":"0000000001"}]}
  ```

***

## getRetrieves a specific collect by its IDdeprecated

Retrieves a specific collect by its ID.

### Parameters

***

api\_version

string

required

***

collect\_id

string

required

***

fields

Show only certain fields, specified by a comma-separated list of field names.

***

### Examples

Retrieve a collect with a certain ID

Path parameters

collect\_​id=​455204334

string

required

get

## /admin/api/2025-10/collects/455204334.​json

```bash
curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collects/455204334.json" \
-H "X-Shopify-Access-Token: {access_token}"
```

{}

## Response

JSON

```json
HTTP/1.1 200 OK
{
  "collect": {
    "id": 455204334,
    "collection_id": 841564295,
    "product_id": 632910392,
    "created_at": null,
    "updated_at": null,
    "position": 1,
    "sort_value": "0000000001"
  }
}
```

### examples

* #### Retrieve a collect with a certain ID

  #####

  ```curl
  curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collects/455204334.json" \
  -H "X-Shopify-Access-Token: {access_token}"
  ```

  #####

  ```remix
  await admin.rest.resources.Collect.find({
    session: session,
    id: 455204334,
  });
  ```

  #####

  ```ruby
  # Session is activated via Authentication
  test_session = ShopifyAPI::Context.active_session

  ShopifyAPI::Collect.find(
    session: test_session,
    id: 455204334,
  )
  ```

  #####

  ```node
  // Session is built by the OAuth process

  await shopify.rest.Collect.find({
    session: session,
    id: 455204334,
  });
  ```

  #### response

  ```json
  HTTP/1.1 200 OK{"collect":{"id":455204334,"collection_id":841564295,"product_id":632910392,"created_at":null,"updated_at":null,"position":1,"sort_value":"0000000001"}}
  ```

***

## getRetrieves a count of collects

[collection](https://shopify.dev/docs/api/admin-graphql/latest/queries/collection)

Retrieves a count of collects.

### Parameters

***

api\_version

string

required

***

### Examples

Count all collects for the shop

Count only collects for a certain collection

Query parameters

collection\_​id=​841564295

The ID of the custom collection containing the product.

Count only collects for a certain product

Query parameters

product\_​id=​632910392

The unique numeric identifier for the product in the custom collection.

get

## /admin/api/2025-10/collects/count.​json

```bash
curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collects/count.json" \
-H "X-Shopify-Access-Token: {access_token}"
```

{}

## Response

JSON

```json
HTTP/1.1 200 OK
{
  "count": 2
}
```

### examples

* #### Count all collects for the shop

  #####

  ```curl
  curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collects/count.json" \
  -H "X-Shopify-Access-Token: {access_token}"
  ```

  #####

  ```remix
  await admin.rest.resources.Collect.count({
    session: session,
  });
  ```

  #####

  ```ruby
  # Session is activated via Authentication
  test_session = ShopifyAPI::Context.active_session

  ShopifyAPI::Collect.count(
    session: test_session,
  )
  ```

  #####

  ```node
  // Session is built by the OAuth process

  await shopify.rest.Collect.count({
    session: session,
  });
  ```

  #### response

  ```json
  HTTP/1.1 200 OK{"count":2}
  ```

* #### Count only collects for a certain collection

  #####

  ```curl
  curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collects/count.json?collection_id=841564295" \
  -H "X-Shopify-Access-Token: {access_token}"
  ```

  #####

  ```remix
  await admin.rest.resources.Collect.count({
    session: session,
    collection_id: "841564295",
  });
  ```

  #####

  ```ruby
  # Session is activated via Authentication
  test_session = ShopifyAPI::Context.active_session

  ShopifyAPI::Collect.count(
    session: test_session,
    collection_id: "841564295",
  )
  ```

  #####

  ```node
  // Session is built by the OAuth process

  await shopify.rest.Collect.count({
    session: session,
    collection_id: "841564295",
  });
  ```

  #### response

  ```json
  HTTP/1.1 200 OK{"count":1}
  ```

* #### Count only collects for a certain product

  #####

  ```curl
  curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collects/count.json?product_id=632910392" \
  -H "X-Shopify-Access-Token: {access_token}"
  ```

  #####

  ```remix
  await admin.rest.resources.Collect.count({
    session: session,
    product_id: "632910392",
  });
  ```

  #####

  ```ruby
  # Session is activated via Authentication
  test_session = ShopifyAPI::Context.active_session

  ShopifyAPI::Collect.count(
    session: test_session,
    product_id: "632910392",
  )
  ```

  #####

  ```node
  // Session is built by the OAuth process

  await shopify.rest.Collect.count({
    session: session,
    product_id: "632910392",
  });
  ```

  #### response

  ```json
  HTTP/1.1 200 OK{"count":2}
  ```

***

## delRemoves a product from a collection

[collectionRemoveProducts](https://shopify.dev/docs/api/admin-graphql/latest/mutations/collectionRemoveProducts?example=removes-a-product-from-a-collection)

Removes a product from a collection.

### Parameters

***

api\_version

string

required

***

collect\_id

string

required

***

### Examples

Delete the link between a product an a collection

Path parameters

collect\_​id=​455204334

string

required

del

## /admin/api/2025-10/collects/455204334.​json

```bash
curl -X DELETE "https://your-development-store.myshopify.com/admin/api/2025-10/collects/455204334.json" \
-H "X-Shopify-Access-Token: {access_token}"
```

{}

## Response

JSON

```json
HTTP/1.1 200 OK
{}
```

### examples

* #### Delete the link between a product an a collection

  #####

  ```curl
  curl -X DELETE "https://your-development-store.myshopify.com/admin/api/2025-10/collects/455204334.json" \
  -H "X-Shopify-Access-Token: {access_token}"
  ```

  #####

  ```remix
  await admin.rest.resources.Collect.delete({
    session: session,
    id: 455204334,
  });
  ```

  #####

  ```ruby
  # Session is activated via Authentication
  test_session = ShopifyAPI::Context.active_session

  ShopifyAPI::Collect.delete(
    session: test_session,
    id: 455204334,
  )
  ```

  #####

  ```node
  // Session is built by the OAuth process

  await shopify.rest.Collect.delete({
    session: session,
    id: 455204334,
  });
  ```

  #### response

  ```json
  HTTP/1.1 200 OK{}
  ```

  ##########################################################

  ---
title: Collection
description: >-
  Manage a store's collections. A collectionis a grouping of products that
  merchants can create to make their stores  easier to browse.
api_version: 2025-10
api_name: admin-rest
api_type: rest
source_url:
  html: 'https://shopify.dev/docs/api/admin-rest/latest/resources/collection'
  md: 'https://shopify.dev/docs/api/admin-rest/latest/resources/collection.md'
---

The REST Admin API is a legacy API as of October 1, 2024. Starting April 1, 2025, all new public apps must be built exclusively with the [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql). For details and migration steps, visit our [migration guide](https://shopify.dev/docs/apps/build/graphql/migrate).

# Collection

Requires `products` access scope.

A collection is a grouping of products that merchants can create to make their stores easier to browse. For example, a merchant might create a collection for a specific type of product that they sell, such as **Footwear**. Merchants can create collections by selecting products individually or by defining rules that automatically determine whether products are included.

Shopify stores start with a single collection, called **Frontpage**. This is a collection of products that are shown on the front page of the online store.

There are two different types of collection:

* **Custom collections**, which contain products that are manually added to a collection by a merchant. For more information, see the [CustomCollection](https://shopify.dev/docs/admin-api/rest/reference/products/customcollection) resource.
* **Smart collections**, which contain products that are automatically added based on selection conditions that a merchant chooses. For more information, see the [SmartCollection](https://shopify.dev/docs/admin-api/rest/reference/products/smartcollection) resource.

The [Collect](https://shopify.dev/docs/admin-api/rest/reference/products/collect) resource is used to connect a product to a [custom collection](https://shopify.dev/docs/admin-api/rest/reference/products/customcollection).

\#

## Endpoints

* [get](https://shopify.dev/docs/api/admin-rest/latest/resources/collection.md#get-collections-collection-id)

  [/admin/api/latest/collections/{collection\_​id}.​json](https://shopify.dev/docs/api/admin-rest/latest/resources/collection.md#get-collections-collection-id)

  Retrieves a single collection

  [collection](https://shopify.dev/docs/api/admin-graphql/latest/queries/collection)

* [get](https://shopify.dev/docs/api/admin-rest/latest/resources/collection.md#get-collections-collection-id-products)

  [/admin/api/latest/collections/{collection\_​id}/products.​json](https://shopify.dev/docs/api/admin-rest/latest/resources/collection.md#get-collections-collection-id-products)

  Retrieve a list of products belonging to a collection

  [collection](https://shopify.dev/docs/api/admin-graphql/latest/queries/collection)

***

## The Collection resource

### Properties

***

body\_html

->[descriptionHtml](https://shopify.dev/docs/api/admin-graphql/latest/objects/Collection#field-Collection.fields.descriptionHtml)

A description of the collection, complete with HTML markup. Many templates display this on their collection pages.

***

handle

->[handle](https://shopify.dev/docs/api/admin-graphql/latest/objects/Collection#field-Collection.fields.handle)

A unique, human-readable string for the collection automatically generated from its title. This is used in themes by the Liquid templating language to refer to the collection. (limit: 255 characters)

***

image

->[image](https://shopify.dev/docs/api/admin-graphql/latest/objects/Collection#field-Collection.fields.image)

Image associated with the collection. Valid values are:

Show image properties

* **attachment**: An image attached to a collection returned as Base64-encoded binary data.
* **src**: The source URL that specifies the location of the image.
* **alt**: The alternative text that describes the collection image.
* **created\_at**: The time and date ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format) when the image was added to the collection.
* **width**: The width of the image in pixels.
* **height**: The height of the image in pixels.

***

id

read-only

->[id](https://shopify.dev/docs/api/admin-graphql/latest/objects/Collection#field-Collection.fields.id)

The ID for the collection.

***

published\_at

read-only

->[publishDate](https://shopify.dev/docs/api/admin-graphql/latest/objects/ResourcePublication#field-ResourcePublication.fields.publishDate)

The time and date ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format) when the collection was made visible. Returns `null` for a hidden collection.

***

published\_scope

read-only

->[publishable](https://shopify.dev/docs/api/admin-graphql/latest/objects/ResourcePublication#field-ResourcePublication.fields.publishable)

Whether the collection is published to the Point of Sale channel. Valid values:

Show published\_scope properties

* `web`: The collection is published to the Online Store channel but not published to the Point of Sale channel.
* `global`: The collection is published to both the Online Store channel and the Point of Sale channel.

***

sort\_order

->[sortOrder](https://shopify.dev/docs/api/admin-graphql/latest/objects/Collection#field-Collection.fields.sortOrder)

The order in which products in the collection appear. Valid values:

Show sort\_order properties

* **alpha-asc**: Alphabetically, in ascending order (A - Z).
* **alpha-desc**: Alphabetically, in descending order (Z - A).
* **best-selling**: By best-selling products.
* **created**: By date created, in ascending order (oldest - newest).
* **created-desc**: By date created, in descending order (newest - oldest).
* **manual**: In the order set manually by the shop owner.
* **price-asc**: By price, in ascending order (lowest - highest).
* **price-desc**: By price, in descending order (highest - lowest).

***

template\_suffix

->[templateSuffix](https://shopify.dev/docs/api/admin-graphql/latest/objects/Collection#field-Collection.fields.templateSuffix)

The suffix of the liquid template being used. For example, if the value is `custom`, then the collection is using the `collection.custom.liquid` template. If the value is `null`, then the collection is using the default `collection.liquid`.

***

title

->[title](https://shopify.dev/docs/api/admin-graphql/latest/objects/Collection#field-Collection.fields.title)

The name of the collection. (limit: 255 characters)

***

updated\_at

read-only

->[updatedAt](https://shopify.dev/docs/api/admin-graphql/latest/objects/Collection#field-Collection.fields.updatedAt)

The date and time ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format) when the collection was last modified.

***

{}

## The Collection resource

```json
{
  "body_html": "<p>The best selling iPods ever</p>",
  "handle": "ipods",
  "image": {
    "src": "http://static.shopify.com/collections/ipod.jpg?0",
    "alt": "iPods",
    "width": 500,
    "height": 488,
    "created_at": "2018-04-19T09:34:47-04:00"
  },
  "id": 841564295,
  "published_at": "2008-02-01T19:00:00-05:00",
  "published_scope": "global",
  "sort_order": "manual",
  "template_suffix": "custom",
  "title": "IPods",
  "updated_at": "2008-02-01T19:00:00-05:00"
}
```

***

## getRetrieves a single collection

[collection](https://shopify.dev/docs/api/admin-graphql/latest/queries/collection)

Retrieves a single collection

### Parameters

***

api\_version

string

required

***

collection\_id

string

required

***

fields

Show only certain fields, specified by a comma-separated list of field names.

***

### Examples

Retrieve a specific collection by its ID

Path parameters

collection\_​id=​841564295

string

required

get

## /admin/api/2025-10/collections/841564295.​json

```bash
curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collections/841564295.json" \
-H "X-Shopify-Access-Token: {access_token}"
```

{}

## Response

JSON

```json
HTTP/1.1 200 OK
{
  "collection": {
    "id": 841564295,
    "handle": "ipods",
    "title": "IPods",
    "updated_at": "2008-02-01T19:00:00-05:00",
    "body_html": "<p>The best selling ipod ever</p>",
    "published_at": "2008-02-01T19:00:00-05:00",
    "sort_order": "manual",
    "template_suffix": null,
    "products_count": 1,
    "collection_type": "custom",
    "published_scope": "web",
    "admin_graphql_api_id": "gid://shopify/Collection/841564295",
    "image": {
      "created_at": "2025-10-01T15:04:04-04:00",
      "alt": "MP3 Player 8gb",
      "width": 123,
      "height": 456,
      "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/collections/ipod_nano_8gb.jpg?v=1759345444"
    }
  }
}
```

### examples

* #### Retrieve a specific collection by its ID

  #####

  ```curl
  curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collections/841564295.json" \
  -H "X-Shopify-Access-Token: {access_token}"
  ```

  #####

  ```remix
  await admin.rest.resources.Collection.find({
    session: session,
    id: 841564295,
  });
  ```

  #####

  ```ruby
  # Session is activated via Authentication
  test_session = ShopifyAPI::Context.active_session

  ShopifyAPI::Collection.find(
    session: test_session,
    id: 841564295,
  )
  ```

  #####

  ```node
  // Session is built by the OAuth process

  await shopify.rest.Collection.find({
    session: session,
    id: 841564295,
  });
  ```

  #### response

  ```json
  HTTP/1.1 200 OK{"collection":{"id":841564295,"handle":"ipods","title":"IPods","updated_at":"2008-02-01T19:00:00-05:00","body_html":"<p>The best selling ipod ever</p>","published_at":"2008-02-01T19:00:00-05:00","sort_order":"manual","template_suffix":null,"products_count":1,"collection_type":"custom","published_scope":"web","admin_graphql_api_id":"gid://shopify/Collection/841564295","image":{"created_at":"2025-10-01T15:04:04-04:00","alt":"MP3 Player 8gb","width":123,"height":456,"src":"https://cdn.shopify.com/s/files/1/0005/4838/0009/collections/ipod_nano_8gb.jpg?v=1759345444"}}}
  ```

***

## getRetrieve a list of products belonging to a collection

[collection](https://shopify.dev/docs/api/admin-graphql/latest/queries/collection)

Retrieve a list of products belonging to a collection. **Note:** This endpoint implements pagination by using links that are provided in the response header. To learn more, refer to [Make paginated requests to the REST Admin API](https://shopify.dev/api/usage/pagination-rest).. The products returned are sorted by the collection's sort order.

### Parameters

***

api\_version

string

required

***

collection\_id

string

required

***

limit

≤ 250

default 50

The number of products to retrieve.

***

### Examples

Retrieve a list of products belonging to a collection

Path parameters

collection\_​id=​841564295

string

required

get

## /admin/api/2025-10/collections/841564295/products.​json

```bash
curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collections/841564295/products.json" \
-H "X-Shopify-Access-Token: {access_token}"
```

{}

## Response

JSON

```json
HTTP/1.1 200 OK
{
  "products": [
    {
      "id": 632910392,
      "title": "IPod Nano - 8GB",
      "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>",
      "vendor": "Apple",
      "product_type": "Cult Products",
      "created_at": "2025-10-01T15:04:04-04:00",
      "handle": "ipod-nano",
      "updated_at": "2025-10-01T15:04:04-04:00",
      "published_at": "2007-12-31T19:00:00-05:00",
      "template_suffix": null,
      "published_scope": "web",
      "tags": "Emotive, Flash Memory, MP3, Music",
      "status": "active",
      "admin_graphql_api_id": "gid://shopify/Product/632910392",
      "options": [
        {
          "id": 594680422,
          "product_id": 632910392,
          "name": "Color",
          "position": 1
        }
      ],
      "images": [
        {
          "id": 850703190,
          "alt": null,
          "position": 1,
          "product_id": 632910392,
          "created_at": "2025-10-01T15:04:04-04:00",
          "updated_at": "2025-10-01T15:04:04-04:00",
          "admin_graphql_api_id": "gid://shopify/MediaImage/498048120",
          "width": 123,
          "height": 456,
          "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1759345444"
        },
        {
          "id": 562641783,
          "alt": null,
          "position": 2,
          "product_id": 632910392,
          "created_at": "2025-10-01T15:04:04-04:00",
          "updated_at": "2025-10-01T15:04:04-04:00",
          "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486",
          "width": 123,
          "height": 456,
          "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1759345444"
        },
        {
          "id": 378407906,
          "alt": null,
          "position": 3,
          "product_id": 632910392,
          "created_at": "2025-10-01T15:04:04-04:00",
          "updated_at": "2025-10-01T15:04:04-04:00",
          "admin_graphql_api_id": "gid://shopify/MediaImage/220090436",
          "width": 123,
          "height": 456,
          "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1759345444"
        }
      ],
      "image": {
        "id": 850703190,
        "alt": null,
        "position": 1,
        "product_id": 632910392,
        "created_at": "2025-10-01T15:04:04-04:00",
        "updated_at": "2025-10-01T15:04:04-04:00",
        "admin_graphql_api_id": "gid://shopify/MediaImage/498048120",
        "width": 123,
        "height": 456,
        "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1759345444"
      }
    }
  ]
}
```

### examples

* #### Retrieve a list of products belonging to a collection

  #####

  ```curl
  curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-10/collections/841564295/products.json" \
  -H "X-Shopify-Access-Token: {access_token}"
  ```

  #####

  ```remix
  await admin.rest.resources.Collection.products({
    session: session,
    id: 841564295,
  });
  ```

  #####

  ```ruby
  # Session is activated via Authentication
  test_session = ShopifyAPI::Context.active_session

  ShopifyAPI::Collection.products(
    session: test_session,
    id: 841564295,
  )
  ```

  #####

  ```node
  // Session is built by the OAuth process

  await shopify.rest.Collection.products({
    session: session,
    id: 841564295,
  });
  ```

  #### response

  ```json
  HTTP/1.1 200 OK{"products":[{"id":632910392,"title":"IPod Nano - 8GB","body_html":"<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>","vendor":"Apple","product_type":"Cult Products","created_at":"2025-10-01T15:04:04-04:00","handle":"ipod-nano","updated_at":"2025-10-01T15:04:04-04:00","published_at":"2007-12-31T19:00:00-05:00","template_suffix":null,"published_scope":"web","tags":"Emotive, Flash Memory, MP3, Music","status":"active","admin_graphql_api_id":"gid://shopify/Product/632910392","options":[{"id":594680422,"product_id":632910392,"name":"Color","position":1}],"images":[{"id":850703190,"alt":null,"position":1,"product_id":632910392,"created_at":"2025-10-01T15:04:04-04:00","updated_at":"2025-10-01T15:04:04-04:00","admin_graphql_api_id":"gid://shopify/MediaImage/498048120","width":123,"height":456,"src":"https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1759345444"},{"id":562641783,"alt":null,"position":2,"product_id":632910392,"created_at":"2025-10-01T15:04:04-04:00","updated_at":"2025-10-01T15:04:04-04:00","admin_graphql_api_id":"gid://shopify/MediaImage/1071517486","width":123,"height":456,"src":"https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1759345444"},{"id":378407906,"alt":null,"position":3,"product_id":632910392,"created_at":"2025-10-01T15:04:04-04:00","updated_at":"2025-10-01T15:04:04-04:00","admin_graphql_api_id":"gid://shopify/MediaImage/220090436","width":123,"height":456,"src":"https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1759345444"}],"image":{"id":850703190,"alt":null,"position":1,"product_id":632910392,"created_at":"2025-10-01T15:04:04-04:00","updated_at":"2025-10-01T15:04:04-04:00","admin_graphql_api_id":"gid://shopify/MediaImage/498048120","width":123,"height":456,"src":"https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1759345444"}}]}
  ```

  