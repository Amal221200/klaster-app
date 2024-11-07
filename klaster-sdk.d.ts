import { TxFeeParams } from "klaster-sdk";

// Extend the DefaultSession["user"] type with accessToken
declare module "klaster-sdk" {
    interface TxFeeParams {
        tokenValue: string;
        chainId: number;
        token: string;
    }
}