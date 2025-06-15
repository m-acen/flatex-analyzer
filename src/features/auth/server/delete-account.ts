"use server";

import { logtoConfig } from "../logto-config";
import { adminConfig } from "../admin-config";

const logtoEndpoint = logtoConfig.endpoint;
const tokenEndpoint = `${logtoEndpoint}/oidc/token`;
const applicationId = adminConfig.appId;
const applicationSecret = adminConfig.appSecret;
const tenantId = 'your-tenant-id';

// WIP
const fetchAccessToken = async () => {
  return await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${applicationId}:${applicationSecret}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      resource: "https://shopping.api",
      scope: "read:products write:products",
    }).toString(),
  });
};
