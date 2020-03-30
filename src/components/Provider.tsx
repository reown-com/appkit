import * as React from "react";
import styled from "styled-components";

import {
  ThemeColors,
  PROVIDER_WRAPPER_CLASSNAME,
  PROVIDER_CONTAINER_CLASSNAME,
  PROVIDER_ICON_CLASSNAME,
  PROVIDER_NAME_CLASSNAME,
  PROVIDER_DESCRIPTION_CLASSNAME,
  getProviderInfoByName,
  formatProviderDescription
} from "../helpers";

interface IIconStyleProps {
  noShadow?: boolean;
}

const SIcon = styled.div<IIconStyleProps>`
  width: 45px;
  height: 45px;
  display: flex;
  border-radius: 50%;
  overflow: ${({ noShadow }) => (noShadow ? "visible" : "hidden")};
  box-shadow: ${({ noShadow }) =>
    noShadow
      ? "none"
      : "0 4px 6px 0 rgba(50, 50, 93, 0.11), 0 1px 3px 0 rgba(0, 0, 0, 0.08), inset 0 0 1px 0 rgba(0, 0, 0, 0.06)"};
  justify-content: center;
  align-items: center;
  & img {
    width: 100%;
    height: 100%;
  }

  @media screen and (max-width: 768px) {
    width: 8.5vw;
    height: 8.5vw;
  }
`;

interface IStyedThemeColorOptions {
  themeColors: ThemeColors;
}

const SName = styled.div<IStyedThemeColorOptions>`
  width: 100%;
  font-size: 24px;
  font-weight: 700;
  margin-top: 0.5em;
  color: ${({ themeColors }) => themeColors.main};
  @media screen and (max-width: 768px) {
    font-size: 5vw;
  }
`;

const SDescription = styled.div<IStyedThemeColorOptions>`
  width: 100%;
  font-size: 18px;
  margin: 0.333em 0;
  color: ${({ themeColors }) => themeColors.secondary};
  @media screen and (max-width: 768px) {
    font-size: 4vw;
  }
`;

const SProviderContainer = styled.div<IStyedThemeColorOptions>`
  transition: background-color 0.2s ease-in-out;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ themeColors }) => themeColors.background};
  border-radius: 12px;
  padding: 24px 16px;
  @media screen and (max-width: 768px) {
    padding: 1vw;
  }
`;

const SProviderWrapper = styled.div<IStyedThemeColorOptions>`
  width: 100%;
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  cursor: pointer;
  border-radius: 0;
  border: ${({ themeColors }) => `1px solid ${themeColors.border}`};
  @media (hover: hover) {
    &:hover ${SProviderContainer} {
      background-color: ${({ themeColors }) => themeColors.hover};
    }
  }
`;

interface IProviderProps {
  name: string | null;
  themeColors: ThemeColors;
  onClick: () => void;
}

const Provider = (props: IProviderProps) => {
  const { name, themeColors, onClick, ...otherProps } = props;
  const providerInfo = getProviderInfoByName(name);
  const description = formatProviderDescription(providerInfo);
  return (
    <SProviderWrapper
      themeColors={themeColors}
      className={PROVIDER_WRAPPER_CLASSNAME}
      onClick={onClick}
      {...otherProps}
    >
      <SProviderContainer
        themeColors={themeColors}
        className={PROVIDER_CONTAINER_CLASSNAME}
      >
        <SIcon
          className={PROVIDER_ICON_CLASSNAME}
          noShadow={providerInfo.styled.noShadow}
        >
          <img src={providerInfo.logo} alt={providerInfo.name} />
        </SIcon>
        <SName themeColors={themeColors} className={PROVIDER_NAME_CLASSNAME}>
          {providerInfo.name}
        </SName>
        <SDescription
          themeColors={themeColors}
          className={PROVIDER_DESCRIPTION_CLASSNAME}
        >
          {description}
        </SDescription>
      </SProviderContainer>
    </SProviderWrapper>
  );
};

export default Provider;
