import React, { useEffect } from 'react'

import classNames from 'classnames'

import { Checkbox } from '@/components/ui/checkbox'
import { useAppKitContext } from '@/hooks/use-appkit'
import type { BaseDraggableItemProps, WalletFeatureName } from '@/lib/types'

import { Handle } from './components'
import styles from './wallet-feature-item.module.css'

interface Props extends BaseDraggableItemProps {
  onToggleOption?: (name: WalletFeatureName) => void
}

export const WalletFeatureItem = React.memo(
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
        index,
        listeners,
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
      const isOnrampEnabled = config.remoteFeatures.onramp
      const isSwapsEnabled = config.remoteFeatures.swaps
      const isReceiveEnabled = config.features.receive
      const isSendEnabled = config.features.send

      const featureEnabledMap = {
        Buy: Array.isArray(isOnrampEnabled) ? isOnrampEnabled.length > 0 : Boolean(isOnrampEnabled),
        Swap: Array.isArray(isSwapsEnabled) ? isSwapsEnabled.length > 0 : Boolean(isSwapsEnabled),
        Receive: Boolean(isReceiveEnabled),
        Send: Boolean(isSendEnabled)
      }

      const featureCanBeToggledMap = {
        Buy: true,
        Swap: true,
        Receive: false,
        Send: false
      }

      useEffect(() => {
        if (!dragOverlay) {
          return
        }

        document.body.style.cursor = 'grabbing'

        // eslint-disable-next-line consistent-return
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
            styles['Wrapper'],
            fadeIn && styles['fadeIn'],
            sorting && styles['sorting'],
            dragOverlay && styles['dragOverlay'],
            dragging && styles['dragging']
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
            onClick={() => onToggleOption?.(value as WalletFeatureName)}
            className={classNames(
              'h-[52px] list-none flex items-center justify-between rounded-2xl p-3 w-full',
              'bg-fg-secondary'
            )}
          >
            <div
              className={classNames(
                styles['Item'],
                handle && styles['withHandle'],
                dragOverlay && styles['dragOverlay'],
                disabled && styles['disabled'],
                color && styles['color']
              )}
              style={style}
              data-cypress="draggable-item"
              {...(handle ? undefined : listeners)}
              {...props}
              tabIndex={handle ? undefined : 0}
            >
              {handle ? <Handle {...handleProps} {...listeners} /> : null}
              <span className="text-sm flex-1">{value}</span>
              {featureCanBeToggledMap[value as WalletFeatureName] ? (
                <Checkbox checked={featureEnabledMap[value as WalletFeatureName]} />
              ) : null}
            </div>
          </li>
        </div>
      )
    }
  )
)
