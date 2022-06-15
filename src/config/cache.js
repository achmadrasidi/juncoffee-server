const { LocalStorage } = require("node-localstorage");

const userStorage = new LocalStorage("var/cache/image/user");
const productStorage = new LocalStorage("var/cache/image/product");
const promoStorage = new LocalStorage("var/cache/image/promo");

module.exports = { userStorage, productStorage, promoStorage };
