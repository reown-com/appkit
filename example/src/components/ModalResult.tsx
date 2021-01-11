import * as React from "react";
import styled from "styled-components";
import { isObject } from "../helpers/utilities";

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

interface IResultTableStyleProps {
  nested?: boolean;
}

const STable = styled(SContainer)<IResultTableStyleProps>`
  flex-direction: column;
  min-height: ${({ nested }) => (nested ? "auto" : "200px")};
  text-align: left;
`;

const SRow = styled.div<IResultTableStyleProps>`
  width: 100%;
  display: ${({ nested }) => (nested ? "block" : "flex")};
  margin: 6px 0;
`;

const SKey = styled.div<IResultTableStyleProps>`
  width: ${({ nested }) => (nested ? "100%" : "30%")};
  font-weight: 700;
`;

const SValue = styled.div<IResultTableStyleProps>`
  width: ${({ nested }) => (nested ? "100%" : "70%")};
  font-family: monospace;
`;

function toString(value: any) {
  return typeof value !== "undefined" ? value.toString() : "undefined";
}

function ModalResult(props: any) {
  if (!props.children) {
    return null;
  }
  const result = props.children;
  return (
    <STable nested={props.nested}>
      {Object.keys(result).map((key) => {
        const nested = isObject(result[key]);
        return (
          <SRow nested={nested} key={key}>
            <SKey nested={nested}>{key}</SKey>
            <SValue nested={nested}>
              {nested ? (
                <ModalResult nested={nested}>{result[key]}</ModalResult>
              ) : (
                toString(result[key])
              )}
            </SValue>
          </SRow>
        );
      })}
    </STable>
  );
}

export default ModalResult;
