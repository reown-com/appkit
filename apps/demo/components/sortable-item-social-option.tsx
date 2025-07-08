// eslint-disable @typescript-eslint/no-explicit-any
import React from 'react'

import { type UniqueIdentifier } from '@dnd-kit/core'
import { type AnimateLayoutChanges, type NewIndexGetter, useSortable } from '@dnd-kit/sortable'

import { type SocialProvider } from '@reown/appkit-controllers'

import { SocialOptionItem } from './social-option-item'

function defaultInitializer(index: number) {
  return index
}

export function createRange(length: number, initializer = defaultInitializer): number[] {
  return [...new Array(length)].map((_, index) => initializer(index))
}

interface SortableSocialOptionItemProps {
  animateLayoutChanges?: AnimateLayoutChanges
  disabled?: boolean
  getNewIndex?: NewIndexGetter
  id: UniqueIdentifier
  index: number
  handle: boolean
  useDragOverlay?: boolean
  onRemove?(id: UniqueIdentifier): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style(values: any): React.CSSProperties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderItem?(args: any): React.ReactElement
  onToggleOption?(socialOption: SocialProvider): void
}

export function SortableSocialOptionItem({
  disabled,
  handle,
  id,
  index,
  onRemove,
  style,
  renderItem,
  useDragOverlay,
  onToggleOption
}: SortableSocialOptionItemProps) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    overIndex,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition
  } = useSortable({
    id
  })

  return (
    <SocialOptionItem
      ref={setNodeRef}
      value={id}
      disabled={disabled}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      renderItem={renderItem}
      index={index}
      style={style({
        index,
        id,
        isDragging,
        isSorting,
        overIndex
      })}
      onRemove={onRemove ? () => onRemove(id) : undefined}
      transform={transform}
      transition={transition}
      listeners={listeners}
      data-index={index}
      data-id={id}
      dragOverlay={!useDragOverlay && isDragging}
      onToggleOption={onToggleOption}
      {...attributes}
    />
  )
}
