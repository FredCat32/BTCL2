import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        color: "whiteAlpha.900",
      },
    },
  },
  colors: {
    brand: {
      900: "#1a365d",
      800: "#153e75",
      700: "#2a69ac",
      purple: "#712F79",
      pink: "#E08D79",
      green: "#C2F970",
      lightblue: "#48639C",
      darkblue: "#4C4C9D",
    },
  },
  components: {
    Text: {
      baseStyle: {
        color: "whiteAlpha.900",
        textShadow: "0 0 10px rgba(0,0,0,0.3)",
      },
    },
    Heading: {
      baseStyle: {
        color: "whiteAlpha.900",
        textShadow: "0 0 10px rgba(0,0,0,0.3)",
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            backgroundColor: "whiteAlpha.200",
            color: "whiteAlpha.900",
            _placeholder: {
              color: "whiteAlpha.500",
            },
          },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            backgroundColor: "whiteAlpha.200",
            color: "whiteAlpha.900",
          },
        },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
      variants: {
        solid: {
          bg: "whiteAlpha.200",
          color: "whiteAlpha.900",
          _hover: {
            bg: "whiteAlpha.300",
          },
        },
      },
    },
  },
});

export default theme;
