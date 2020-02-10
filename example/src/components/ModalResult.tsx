import * as React from 'react'
import styled from 'styled-components'
import { isObject } from '../helpers/utilities'

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`

interface IResultTableStyleProps {
  displayObject?: boolean
}

const STable = styled(SContainer)<IResultTableStyleProps>`
  flex-direction: column;
  min-height: ${({ displayObject }) => (displayObject ? 'auto' : '200px')};
  text-align: left;
`

const SRow = styled.div<IResultTableStyleProps>`
  width: 100%;
  display: ${({ displayObject }) => (displayObject ? 'block' : 'flex')};
  margin: 6px 0;
`

const SKey = styled.div<IResultTableStyleProps>`
  width: ${({ displayObject }) => (displayObject ? '100%' : '30%')};
  font-weight: 700;
`

const SValue = styled.div<IResultTableStyleProps>`
  width: ${({ displayObject }) => (displayObject ? '100%' : '70%')};
  font-family: monospace;
`

function ModalResult(props: any) {
  if (!props.children) {
    return null
  }
  const result = props.children
  return (
    <STable displayObject={props.displayObject}>
      {Object.keys(result).map(key => {
        const displayObject = isObject(result[key])
        return (
          <SRow displayObject={displayObject} key={key}>
            <SKey displayObject={displayObject}>{key}</SKey>
            <SValue displayObject={displayObject}>
              {displayObject ? (
                <ModalResult displayObject={displayObject}>
                  {result[key]}
                </ModalResult>
              ) : (
                result[key].toString()
              )}
            </SValue>
          </SRow>
        )
      })}
    </STable>
  )
}

export default ModalResult
