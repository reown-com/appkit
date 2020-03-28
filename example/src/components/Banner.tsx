import * as React from "react";
import styled from "styled-components";
import logo from "../assets/web3modal-logo.png";
import { fonts, colors } from "../styles";

const SBannerWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  & span {
    color: rgb(${colors.lightBlue});
    font-weight: ${fonts.weight.bold};
    font-size: ${fonts.size.h5};
    margin-left: 12px;
  }
`;

const SBanner = styled.div`
  width: 45px;
  height: 45px;
  background: url(${logo}) no-repeat;
  background-size: cover;
  background-position: center;
`;

const Banner = () => (
  <SBannerWrapper>
    <SBanner />
    <span>{`Web3Modal`}</span>
  </SBannerWrapper>
);

export default Banner;
