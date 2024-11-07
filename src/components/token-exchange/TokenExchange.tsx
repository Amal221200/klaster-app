'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LendingForm from '@/components/lending/LendingComponents'
import BorrowingForm from '@/components/borrowing/BorrowingComponent'

export default function TokenExchangeTabs() {
  const [activeTab, setActiveTab] = useState('swap')

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="swap">Swap</TabsTrigger>
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
        </TabsList>
        <TabsContent value="swap">
          <LendingForm />
        </TabsContent>
        <TabsContent value="bridge">
          <BorrowingForm />
        </TabsContent>
      </Tabs>
    </>
  )
}