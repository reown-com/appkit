import { ThemesList } from "@web3modal/types";
import lightTheme from "./light";
import darkTheme from "./dark";

export const themesList: ThemesList = {
  default: lightTheme,
  [lightTheme.name]: lightTheme,
  [darkTheme.name]: darkTheme
};
