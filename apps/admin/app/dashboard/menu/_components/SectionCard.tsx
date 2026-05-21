'use client'
import { useState, useRef } from 'react'
import { useActionState } from 'react'
import type { MenuSection, MenuCategory } from '@repo/supabase'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Switch,
} from '@repo/ui'
import { updateSectionAction, type MenuActionState } from '../actions'
import { CategoryRow } from './CategoryRow'
import { RenameSectionDialog } from './RenameSectionDialog'
import { CreateCategoryDialog } from './CreateCategoryDialog'
import { EditCategoryDialog } from './EditCategoryDialog'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'

const idle: MenuActionState = { status: 'idle' }

export function SectionCard({
  section,
  categories,
}: {
  section: MenuSection
  categories: MenuCategory[]
}) {
  const [renameOpen, setRenameOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<MenuCategory | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<MenuCategory | null>(null)

  const [, toggleAction, isToggling] = useActionState(updateSectionAction, idle)
  const sectionFormRef = useRef<HTMLFormElement>(null)

  return (
    <>
      <Card className={!section.is_active ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              {section.name}
              {!section.is_active && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                  Inattiva
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <form ref={sectionFormRef} action={toggleAction}>
                <input type="hidden" name="id" value={section.id} />
                <input type="hidden" name="is_active" value={(!section.is_active).toString()} />
                <Switch
                  checked={section.is_active}
                  disabled={isToggling}
                  onCheckedChange={() => sectionFormRef.current?.requestSubmit()}
                />
              </form>
              <Button variant="outline" size="sm" onClick={() => setRenameOpen(true)}>
                Rinomina
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="mb-3 text-sm text-muted-foreground">
              Nessuna categoria. Aggiungine una.
            </p>
          ) : (
            <ul className="mb-3 space-y-1">
              {categories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onEdit={setEditCategory}
                  onDelete={setDeleteCategory}
                />
              ))}
            </ul>
          )}
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            + Aggiungi categoria
          </Button>
        </CardContent>
      </Card>

      {renameOpen && (
        <RenameSectionDialog
          key={`rename-${section.id}`}
          section={section}
          onClose={() => setRenameOpen(false)}
        />
      )}
      {createOpen && (
        <CreateCategoryDialog
          key={`create-${section.id}`}
          sectionId={section.id}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editCategory && (
        <EditCategoryDialog
          key={editCategory.id}
          category={editCategory}
          onClose={() => setEditCategory(null)}
        />
      )}
      {deleteCategory && (
        <DeleteCategoryDialog
          key={`delete-${deleteCategory.id}`}
          category={deleteCategory}
          onClose={() => setDeleteCategory(null)}
        />
      )}
    </>
  )
}
