import type { IdentifierGeneratorPort } from "@/modules/leave/application/ports/outbound/identifier-generator-port";

export const cryptoIdentifierGenerator: IdentifierGeneratorPort = {
  generate(prefix) {
    return `${prefix}_${crypto.randomUUID()}`;
  },
};
