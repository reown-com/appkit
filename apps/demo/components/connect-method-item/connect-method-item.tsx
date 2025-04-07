import React, { useEffect } from 'react'

import classNames from 'classnames'

import { ConnectMethod } from '@reown/appkit-controllers'

import { SocialButtons } from '@/components/social-buttons'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppKitContext } from '@/hooks/use-appkit'
import { BaseDraggableItemProps, ConnectMethodName } from '@/lib/types'

import { Handle } from './components'
import styles from './connect-method-item.module.css'

interface Props extends BaseDraggableItemProps {
  onToggleOption?: (name: ConnectMethodName) => void
}

export const ConnectMethodItem = React.memo(
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
      const { config } = useAppKitContext()
      const emailEnabled = config.features.email
      const socialsEnabled = Array.isArray(config.features.socials)
      const walletsEnabled = config.enableWallets
      const themeMode = config.themeMode

      const featureEnabledMap = {
        email: emailEnabled,
        social: socialsEnabled,
        wallet: walletsEnabled
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
          transform: transform ?? null,
          transition: transition ?? null,
          value
        })
      ) : (
        <div
          className={classNames(
            styles.Wrapper,
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            dragOverlay && styles.dragOverlay,
            dragging && styles.dragging,
            'bg-fg-secondary',
            themeMode
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
            onClick={() => onToggleOption?.(value as ConnectMethodName)}
            className={classNames(
              'list-none flex items-center justify-between rounded-2xl p-3 w-full',
              value === 'social' ? 'pb-0' : 'h-[52px]'
            )}
          >
            <div
              className={classNames(
                styles.Item,
                'h-[28px]',
                handle && styles.withHandle,
                dragOverlay && styles.dragOverlay,
                disabled && styles.disabled,
                color && styles.color
              )}
              style={style}
              {...(!handle ? listeners : undefined)}
              {...props}
              tabIndex={!handle ? 0 : undefined}
            >
              {handle ? <Handle {...handleProps} {...listeners} /> : null}
              <span className="text-sm flex-1 text-text-primary capitalize">{value}</span>
              <Checkbox checked={featureEnabledMap[value as ConnectMethod]} />
            </div>
          </li>
          {value === 'social' && <SocialButtons />}
        </div>
      )
    }
  )
)
