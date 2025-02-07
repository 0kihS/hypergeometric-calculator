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

  const totalCardsRequired = cardRequirements.reduce((sum, card) => sum + card.amount, 0)
  const isValidDeck = totalCardsRequired <= deckSize

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

  const calculateProbability = () => {
    if (cardRequirements.length === 0) return 100

    if (cardRequirements.length === 1) {
      const card = cardRequirements[0]
      let probability = 0
      for (let i = card.min; i <= Math.min(card.max, handSize, card.amount); i++) {
        probability += hypergeometricProbability(deckSize, card.amount, handSize, i)
      }
      return probability * 100
    }

    let totalValidCombinations = 0
    const totalPossibleCombinations = combinations(deckSize, handSize)

    const generateCombinations = (currentHand: number[], index: number, remainingHandSize: number) => {
      if (index === cardRequirements.length) {
        if (remainingHandSize === 0) {
          let waysToAchieveThis = 1
          let remainingDeckSize = deckSize

          cardRequirements.forEach((card, i) => {
            const copiesUsed = currentHand[i]
            waysToAchieveThis *= combinations(card.amount, copiesUsed)
            remainingDeckSize -= card.amount
          })

          if (remainingHandSize > 0) {
            waysToAchieveThis *= combinations(remainingDeckSize, remainingHandSize)
          }

          totalValidCombinations += waysToAchieveThis
        }
        return
      }

      const card = cardRequirements[index]
      const maxCopies = Math.min(card.max, card.amount, remainingHandSize)

      for (let copies = card.min; copies <= maxCopies; copies++) {
        currentHand[index] = copies
        generateCombinations(currentHand, index + 1, remainingHandSize - copies)
      }
    }

    generateCombinations(new Array(cardRequirements.length).fill(0), 0, handSize)

    return (totalValidCombinations / totalPossibleCombinations) * 100
  }

  const hypergeometricProbability = (N: number, K: number, n: number, k: number) => {
    return (combinations(K, k) * combinations(N - K, n - k)) / combinations(N, n)
  }

  const combinations = (n: number, r: number) => {
    if (r > n) return 0
    if (r === 0) return 1
    return factorial(n) / (factorial(r) * factorial(n - r))
  }

  const factorial = (n: number) => {
    if (n === 0) return 1
    let result = 1
    for (let i = 2; i <= n; i++) result *= i
    return result
  }

  const probability = calculateProbability()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Yu-Gi-Oh Deck Probability Calculator</CardTitle>
        <CardDescription>
          Easily improve your deck with the power of math! This calculator lets you find the chance of opening your key
          combos, letting you make better decisions during deck-building.
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
              max={7}
              value={handSize}
              onChange={(e) => setHandSize(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Card Requirements</h3>
            <Button onClick={addCardRequirement} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Card
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Card Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Min</TableHead>
                <TableHead>Max</TableHead>
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

        {!isValidDeck && <div className="text-red-500 text-center">Total cards required exceeds deck size!</div>}

        <div className="text-center text-xl font-medium">
          {isValidDeck ? (
            <>
              You have a{" "}
              <span className="text-green-600 font-bold">{Math.min(100, Math.max(0, probability)).toFixed(2)}%</span>{" "}
              chance to open this hand.
            </>
          ) : (
            <span className="text-red-600">Please fix deck configuration</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

