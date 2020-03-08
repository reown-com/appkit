import * as React from "react";
import styled from "styled-components";
import {
  getProviderInfoByName,
  formatProviderDescription
} from "../helpers/utils";
import {
  PROVIDER_WRAPPER_CLASSNAME,
  PROVIDER_CONTAINER_CLASSNAME,
  PROVIDER_ICON_CLASSNAME,
  PROVIDER_NAME_CLASSNAME,
  PROVIDER_DESCRIPTION_CLASSNAME
} from "../helpers/constants";

interface IIconStyleProps {
  noShadow?: boolean;
}

export const SIcon = styled.div<IIconStyleProps>`
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

export const STitle = styled.div`
  width: 100%;
  font-size: 24px;
  font-weight: 700;
  margin-top: 0.5em;
`;

export const SDescription = styled.div`
  width: 100%;
  font-size: 18px;
  margin: 0.333em 0;
  color: rgb(169, 169, 188);
  @media screen and (max-width: 768px) {
    font-size: 4vw;
  }
`;

const SProviderContainer = styled.div`
  transition: background-color 0.2s ease-in-out;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgb(255, 255, 255);
  border-radius: 12px;
  padding: 24px 16px;
  @media screen and (max-width: 768px) {
    padding: 1vw;
  }
`;

const SName = styled(STitle)`
  color: rgb(12, 12, 13);
  @media screen and (max-width: 768px) {
    font-size: 5vw;
  }
`;

const SProviderWrapper = styled.div`
  width: 100%;
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  cursor: pointer;
  border-radius: 0;
  border: 1px solid rgba(195, 195, 195, 0.14);
  @media (hover: hover) {
    &:hover ${SProviderContainer} {
      background-color: rgba(195, 195, 195, 0.14);
    }
  }
`;

interface IProviderProps {
  name: string | null;
  onClick: () => void;
}

const Provider = (props: IProviderProps) => {
  const { name, onClick, ...otherProps } = props;
  const providerInfo = getProviderInfoByName(name);
  const description = formatProviderDescription(providerInfo);
  return (
    <SProviderWrapper
      className={PROVIDER_WRAPPER_CLASSNAME}
      onClick={onClick}
      {...otherProps}
    >
      <SProviderContainer className={PROVIDER_CONTAINER_CLASSNAME}>
        <SIcon
          className={PROVIDER_ICON_CLASSNAME}
          noShadow={providerInfo.styled.noShadow}
        >
          <img src={providerInfo.logo} alt={providerInfo.name} />
        </SIcon>
        <SName className={PROVIDER_NAME_CLASSNAME}>{providerInfo.name}</SName>
        <SDescription className={PROVIDER_DESCRIPTION_CLASSNAME}>
          {description}
        </SDescription>
      </SProviderContainer>
    </SProviderWrapper>
  );
};

export default Provider;
