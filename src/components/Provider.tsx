import * as React from "react";
import styled from "styled-components";
import { FaChevronRight } from 'react-icons/fa';

const SIcon = styled.img`
  max-width: 33px;
  height: auto;
`;

const SName = styled.h6`
  margin: 0;
  font-weight: normal;
  font-size: .95rem;
`;


const SRightChevron = styled(FaChevronRight)`
    justify-self: flex-end;
    color:#2552ff;
`;


const SProviderContainer = styled.button`
  display: grid;
  grid-template-columns: .3fr 1fr .1fr;
  padding: 1rem 1rem;
  align-items: center;
  text-align: left;
  border:none;
  width: 100%;
  background-color: white;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 2px 5px;
  cursor: pointer;
  transition: background-color linear .2s;

  &:hover {
      background-color: #b8fdff57;
  }
`;

interface IProviderProps {
  name: string;
  logo: string;
  onClick: () => void;
}

export function Provider(props: IProviderProps) {
  const {
    name,
    logo,
    onClick,
  } = props;
  return (
    <SProviderContainer
      onClick={onClick}
    >
      <SIcon src={logo} alt={name} />
      <SName>
        {name}
      </SName>
      <SRightChevron />
    </SProviderContainer>
  );
}
