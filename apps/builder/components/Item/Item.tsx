import React, { useEffect } from 'react'
import classNames from 'classnames'
import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import type { Transform } from '@dnd-kit/utilities'

import { Handle } from './components'

import styles from './Item.module.css'
import { useAppKit } from '@/hooks/use-appkit'
import { Checkbox } from '@/components/ui/checkbox'
import { SocialButtons } from '@/components/configuration-sections/social-buttons'

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
  onToggleOption?: (name: 'Email' | 'Socials' | 'Wallets') => void
}

export const Item = React.memo(
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
        ...props
      },
      ref
    ) => {
      const { features, enableWallets, updateFeatures } = useAppKit()
      const emailEnabled = features.email
      const socialsEnabled = Array.isArray(features.socials)
      const walletsEnabled = enableWallets

      const featureEnabledMap = {
        Email: emailEnabled,
        Socials: socialsEnabled,
        Wallets: walletsEnabled
      }

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
        const currentSocials = Array.isArray(features.socials) ? features.socials : []
        const newSocials = currentSocials.includes(social)
          ? currentSocials.filter(s => s !== social)
          : [...currentSocials, social]

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
        <div
          className={classNames(
            styles.Wrapper,
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            dragOverlay && styles.dragOverlay,
            dragging && styles.dragging
          )}
          style={
            {
              ...wrapperStyle,
              transition: [transition, wrapperStyle?.transition].filter(Boolean).join(', '),
              '--translate-x': transform ? `${Math.round(transform.x)}px` : undefined,
              '--translate-y': transform ? `${Math.round(transform.y)}px` : undefined,
              '--scale-x': transform?.scaleX ? `${transform.scaleX}` : undefined,
              '--scale-y': transform?.scaleY ? `${transform.scaleY}` : undefined,
              '--index': index,
              '--color': color
            } as React.CSSProperties
          }
          ref={ref as React.LegacyRef<HTMLDivElement>}
        >
          <li
            onClick={() => onToggleOption?.(value as 'Email' | 'Socials' | 'Wallets')}
            className={classNames(
              styles.ListItem,
              'flex items-center justify-between rounded-xl p-3 w-full',
              featureEnabledMap[value as 'Email' | 'Socials' | 'Wallets']
                ? 'bg-foreground/5 dark:bg-foreground/5'
                : 'bg-foreground/[2%] dark:bg-foreground/[2%]'
            )}
          >
            <div
              className={classNames(
                styles.Item,
                handle && styles.withHandle,
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
              {handle ? <Handle {...handleProps} {...listeners} /> : null}
              <span className="text-sm flex-1">{value}</span>
              <Checkbox
                className="bg-transparent border border-muted-foreground/10 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg"
                checked={featureEnabledMap[value as 'Email' | 'Socials' | 'Wallet']}
              />
            </div>
          </li>
          {value === 'Socials' && <SocialButtons toggleSocial={toggleSocial} features={features} />}
        </div>
      )
    }
  )
)
