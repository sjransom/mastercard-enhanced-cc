const forge = require("node-forge");
const fs = require("fs");
const axios = require("axios");

const p12Content = fs.readFileSync(
  "MCD_Sandbox_enhanced-cc_API_Keys/enhanced-cc-sandbox.p12",
  "binary"
);
const p12Asn1 = forge.asn1.fromDer(p12Content, false);
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, "keystorepassword");
const keyObj = p12.getBags({
  friendlyName: "keyalias",
  bagType: forge.pki.oids.pkcs8ShroudedKeyBag
}).friendlyName[0];
const signingKey = forge.pki.privateKeyToPem(keyObj.key);

const consumerKey = "KEY";
const uri = "https://sandbox.api.mastercard.com";
const method = "GET";
const payload = "";

const oauth = require("mastercard-oauth1-signer");
const authHeader = oauth.getAuthorizationHeader(
  uri,
  method,
  payload,
  consumerKey,
  signingKey
);

console.log(authHeader);

async function getInfo() {
  try {
    const response = await axios.get(
      "https://sandbox.api.mastercard.com/enhanced/settlement/currencyrate/subscribed/summary-rates?rate_date=2020-03-01&trans_curr=GBP&trans_amt=1000&crdhld_bill_curr=GBP&bank_fee_pct=1&bank_fee_fixed=0.5",
      {
        headers: {
          Authorization: authHeader
        }
      }
    );
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

getInfo();
