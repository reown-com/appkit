import styled from "styled-components";

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
