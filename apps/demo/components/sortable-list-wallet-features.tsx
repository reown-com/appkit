import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  type CollisionDetection,
  DndContext,
  DragOverlay,
  type DropAnimation,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  type MeasuringConfiguration,
  type Modifiers,
  MouseSensor,
  type PointerActivationConstraint,
  TouchSensor,
  type UniqueIdentifier,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  type AnimateLayoutChanges,
  type NewIndexGetter,
  SortableContext,
  type SortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'

import { SortableWalletFeatureItem } from '@/components/sortable-item-wallet-feature'
import { List } from '@/components/ui/list'
import { Wrapper } from '@/components/ui/wrapper'
import { WalletFeatureItem } from '@/components/wallet-feature-item'
import type { WalletFeatureName } from '@/lib/types'

function defaultInitializer(index: number) {
  return index
}

export function createRange(length: number, initializer = defaultInitializer): number[] {
  return [...new Array(length)].map((_, index) => initializer(index))
}

export interface Props {
  activationConstraint?: PointerActivationConstraint
  animateLayoutChanges?: AnimateLayoutChanges
  adjustScale?: boolean
  collisionDetection?: CollisionDetection
  coordinateGetter?: KeyboardCoordinateGetter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Container?: any
  dropAnimation?: DropAnimation | null
  getNewIndex?: NewIndexGetter
  handle?: boolean
  itemCount?: number
  items?: UniqueIdentifier[]
  measuring?: MeasuringConfiguration
  modifiers?: Modifiers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  onToggleOption?(name: WalletFeatureName): void
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

export function SortableWalletFeatureList({
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
  measuring,
  modifiers,
  renderItem,
  reorderItems = arrayMove,
  style,
  useDragOverlay = true,
  onToggleOption,
  handleNewOrder
}: Props) {
  const [items, setItems] = useState<UniqueIdentifier[]>(
    () => initialItems ?? createRange(itemCount, index => index)
  )
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint
    }),
    useSensor(TouchSensor, {
      activationConstraint
    }),
    useSensor(KeyboardSensor, {
      scrollBehavior: 'auto',
      coordinateGetter
    })
  )
  const isFirstAnnouncement = useRef(true)
  function getIndex(id: UniqueIdentifier) {
    return items.indexOf(id)
  }
  // eslint-disable-next-line no-negated-condition
  const activeIndex = activeId !== null ? getIndex(activeId) : -1

  useEffect(() => {
    if (activeId === null) {
      isFirstAnnouncement.current = true
    }
  }, [activeId])

  const orderString = useMemo(() => items.join(','), [items])
  const orderStringFromProps = useMemo(() => initialItems?.join(','), [initialItems])

  useEffect(() => {
    if (handleNewOrder) {
      handleNewOrder(orderString.split(','))
    }
  }, [orderString])

  useEffect(() => {
    if (orderStringFromProps) {
      setItems(orderStringFromProps.split(','))
    }
  }, [orderStringFromProps])

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
            setItems(itms => reorderItems(itms, activeIndex, overIndex))
          }
        }
      }}
      onDragCancel={() => setActiveId(null)}
      measuring={measuring}
      modifiers={modifiers}
    >
      <Wrapper style={style} center>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <Container>
            {items.map((value, index) => (
              <SortableWalletFeatureItem
                key={value}
                id={value}
                handle={handle}
                index={index}
                style={getItemStyles}
                renderItem={renderItem}
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
              {activeId ? (
                <WalletFeatureItem
                  value={items[activeIndex]}
                  handle={handle}
                  renderItem={renderItem}
                  style={getItemStyles({
                    id: items[activeIndex] as UniqueIdentifier,
                    index: activeIndex,
                    isSorting: Boolean(activeId),
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
