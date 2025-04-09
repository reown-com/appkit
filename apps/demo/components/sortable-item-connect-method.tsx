import React, { useEffect } from 'react'

import {
  Active,
  CollisionDetection,
  DropAnimation,
  KeyboardCoordinateGetter,
  MeasuringConfiguration,
  Modifiers,
  PointerActivationConstraint,
  UniqueIdentifier
} from '@dnd-kit/core'
import {
  AnimateLayoutChanges,
  NewIndexGetter,
  SortingStrategy,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable'

import { ConnectMethodItem } from '@/components/connect-method-item'
import { useAppKitContext } from '@/hooks/use-appkit'

const defaultInitializer = (index: number) => index

export function createRange<T = number>(
  length: number,
  initializer: (index: number) => any = defaultInitializer
): T[] {
  return [...new Array(length)].map((_, index) => initializer(index))
}

export interface Props {
  activationConstraint?: PointerActivationConstraint
  animateLayoutChanges?: AnimateLayoutChanges
  adjustScale?: boolean
  collisionDetection?: CollisionDetection
  coordinateGetter?: KeyboardCoordinateGetter
  Container?: any // To-do: Fix me
  dropAnimation?: DropAnimation | null
  getNewIndex?: NewIndexGetter
  handle?: boolean
  itemCount?: number
  items?: UniqueIdentifier[]
  measuring?: MeasuringConfiguration
  modifiers?: Modifiers
  renderItem?: any
  removable?: boolean
  reorderItems?: typeof arrayMove
  strategy?: SortingStrategy
  style?: React.CSSProperties
  useDragOverlay?: boolean
  getItemStyles?(args: {
    id: UniqueIdentifier
    index: number
    isSorting: boolean
    isDragOverlay: boolean
    overIndex: number
    isDragging: boolean
  }): React.CSSProperties
  wrapperStyle?(args: {
    active: Pick<Active, 'id'> | null
    index: number
    isDragging: boolean
    id: UniqueIdentifier
  }): React.CSSProperties
  isDisabled?(id: UniqueIdentifier): boolean
  onToggleOption?(name: 'Email' | 'Socials' | 'Wallets'): void
  handleNewOrder?(items: UniqueIdentifier[]): void
}

interface SortableItemProps {
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
  wrapperStyle?: Props['wrapperStyle']
  onToggleOption?(name: 'Email' | 'Socials' | 'Wallets'): void
}

export function SortableConnectMethodItem({
  disabled,
  handle,
  id,
  index,
  onRemove,
  style,
  renderItem,
  useDragOverlay,
  wrapperStyle,
  onToggleOption
}: SortableItemProps) {
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
  } = useSortable({ id })
  const { updateDraggingState } = useAppKitContext()

  useEffect(() => {
    updateDraggingState(id, isDragging)
  }, [isDragging])

  return (
    <ConnectMethodItem
      ref={setNodeRef}
      value={id}
      disabled={disabled}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={
        handle
          ? {
              ref: setActivatorNodeRef
            }
          : undefined
      }
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
      wrapperStyle={wrapperStyle?.({ index, isDragging, active, id })}
      listeners={listeners}
      data-index={index}
      data-id={id}
      dragOverlay={!useDragOverlay && isDragging}
      onToggleOption={onToggleOption}
      {...attributes}
    />
  )
}
