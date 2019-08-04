import * as React from 'react'
import styled from 'styled-components'
import Loader from './Loader'
import { colors, fonts, shadows, transitions } from '../styles'

interface IButtonStyleProps {
  fetching: boolean
  outline: boolean
  type: 'button' | 'submit' | 'reset'
  color: string
  disabled: boolean
  icon: any
  left: boolean
}

interface IButtonProps extends IButtonStyleProps {
  children: React.ReactNode
  onClick?: any
}

const SIcon = styled.div`
  position: absolute;
  height: 15px;
  width: 15px;
  margin: 0 8px;
  top: calc((100% - 15px) / 2);
`

const SHoverLayer = styled.div`
  transition: ${transitions.button};
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: rgb(${colors.white}, 0.1);
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
`

const SButton = styled.button<IButtonStyleProps>`
  transition: ${transitions.button};
  position: relative;
  border: none;
  border-style: none;
  box-sizing: border-box;
  background-color: ${({ outline, color }) =>
    outline ? 'transparent' : `rgb(${colors[color]})`};
  border: ${({ outline, color }) =>
    outline ? `1px solid rgb(${colors[color]})` : 'none'};
  color: ${({ outline, color }) =>
    outline ? `rgb(${colors[color]})` : `rgb(${colors.white})`};
  box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)};
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  font-weight: ${fonts.weight.semibold};
  padding: ${({ icon, left }) =>
    icon ? (left ? '7px 12px 8px 28px' : '7px 28px 8px 12px') : '8px 12px'};
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  will-change: transform;

  &:disabled {
    opacity: 0.6;
    box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)};
  }

  @media (hover: hover) {
    &:hover {
      transform: ${({ disabled }) => (!disabled ? 'translateY(-1px)' : 'none')};
      box-shadow: ${({ disabled, outline }) =>
        !disabled
          ? outline
            ? 'none'
            : `${shadows.hover}`
          : `${shadows.soft}`};
    }

    &:hover ${SHoverLayer} {
      opacity: 1;
      visibility: visible;
    }
  }

  &:active {
    transform: ${({ disabled }) => (!disabled ? 'translateY(1px)' : 'none')};
    box-shadow: ${({ outline }) => (outline ? 'none' : `${shadows.soft}`)};
    color: ${({ outline, color }) =>
      outline ? `rgb(${colors[color]})` : `rgba(${colors.white}, 0.24)`};

    & ${SIcon} {
      opacity: 0.8;
    }
  }

  & ${SIcon} {
    right: ${({ left }) => (left ? 'auto' : '0')};
    left: ${({ left }) => (left ? '0' : 'auto')};
    display: ${({ icon }) => (icon ? 'block' : 'none')};
    mask: ${({ icon }) => (icon ? `url(${icon}) center no-repeat` : 'none')};
    background-color: ${({ outline, color }) =>
      outline ? `rgb(${colors[color]})` : `rgb(${colors.white})`};
    transition: 0.15s ease;
  }
`

const Button = (props: IButtonProps) => (
  <SButton
    type={props.type}
    outline={props.outline}
    color={props.color}
    disabled={props.disabled}
    icon={props.icon}
    left={props.left}
    {...props}
  >
    <SHoverLayer />
    <SIcon />
    {props.fetching ? <Loader size={20} color="white" /> : props.children}
  </SButton>
)

Button.defaultProps = {
  fetching: false,
  outline: false,
  type: 'button',
  color: 'lightBlue',
  disabled: false,
  icon: null,
  left: false
}

export default Button
