'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAccount } from '@particle-network/connectkit'
import { uniswap } from '@/klaster/uniswap'
import { toast } from 'sonner'

// Mock token data
const tokens = [
  { symbol: 'ETH', name: 'Ethereum', rate: 1 },
  { symbol: 'USDC', name: 'USD Coin', rate: 1800 },
  { symbol: 'DAI', name: 'Dai', rate: 1800 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', rate: 30000 },
]

export default function LendingForm() {
  const [amount, setAmount] = useState('')
  const [haveToken, setHaveToken] = useState('')
  const [lendToken, setLendToken] = useState('')
  const [convertedAmount, setConvertedAmount] = useState('0')

  useEffect(() => {
    if (amount && haveToken) {
      const haveRate = tokens.find(t => t.symbol === haveToken)?.rate || 1
      // const lendRate = tokens.find(t => t.symbol === lendToken)?.rate || 1
      // const converted = ((parseFloat(amount) * haveRate) / lendRate).toFixed(6)
      // setConvertedAmount(converted)
    } else {
      setConvertedAmount('0')
    }

  }, [amount, haveToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    toast.promise(uniswap(Number(amount)), {
      loading: 'Lending...',
      success: (data) => {
        console.log(data)
        return `Swap ${amount} ETH for ${data} Token`
      },
      error: (err) => `Error: ${err.message}`,
    })
  }

  return (
    <Card className="w-full max-w-md h-80">
      <div className='h-full flex flex-col justify-center'>
        <CardHeader>
          <CardTitle className='text-center text-3xl my-3 text-gray-600'>Klaster Swap</CardTitle>
          <CardTitle>Swap Tokens</CardTitle>
          <CardDescription>Convert your ETH into USDC.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Swap</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter eth amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                step="any"
              />
            </div>
            {amount && haveToken && lendToken && (
              <div className="text-sm text-muted-foreground">
                You will be able to lend approximately {convertedAmount} {lendToken}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Swap</Button>
          </CardFooter>
        </form>
      </div>
    </Card>
  )
}