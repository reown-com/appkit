import React from 'react'

import { UniqueIdentifier } from '@dnd-kit/core'
import { AnimateLayoutChanges, NewIndexGetter, useSortable } from '@dnd-kit/sortable'

import { SocialProvider } from '@reown/appkit-controllers'

import { SocialOptionItem } from './social-option-item'

const defaultInitializer = (index: number) => index

export function createRange<T = number>(
  length: number,
  initializer: (index: number) => any = defaultInitializer
): T[] {
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
  style(values: any): React.CSSProperties
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
    active,
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
