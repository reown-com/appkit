import * as React from "react";
import styled from "styled-components";
import {
  getProviderInfoByName,
  formatProviderDescription
} from "../helpers/utils";
import { SIcon, STitle, SDescription } from "./common";

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

const SProvider = styled.div`
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
    <SProvider onClick={onClick} {...otherProps}>
      <SProviderContainer>
        <SIcon noShadow={providerInfo.styled.noShadow}>
          <img src={providerInfo.logo} alt={providerInfo.name} />
        </SIcon>
        <SName>{providerInfo.name}</SName>
        <SDescription>{description}</SDescription>
      </SProviderContainer>
    </SProvider>
  );
};

export default Provider;
