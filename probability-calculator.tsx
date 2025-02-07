"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CardRequirement {
  id: string
  name: string
  amount: number
  min: number
  max: number
}

export default function ProbabilityCalculator() {
  const [deckSize, setDeckSize] = useState(40)
  const [handSize, setHandSize] = useState(5)
  const [cardRequirements, setCardRequirements] = useState<CardRequirement[]>([])

  const addCardRequirement = () => {
    const newRequirement: CardRequirement = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      amount: 3,
      min: 1,
      max: 3,
    }
    setCardRequirements([...cardRequirements, newRequirement])
  }

  const removeCardRequirement = (id: string) => {
    setCardRequirements(cardRequirements.filter((card) => card.id !== id))
  }

  const updateCardRequirement = (id: string, field: keyof CardRequirement, value: string | number) => {
    setCardRequirements(
      cardRequirements.map((card) => {
        if (card.id === id) {
          return { ...card, [field]: value }
        }
        return card
      }),
    )
  }

  const nCr = (n: number, r: number): number => {
    if (r > n) return 0
    if (r === 0) return 1
    let result = 1
    for (let i = 1; i <= r; i++) {
      result *= (n - r + i) / i
    }
    return result
  }

  const calculateProbability = () => {
    if (cardRequirements.length === 0) return 100
    if (cardRequirements.length === 1) {
      const card = cardRequirements[0]
      let probability = 0
      for (let i = card.min; i <= Math.min(card.max, handSize, card.amount); i++) {
        probability += (nCr(card.amount, i) * nCr(deckSize - card.amount, handSize - i)) / nCr(deckSize, handSize)
      }
      return probability * 100
    }

    // For multiple requirements, use inclusion-exclusion principle
    let totalProb = 0
    let remainingDeck = deckSize
    let remainingHand = handSize

    const distribute = (index: number, currentProb: number, remainingDeck: number, remainingHand: number) => {
      if (index === cardRequirements.length) {
        if (remainingHand >= 0) {
          totalProb += currentProb * nCr(remainingDeck, remainingHand)
        }
        return
      }

      const card = cardRequirements[index]
      for (let i = card.min; i <= Math.min(card.max, remainingHand, card.amount); i++) {
        const prob = nCr(card.amount, i)
        if (prob === 0) continue
        distribute(
          index + 1,
          currentProb * prob,
          remainingDeck - card.amount,
          remainingHand - i
        )
      }
    }

    distribute(0, 1, remainingDeck, remainingHand)
    return (totalProb / nCr(deckSize, handSize)) * 100
  }

  const probability = calculateProbability()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Yu-Gi-Oh Deck Probability Calculator</CardTitle>
        <CardDescription>
          Calculate the probability of drawing specific combinations of cards in your opening hand.
          Perfect for optimizing deck ratios, sounding smart, and still losing because you play swordsoul.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deckSize">Deck Size</Label>
            <Input
              id="deckSize"
              type="number"
              min={40}
              max={60}
              value={deckSize}
              onChange={(e) => setDeckSize(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="handSize">Hand Size</Label>
            <Input
              id="handSize"
              type="number"
              min={1}
              value={handSize}
              onChange={(e) => setHandSize(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Card Requirements</h3>
            <Button 
              onClick={addCardRequirement} 
              variant="outline" 
              size="sm"
              disabled={cardRequirements.length >= 5}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Card
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Card Name</TableHead>
                <TableHead>Copies in Deck</TableHead>
                <TableHead>Min Needed</TableHead>
                <TableHead>Max Wanted</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cardRequirements.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>
                    <Input
                      value={card.name}
                      onChange={(e) => updateCardRequirement(card.id, "name", e.target.value)}
                      placeholder="Card Name"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      max={3}
                      value={card.amount}
                      onChange={(e) => updateCardRequirement(card.id, "amount", Number(e.target.value))}
                      className="w-16"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={card.amount}
                      value={card.min}
                      onChange={(e) => updateCardRequirement(card.id, "min", Number(e.target.value))}
                      className="w-16"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={card.min}
                      max={card.amount}
                      value={card.max}
                      onChange={(e) => updateCardRequirement(card.id, "max", Number(e.target.value))}
                      className="w-16"
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => removeCardRequirement(card.id)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="text-center space-y-2">
          <div className="text-xl font-medium">
            Opening Hand Probability
          </div>
          <div className="text-3xl font-bold text-green-600">
            {probability.toFixed(2)}%
          </div>
        </div>
      </CardContent>
    </Card>
  )
}