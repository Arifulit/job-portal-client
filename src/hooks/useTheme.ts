// এই ফাইলটি custom React hook হিসেবে reusable stateful logic দেয়।
import { useContext } from "react";
import { ThemeProviderContext } from "../context/theme.context";

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
