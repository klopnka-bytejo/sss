import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceId, selectedOptions } = body

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // Get service base price
    const serviceResult = await sql`
      SELECT id, name, base_price_cents, pricing_type
      FROM game_services
      WHERE id = ${serviceId}
    `

    if (!serviceResult || serviceResult.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const service = serviceResult[0]
    let finalPrice = service.base_price_cents

    // If fixed pricing, return base price
    if (service.pricing_type === 'fixed') {
      return NextResponse.json({
        basePrice: service.base_price_cents,
        finalPrice: service.base_price_cents,
        breakdown: [{ label: service.name, amount: service.base_price_cents }],
        success: true
      })
    }

    // Calculate dynamic price based on selected options
    const breakdown: { label: string; amount: number; modifier: number }[] = [
      { label: 'Base Price', amount: service.base_price_cents, modifier: 1 }
    ]

    if (selectedOptions && typeof selectedOptions === 'object') {
      // Get all selected option modifiers
      const optionIds = Object.values(selectedOptions).flat().filter(Boolean) as string[]
      
      if (optionIds.length > 0) {
        const optionsResult = await sql`
          SELECT id, option_type, label, value, price_modifier
          FROM service_options
          WHERE service_id = ${serviceId} AND value = ANY(${optionIds})
        `

        let multiplier = 1
        
        for (const option of optionsResult || []) {
          const modifier = parseFloat(option.price_modifier) || 1
          
          // Addons are additive (like 10% extra)
          if (option.option_type === 'addon') {
            const addonAmount = Math.round(service.base_price_cents * modifier)
            finalPrice += addonAmount
            breakdown.push({
              label: option.label,
              amount: addonAmount,
              modifier
            })
          } else {
            // Other options are multiplicative
            multiplier *= modifier
          }
        }

        // Apply multiplier to base price
        if (multiplier !== 1) {
          const multipliedPrice = Math.round(service.base_price_cents * multiplier)
          const difference = multipliedPrice - service.base_price_cents
          finalPrice = multipliedPrice + (finalPrice - service.base_price_cents) // Add addon amounts
          
          if (difference !== 0) {
            breakdown.push({
              label: 'Options Adjustment',
              amount: difference,
              modifier: multiplier
            })
          }
        }
      }
    }

    return NextResponse.json({
      basePrice: service.base_price_cents,
      finalPrice: Math.max(finalPrice, service.base_price_cents), // Never go below base
      breakdown,
      success: true
    })
  } catch (error) {
    console.error('[v0] Calculate price error:', error)
    return NextResponse.json({ error: 'Failed to calculate price' }, { status: 500 })
  }
}
