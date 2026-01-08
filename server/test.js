require("dotenv").config();
const { getProducts } = require("./scripts/woocommerce_api");

(async () => {
  try {
    const products = await getProducts({ per_page: 5 });
    console.log(products);
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
})();
