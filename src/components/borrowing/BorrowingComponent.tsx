'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAccount, useWallets } from '@particle-network/connectkit'
import { toast } from 'sonner'
import { klasterExecute, klasterQuote, klasterAccount } from '@/klaster'
import { ERC20ABI } from './abi'
import { Abi } from 'viem'
import { waitForTransactionReceipt } from "viem/actions"
import { useEthereum } from '@particle-network/authkit';

const tokens = [
  { symbol: 'ETH', name: 'Ethereum', rate: 1 },
  { symbol: 'USDC', name: 'USD Coin', rate: 1800 },
  { symbol: 'DAI', name: 'Dai', rate: 1800 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', rate: 30000 },
]

export default function BorrowingForm() {
  const [amount, setAmount] = useState('')
  const [borrowToken, setBorrowToken] = useState('')
  const [collateralToken, setCollateralToken] = useState('')
  const [collateralAmount, setCollateralAmount] = useState('0')
  const [wallet] = useWallets()
  const { address, chain } = useAccount()
  const { } = useEthereum()


  useEffect(() => {
    if (amount && borrowToken && collateralToken) {
      const borrowRate = tokens.find(t => t.symbol === borrowToken)?.rate || 1
      const collateralRate = tokens.find(t => t.symbol === collateralToken)?.rate || 1
      const collateral = ((parseFloat(amount) * borrowRate) / collateralRate * 1.5).toFixed(6) // 150% collateralization
      setCollateralAmount(collateral)
    } else {
      setCollateralAmount('0')
    }
  }, [amount, borrowToken, collateralToken])

  const transferTokenToKlaster = async (amount: number) => {
    const transfer = async () => {
      const klaster = await klasterAccount()
      const hash = await wallet.getWalletClient().writeContract({
        address: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`,
        abi: ERC20ABI as Abi,
        functionName: 'transfer',
        args: [klaster.account.getAddress(chain?.id!), BigInt(amount * (10 ** 6))],
        account: address as `0x${string}`,
        chain
      })

      await waitForTransactionReceipt(wallet.getWalletClient(), { hash, confirmations: 3 })
    }


    toast.promise(transfer(), {
      loading: 'Transfering to klaster...',
      success: (data) => {
        return `Transfered ${amount} to Klaster`
      },
      error: (err) => `Error: ${err.message}`,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const exexute = async () => {
      const quote = await klasterQuote(Number(amount));
      const gasFee = quote.paymentInfo?.tokenValue as string;
      const confirmation = confirm(`You need to transfer Amount: ${amount} + GasFee: ${gasFee} USDC from ETH to Arbitrium`);

      if (!confirmation) {
        return;
      }
      await transferTokenToKlaster(parseFloat(amount) + parseFloat(gasFee))

      await klasterExecute(quote);
    }
    toast.promise(exexute(), {
      loading: 'Transfering to Base Sepolia...',
      success: (data) => {
        return `Transfered ${amount} USDC from ETH to Base Sepolia`
      },
      error: (err) => `Error: ${err.message}`,
    })
  }

  return (
    <Card className="w-full max-w-md h-80">
      <div className='h-full flex flex-col justify-center'>
        <CardHeader>
          <CardTitle className='text-center text-3xl my-3 text-gray-600'>Klaster Bridge</CardTitle>
          <CardTitle>Bridge USDC Tokens</CardTitle>
          <CardDescription>Bridge USDC tokens from Sepolia to Base Sepolia</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="borrow-amount">Amount</Label>
              <Input
                id="borrow-amount"
                type="number"
                placeholder="Enter USDC amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Bridge</Button>
          </CardFooter>
        </form>
      </div>
    </Card>
  )
}