import React, { useEffect } from 'react'
import classNames from 'classnames'
import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import type { Transform } from '@dnd-kit/utilities'

import styles from './sortable-social-item.module.css'
import { useAppKit } from '@/hooks/use-appkit'
import { SocialButtons } from '@/components/configuration-sections/social-buttons'
import { useSortable } from '@dnd-kit/sortable'

type SocialOption = 'google' | 'x' | 'discord' | 'farcaster' | 'github' | 'apple' | 'facebook'

export interface Props {
  dragOverlay?: boolean
  color?: string
  disabled?: boolean
  dragging?: boolean
  handle?: boolean
  handleProps?: any
  height?: number
  index?: number
  fadeIn?: boolean
  transform?: Transform | null
  listeners?: DraggableSyntheticListeners
  sorting?: boolean
  style?: React.CSSProperties
  transition?: string | null
  wrapperStyle?: React.CSSProperties
  value: React.ReactNode
  onRemove?(): void
  renderItem?(args: {
    dragOverlay: boolean
    dragging: boolean
    sorting: boolean
    index: number | undefined
    fadeIn: boolean
    listeners: DraggableSyntheticListeners
    ref: React.Ref<HTMLElement>
    style: React.CSSProperties | undefined
    transform: Props['transform']
    transition: Props['transition']
    value: Props['value']
  }): React.ReactElement
  onToggleOption?: (social: SocialOption) => void
  connectMethodDragging?: boolean
}

export const SortableSocialItem = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        height,
        index,
        listeners,
        onRemove,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        onToggleOption,
        connectMethodDragging,
        ...props
      },
      ref
    ) => {
      const { features, updateFeatures } = useAppKit()
      const socials = features.socials || []
      const { isDraggingByKey } = useAppKit()
      const emailDragging = isDraggingByKey['Email']
      const walletsDragging = isDraggingByKey['Wallets']
      const socialsDragging = isDraggingByKey['Socials']
      const isAnyDragging = emailDragging || walletsDragging || socialsDragging

      useEffect(() => {
        if (!dragOverlay) {
          return
        }

        document.body.style.cursor = 'grabbing'

        return () => {
          document.body.style.cursor = ''
        }
      }, [dragOverlay])

      function toggleSocial(social: SocialOption) {
        const newSocials = socials.includes(social)
          ? socials.filter(s => s !== social)
          : [...socials, social]

        updateFeatures({ socials: newSocials.length ? newSocials : false })
      }

      return renderItem ? (
        renderItem({
          dragOverlay: Boolean(dragOverlay),
          dragging: Boolean(dragging),
          sorting: Boolean(sorting),
          index,
          fadeIn: Boolean(fadeIn),
          listeners,
          ref,
          style,
          transform,
          transition,
          value
        })
      ) : (
        <li
          className={classNames(
            styles.Wrapper,
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            dragOverlay && styles.dragOverlay,
            socials.includes(value as SocialOption) && styles.enabled
          )}
          style={
            {
              ...wrapperStyle,
              transition: [transition, wrapperStyle?.transition].filter(Boolean).join(', '),
              '--translate-x': isAnyDragging
                ? '0px'
                : transform
                  ? `${Math.round(transform.x)}px`
                  : undefined,
              '--translate-y': isAnyDragging
                ? '0px'
                : transform
                  ? `${Math.round(transform.y)}px`
                  : undefined,
              '--scale-x': transform?.scaleX ? `${transform.scaleX}` : undefined,
              '--scale-y': transform?.scaleY ? `${transform.scaleY}` : undefined,
              '--index': index,
              '--color': color
            } as React.CSSProperties
          }
          onClick={() => toggleSocial?.(value as SocialOption)}
          ref={ref}
        >
          <div
            className={classNames(
              styles.Item,
              dragging && styles.dragging,
              dragOverlay && styles.dragOverlay,
              disabled && styles.disabled,
              color && styles.color
            )}
            style={style}
            data-cypress="draggable-item"
            {...(!handle ? listeners : undefined)}
            {...props}
            tabIndex={!handle ? 0 : undefined}
          >
            <wui-logo logo={value as SocialOption}></wui-logo>
          </div>
        </li>
      )
    }
  )
)
