import * as React from "react";
import styled from "styled-components";
import banner from "../assets/walletconnect-banner.png";

const SBannerWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const SBanner = styled.div`
  width: 275px;
  height: 45px;
  background: url(${banner}) no-repeat;
  background-size: cover;
  background-position: center;
`;

const Banner = () => (
  <SBannerWrapper>
    <SBanner />
  </SBannerWrapper>
);

export default Banner;
