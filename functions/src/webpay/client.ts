import {
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Options,
  WebpayPlus,
} from "transbank-sdk";

export function getWebpayTransaction() {
  return new WebpayPlus.Transaction(
    new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,
      "https://webpay3gint.transbank.cl",
    ),
  );
}
