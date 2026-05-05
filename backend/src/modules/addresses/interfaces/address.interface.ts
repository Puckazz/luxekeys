import { Prisma } from '../../../generated/prisma/index.js';

export const ADDRESS_INCLUDE = {} satisfies Prisma.AddressInclude;

export type AddressDetail = Prisma.AddressGetPayload<{
  include: typeof ADDRESS_INCLUDE;
}>;
