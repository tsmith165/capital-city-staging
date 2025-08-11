export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex", // This must match your JWT template name in Clerk
    },
  ],
};