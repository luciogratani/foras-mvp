'use client'

import { useMemo, useState } from 'react'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
} from '@repo/ui'
import type { Allergen, MenuCategoryWithItems, MenuItem, MenuSection } from '@repo/supabase'

type Props = {
  sections: MenuSection[]
  categoriesBySection: Record<string, MenuCategoryWithItems[]>
  allergens: Allergen[]
}

export function MenuClient({ sections, categoriesBySection, allergens }: Props) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const allergensById = useMemo(
    () => new Map(allergens.map((a) => [a.id, a])),
    [allergens]
  )

  if (sections.length === 0) return null
  const defaultTab = sections[0]!.id

  const itemAllergens = (item: MenuItem | null): Allergen[] =>
    ((item?.allergen_ids as string[] | null) ?? [])
      .map((id) => allergensById.get(id))
      .filter((a): a is Allergen => Boolean(a))

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Menu</h2>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {sections.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {s.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((s) => {
          const categories = categoriesBySection[s.id] ?? []
          return (
            <TabsContent key={s.id} value={s.id} className="mt-6">
              {categories.length === 0 ? (
                <p className="text-muted-foreground">Nessun item disponibile in questa sezione.</p>
              ) : (
                <div className="space-y-8">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <h3 className="text-xl font-semibold mb-3">{cat.name}</h3>
                      {cat.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nessun item disponibile.</p>
                      ) : (
                        <ul className="divide-y divide-border">
                          {cat.items.map((item) => (
                            <li key={item.id} className="py-3 flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-3">
                                  <span className="font-medium">{item.name}</span>
                                  <span className="text-muted-foreground">
                                    €{Number(item.price).toFixed(2)}
                                  </span>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {Array.isArray(item.allergen_ids) && item.allergen_ids.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedItem(item)}
                                >
                                  Allergeni
                                </Button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <Dialog open={selectedItem !== null} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.name ?? 'Allergeni'}</DialogTitle>
          </DialogHeader>
          <ul className="list-disc list-inside space-y-1">
            {itemAllergens(selectedItem).map((a) => (
              <li key={a.id}>{a.name}</li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </section>
  )
}
