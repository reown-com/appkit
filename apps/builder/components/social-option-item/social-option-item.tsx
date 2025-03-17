import React, { useEffect } from 'react'

import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import type { Transform } from '@dnd-kit/utilities'
import classNames from 'classnames'

import { SocialProvider } from '@reown/appkit-controllers'
import '@reown/appkit-ui/jsx'

import { useAppKitContext } from '@/hooks/use-appkit'

import styles from './sortable-social-item.module.css'

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
  onToggleOption?: (social: SocialProvider) => void
  connectMethodDragging?: boolean
}

export const SocialOptionItem = React.memo(
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
      const { config, updateFeatures } = useAppKitContext()
      const socials = config.features.socials || []
      const { isDraggingByKey } = useAppKitContext()
      const emailDragging = isDraggingByKey['email']
      const walletsDragging = isDraggingByKey['wallet']
      const socialsDragging = isDraggingByKey['social']
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

      function toggleSocial(social: SocialProvider) {
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
            'h-[44px] min-w-[44px]',
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            dragOverlay && styles.dragOverlay,
            socials.includes(value as SocialProvider)
              ? 'border border-border-accent bg-background-accent-primary/10'
              : 'border border-neutral-300 dark:border-neutral-700'
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
          onClick={() => toggleSocial?.(value as SocialProvider)}
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
            {...(!handle ? listeners : undefined)}
            {...props}
            tabIndex={!handle ? 0 : undefined}
          >
            <wui-logo logo={value as SocialProvider}></wui-logo>
          </div>
        </li>
      )
    }
  )
)
