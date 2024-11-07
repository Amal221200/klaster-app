import {
    buildItx,
    buildMultichainReadonlyClient,
    buildRpcInfo,
    buildTokenMapping,
    deployment,
    encodeBridgingOps,
    initKlaster,
    klasterNodeHost,
    loadBicoV2Account,
    QuoteResponse,
    rawTx,
    singleTx,
} from "klaster-sdk";
import { encodeFunctionData, erc20Abi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, baseSepolia } from "viem/chains";
import { acrossBridgePlugin } from "./across-bridge-plugin";

const privateKey = '0x0effbd31e23ac864da269d33eec9128b6d600c0af3086598895593fc0fc384f4';
const signerAccount = privateKeyToAccount(privateKey);

export const klasterAccount = async () => {
    const address = signerAccount.address;

    const klaster = await initKlaster({
        accountInitData: loadBicoV2Account({
            owner: address
        }),
        nodeUrl: klasterNodeHost.default,
    });

    return klaster;
}

export const klasterQuote = async (usdcAmount: number) => {
    const destinationTokenAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

    const klaster = await klasterAccount();
    const mcClient = buildMultichainReadonlyClient([
        buildRpcInfo(sepolia.id, sepolia.rpcUrls.default.http[0]),
        buildRpcInfo(baseSepolia.id, baseSepolia.rpcUrls.default.http[0])
    ]);

    console.log("Multichain Client", mcClient);

    const mcUSDC = buildTokenMapping([
        deployment(sepolia.id, "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"),
        deployment(baseSepolia.id, "0x036CbD53842c5426634e7929541eC2318f3dCF7e")
    ]);

    console.log("Token mapping", mcUSDC);


    // const mcUSDC = buildTokenMapping([
    //     deployment(optimism.id, "0x<USDC-ON-OPTIMISM-ADDRESS>"),
    //     deployment(base.id, "0x<USDC-ON-OPTIMISM-ADDRESS>"),
    //   ]);

    const uBalance = await mcClient.getUnifiedErc20Balance({
        tokenMapping: mcUSDC,
        account: klaster.account,
    });

    console.log(uBalance);

    // console.log(BigInt(3000000));



    const bridgeingOps = await encodeBridgingOps({
        tokenMapping: mcUSDC,
        account: klaster.account,
        // amount: uBalance.balance - BigInt(parseInt("3", uBalance.decimals)),
        amount: BigInt(usdcAmount * (10 ** 6)),
        bridgePlugin: acrossBridgePlugin,
        client: mcClient,
        destinationChainId: baseSepolia.id,
        unifiedBalance: uBalance
    });

    console.log(bridgeingOps.totalReceivedOnDestination);


    const sendERC20Op = rawTx({
        gasLimit: 120000n,
        to: destinationTokenAddress,
        data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: [signerAccount.address, bridgeingOps.totalReceivedOnDestination]
        })
    });

    const itx = buildItx({
        steps: bridgeingOps.steps.concat(singleTx(baseSepolia.id, sendERC20Op)),
        feeTx: klaster.encodePaymentFee(sepolia.id, "USDC"),
    });

    const quote = await klaster.getQuote(itx);
    console.log("Quote", quote.paymentInfo);

    return quote
}

export async function klasterExecute(quote: QuoteResponse) {
    const klaster = await klasterAccount();
    const signed = await signerAccount.signMessage({
        message: {
            raw: quote.itxHash,
        },
    });



    const result = await klaster.execute(quote, signed);

    console.log(result.itxHash);


}
