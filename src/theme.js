import { createMuiTheme } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#556cd6"
    },
    secondary: {
      main: "#19857b"
    },
    error: {
      main: red.A400
    },
    background: {
      default: "#f5f5f8"
    }
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        ".MuiContainer-root": {
          // paddingTop: "10px",
          // paddingBottom: "10px"
        },
        body: {
          "font-family": "Montserrat"
        }
      }
    },
    MuiContainer: {
      root: {
        // color: "red"
      }
    }
  }
});

export default theme;
