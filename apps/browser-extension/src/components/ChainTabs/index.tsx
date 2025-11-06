import React, { useState } from 'react'

import { ChainNamespace, ConstantsUtil } from '@reown/appkit-common'

import { sprinkles } from '../../css/sprinkless.css'
import { Btc } from '../Icons/Btc'
import { Eth } from '../Icons/Eth'
import { Sol } from '../Icons/Sol'
import { Ton } from '../Icons/Ton'

function Tab({ onTabClick }: { onTabClick: (tab: ChainNamespace) => void }) {
  const [activeTab, setActiveTab] = useState<ChainNamespace>('eip155')

  const tabs: ChainNamespace[] = ['eip155', 'solana', 'bip122', 'ton']
  const icons: React.ReactNode[] = [<Eth />, <Sol />, <Btc />, <Ton />]

  function handleTabClick(tab: ChainNamespace) {
    setActiveTab(tab)
    onTabClick(tab)
  }

  function getTabLabel(tab: ChainNamespace) {
    const label = ConstantsUtil.CHAIN_NAME_MAP[tab] || tab

    return label.replaceAll('EVM Networks', 'EVM')
  }

  return (
    <div
      className={sprinkles({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2',
        width: 'full',
        background: 'neutrals900',
        borderRadius: '16'
      })}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={sprinkles({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1',
            width: 'auto',
            flex: '1',
            padding: '2',
            borderRadius: '8',
            border: 'none',
            background: activeTab === tab ? 'neutrals800' : 'neutrals900',
            color: 'white',
            cursor: 'pointer',
            transition: 'default'
          })}
        >
          {icons[index]}
          {activeTab === tab && getTabLabel(tab)}
        </button>
      ))}
    </div>
  )
}

export default Tab
