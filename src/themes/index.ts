import { ThemesList } from "../helpers";
import lightTheme from "./light";
import darkTheme from "./dark";

const themes: ThemesList = {
  [lightTheme.name]: lightTheme,
  [darkTheme.name]: darkTheme
};

export default themes;
