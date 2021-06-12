const HB = require("../../serverlogic/handlebars/hb");

describe("HB", function () {
  describe("#createHTML", function () {
    it("should read the html File", function (done) {
      let pathToVF = "src/static/VerificationEmail.hbs";
      HB.createHTML(pathToVF, {
        name: "jake",
        company: "Test Corp",
        verificationLink: "google.com",
      })
        .then((raw) => {
          console.log(raw);
          done();
        })
        .catch(console.error);
    });
  });
});
