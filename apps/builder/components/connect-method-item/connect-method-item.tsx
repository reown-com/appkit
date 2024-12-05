import React, { useEffect } from 'react'
import classNames from 'classnames'
import { BaseDraggableItemProps, ConnectMethodName } from '@/lib/types'
import { Handle } from './components'
import styles from './connect-method-item.module.css'
import { useAppKitContext } from '@/hooks/use-appkit'
import { Checkbox } from '@/components/ui/checkbox'
import { SocialButtons } from '@/components/social-buttons'

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
            featureEnabledMap[value as ConnectMethodName]
              ? 'bg-foreground/5 dark:bg-foreground/5'
              : 'bg-foreground/[2%] dark:bg-foreground/[2%]'
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
              value === 'Socials' ? 'pb-0' : 'h-[52px]'
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
              <span className="text-sm flex-1">{value}</span>
              <Checkbox checked={featureEnabledMap[value as ConnectMethodName]} />
            </div>
          </li>
          {value === 'Socials' && <SocialButtons />}
        </div>
      )
    }
  )
)
