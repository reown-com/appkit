import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  DropAnimation,
  KeyboardCoordinateGetter,
  KeyboardSensor,
  MeasuringConfiguration,
  Modifiers,
  MouseSensor,
  PointerActivationConstraint,
  TouchSensor,
  UniqueIdentifier,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  AnimateLayoutChanges,
  NewIndexGetter,
  SortableContext,
  SortingStrategy,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'

import { SocialProvider } from '@reown/appkit-controllers'

import { SortableSocialOptionItem } from '@/components/sortable-item-social-option'
import { List } from '@/components/ui/list'
import { Wrapper } from '@/components/ui/wrapper'
import { useAppKitContext } from '@/hooks/use-appkit'

import { SocialOptionItem } from './social-option-item'

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
  isDisabled?(id: UniqueIdentifier): boolean
  onToggleOption?(socialOption: SocialProvider): void
  handleNewOrder?(items: UniqueIdentifier[]): void
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5'
      }
    }
  })
}

export function SortableSocialGrid({
  activationConstraint,
  animateLayoutChanges,
  adjustScale = false,
  Container = List,
  collisionDetection = closestCenter,
  coordinateGetter = sortableKeyboardCoordinates,
  dropAnimation = dropAnimationConfig,
  getItemStyles = () => ({}),
  getNewIndex,
  handle = false,
  itemCount = 3,
  items: initialItems,
  isDisabled = () => false,
  measuring,
  modifiers,
  removable,
  renderItem,
  reorderItems = arrayMove,
  strategy = rectSortingStrategy,
  style,
  useDragOverlay = true,
  onToggleOption,
  handleNewOrder
}: Props) {
  const [items, setItems] = useState<UniqueIdentifier[]>(
    () => initialItems ?? createRange<UniqueIdentifier>(itemCount, index => index)
  )
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint }),
    useSensor(TouchSensor, { activationConstraint }),
    useSensor(KeyboardSensor, { scrollBehavior: 'auto', coordinateGetter })
  )
  const isFirstAnnouncement = useRef(true)
  const getIndex = (id: UniqueIdentifier) => items.indexOf(id)
  const activeIndex = activeId != null ? getIndex(activeId) : -1
  const handleRemove = removable
    ? (id: UniqueIdentifier) => setItems(items => items.filter(item => item !== id))
    : undefined

  useEffect(() => {
    if (activeId == null) {
      isFirstAnnouncement.current = true
    }
  }, [activeId])

  const orderString = useMemo(() => items.join(','), [items])

  useEffect(() => {
    if (handleNewOrder) {
      handleNewOrder(orderString.split(','))
    }
  }, [orderString])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={({ active }) => {
        if (!active) {
          return
        }

        setActiveId(active.id)
      }}
      onDragEnd={({ over }) => {
        setActiveId(null)

        if (over) {
          const overIndex = getIndex(over.id)
          if (activeIndex !== overIndex) {
            setItems(items => reorderItems(items, activeIndex, overIndex))
          }
        }
      }}
      onDragCancel={() => setActiveId(null)}
      measuring={measuring}
      modifiers={modifiers}
    >
      <Wrapper style={style} center className="p-3">
        <SortableContext items={items} strategy={strategy}>
          <Container columns={5}>
            {items.map((value, index) => (
              <SortableSocialOptionItem
                key={value}
                id={value}
                handle={handle}
                index={index}
                style={getItemStyles}
                disabled={isDisabled(value)}
                renderItem={renderItem}
                onRemove={handleRemove}
                animateLayoutChanges={animateLayoutChanges}
                useDragOverlay={useDragOverlay}
                getNewIndex={getNewIndex}
                onToggleOption={onToggleOption}
              />
            ))}
          </Container>
        </SortableContext>
      </Wrapper>
      {useDragOverlay
        ? createPortal(
            <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
              {activeId != null ? (
                <SocialOptionItem
                  value={items[activeIndex]}
                  handle={handle}
                  renderItem={renderItem}
                  style={getItemStyles({
                    id: items[activeIndex],
                    index: activeIndex,
                    isSorting: activeId !== null,
                    isDragging: true,
                    overIndex: -1,
                    isDragOverlay: true
                  })}
                  dragOverlay
                />
              ) : null}
            </DragOverlay>,
            document.body
          )
        : null}
    </DndContext>
  )
}
