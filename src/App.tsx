import React, { useEffect } from "react";
import "./styles/styles.css";
import GameComponent from "./GameComponent";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  gameInitialized,
  initializeGame,
  selectGame,
  setGameCanFlipTrump,
} from "./state/gameSlice";
import { store } from "./state/store";
import { Box, Flex } from "@chakra-ui/layout";
import { VStack, Card, Checkbox, useColorMode, Button } from "@chakra-ui/react";

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

function AppContent() {
  const dispatch = useDispatch();

  const game = useSelector(selectGame);

  useEffect(() => {
    dispatch(initializeGame(5));
  }, [dispatch]);

  const gameIsInitialized = useSelector(gameInitialized);
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex p="4">
      <VStack w="25%">
        <Box>
          <Button onClick={toggleColorMode}>
            Toggle {colorMode === "light" ? "Dark" : "Light"}
          </Button>
        </Box>
        <Box>
          <Checkbox
            id="can-flip-trump"
            type="checkbox"
            onClick={() => dispatch(setGameCanFlipTrump(!game.canFlipTrump))}
          >
            Can Flip Trump
          </Checkbox>
        </Box>
      </VStack>
      <Box w="50%">
        <header className="App-header">Mousel</header>
        {gameIsInitialized && <GameComponent />}
      </Box>
      <Box w="25%">
        <Card>RIGHT</Card>
      </Box>
    </Flex>
  );
}

export default App;
