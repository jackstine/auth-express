const Stripe = require("../apis/stripe");

let customerInfo = {
  email: "ecstaticjack@gmail.com",
  name: "jacob paul cukjati IV",
  payment_method: "pm_1IzAtGDlG9dGBqJOiF5vjYlQ",
  phone: "8503616563",
};

const subscription = {
  stripe_customer_id: "cus_JcPngpPXZnxu00",
  stripe_price_id: "price_1Iz8BlDlG9dGBqJOg0NMR7LX",
};

let card = {
  number: "4242424242424242",
  exp_month: 6,
  exp_year: 2022,
  cvc: "314",
};

let billing = {
  address: {
    city: "Atlanta",
    country: "US",
    line1: "214 7th Street",
    line2: "21 Apt",
    postal_code: "30304",
    state: "GA",
  },
  email: "ecstaticjack@gmail.com",
  name: "jacob paul cukjati IV",
  phone: "8503616563",
};

describe("#Stripe", function () {
  describe("#createCustomer", function () {
    it("should create a customer", function (done) {
      Stripe.getSubscription("sub_JdZesXf4Kefpwx").then((resp) => {
        console.log(resp);
        done();
      });
    });
  });
  describe("#createProduct", function () {
    it("should create products", function (done) {
      Stripe.createProduct().then((resp) => {
        console.log(resp);
        done();
      });
    });
  });
  describe("#createPrice", function () {
    it("should create products", function (done) {
      Stripe.createPrice().then((resp) => {
        console.log(resp);
        done();
      });
    });
  });
  describe("#signUpForSubscription", function () {
    it("should sign the user up for a subscription", function (done) {
      Stripe.signUpForSubscription(subscription).then((resp) => {
        console.log(resp);
        done();
      });
    });
  });
  describe("#getAllCustomers", function () {
    it("should get the customers", function (done) {
      Stripe.getAllCustomers().then((resp) => {
        console.log(resp);
        done();
      });
    });
  });
  describe("#createCardPaymentMethod", function () {
    it("should create a payment method", function (done) {
      let pmInfo = {
        card: { ...card },
        billing: { ...billing },
      };
      Stripe.createCardPaymentMethod(pmInfo)
        .then((resp) => {
          console.log(resp);
          done();
        })
        .catch(console.error);
    });
  });
  describe("#getInvoice", function () {
    it("should retrieve the invoice", function (done) {
      Stripe.getInvoice("in_1IzB0pDlG9dGBqJOcUVmrwkM")
        .then((resp) => {
          console.log(resp);
          done();
        })
        .catch(console.error);
    });
  });
  describe("#getPaymentIntent", function () {
    it("should retrieve the payment intent", function (done) {
      Stripe.getPaymentIntent("pi_1IzB0pDlG9dGBqJOQ52Cw8vd")
        .then((resp) => {
          console.log(resp);
          done();
        })
        .catch(console.error);
    });
  });
  describe("#getCustomer", function () {
    it("should retrieve the customer", function (done) {
      Stripe.getCustomer("cus_JdZebdrmjc2Lpg")
        .then((resp) => {
          console.log(resp);
          done();
        })
        .catch(console.error);
    });
  });
  describe("#createSourceForCustomer", function () {
    it("should set the source of the customer", function (done) {
      Stripe.createSourceForCustomer(
        "cus_JdZebdrmjc2Lpg",
        "src_1J0cfRDlG9dGBqJOe5Rlerbg"
      )
        .then((resp) => {
          console.log(resp);
          done();
        })
        .catch(console.error);
    });
  });
  describe("#attachPaymentMethod", function () {
    it("should set the source of the customer", function (done) {
      Stripe.attachPaymentMethod("sub_JdvT0kqaSeP3Mf", "", "cus_JdZebdrmjc2Lpg")
        .then((resp) => {
          console.log(resp);
          done();
        })
        .catch(console.error);
    });
  });
  describe("#getSource", function () {
    it("should get the source of the customer", function (done) {
      Stripe.getSource("cus_JdZebdrmjc2Lpg")
        .then((resp) => {
          console.log(resp);
          done();
        })
        .catch(console.error);
    });
  });
});
