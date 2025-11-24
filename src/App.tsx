import React, { Dispatch, useEffect, useRef } from "react";
import "./styles/styles.css";
import GameComponent from "./GameComponent";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  addWager,
  isAutoSetup,
  dealCards,
  exchangeCards,
  gameInitialized,
  initializeGame,
  playerIsIn,
  selectDealer,
  selectGame,
  selectPlayerWhoCanFoldOrStay,
  selectPlayerWhoCanTakeTrump,
  selectPlayerWhoShouldExchangeCards,
  setAutoSetup,
  setDealer,
  setGameCanFlipTrump,
  setTrumpSuit,
  takeTrump,
  selectTrumpSuit,
} from "./state/gameSlice";
import { store } from "./state/store";
import { Box, Flex } from "@chakra-ui/layout";
import {
  VStack,
  Card,
  Checkbox,
  useColorMode,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  Icon,
  useDisclosure,
  DrawerBody,
} from "@chakra-ui/react";
import { GameState, Player } from "./Types";
import { HamburgerIcon } from "@chakra-ui/icons";

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

function AppContent() {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLElement>(null);
  const game = useSelector(selectGame);
  const gameIsInitialized = useSelector(gameInitialized);
  const autoSetup = useSelector(isAutoSetup);
  const dealer = useSelector(selectDealer);
  const trumpSuit = useSelector(selectTrumpSuit);
  const playerWhoShouldExcangeCards = useSelector(
    selectPlayerWhoShouldExchangeCards,
  );
  const playerWhoCanTakeTrump = useSelector(selectPlayerWhoCanTakeTrump);
  const playerWhoCanFoldOrStay = useSelector(selectPlayerWhoCanFoldOrStay);

  useEffect(() => {
    dispatch(initializeGame(5));
  }, [dispatch]);

  useEffect(() => {
    console.log("dealer", dealer);
    if (gameIsInitialized && autoSetup && dealer === undefined) {
      dispatch(setDealer(1));
    }
  }, [gameIsInitialized, autoSetup, dealer]);

  useEffect(() => {
    if (gameIsInitialized && autoSetup && dealer !== undefined) {
      for (let i = 0; i < game.numberOfPlayers; i++) {
        if (!game.players[i].isDealer) {
          dispatch(addWager({ player: game.players[i], amount: 1 }));
        }
      }
    }
  }, [gameIsInitialized, autoSetup, dealer]);

  useEffect(() => {
    if (
      gameIsInitialized &&
      autoSetup &&
      dealer !== undefined &&
      trumpSuit === undefined
    ) {
      dispatch(dealCards());
      dispatch(setTrumpSuit({ hidden: false }));
      dispatch(dealCards());
    }
  }, [gameIsInitialized, autoSetup, dealer]);

  useEffect(() => {
    if (
      gameIsInitialized &&
      autoSetup &&
      dealer !== undefined &&
      trumpSuit !== undefined &&
      playerWhoCanFoldOrStay !== undefined
    ) {
      dispatch(playerIsIn(playerWhoCanFoldOrStay.id));
    }
  });

  useEffect(() => {
    if (
      gameIsInitialized &&
      autoSetup &&
      dealer !== undefined &&
      trumpSuit !== undefined &&
      playerWhoCanTakeTrump !== undefined
    ) {
      dispatch(takeTrump(playerWhoCanTakeTrump.id));
    }
  }, [gameIsInitialized, autoSetup, dealer, trumpSuit, playerWhoCanTakeTrump]);

  useEffect(() => {
    if (
      gameIsInitialized &&
      autoSetup &&
      dealer !== undefined &&
      trumpSuit !== undefined &&
      playerWhoShouldExcangeCards !== undefined
    ) {
      dispatch(exchangeCards(playerWhoShouldExcangeCards));
    }
  }, [
    gameIsInitialized,
    autoSetup,
    dealer,
    trumpSuit,
    playerWhoShouldExcangeCards,
  ]);

  const playerWhoCanFold1 = useSelector(selectPlayerWhoCanFoldOrStay);
  const preloadGameStateHandler = () => {
    dispatch(setAutoSetup(true));
  };
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex p="4">
      <VStack align="flex-start" spacing={2}>
        <header className="app-header">Mousel</header>
        <IconButton
          aria-label="open left menu"
          icon={<HamburgerIcon />}
          onClick={onOpen}
        />
      </VStack>
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody>
            <Box>
              <Button onClick={toggleColorMode}>
                Toggle {colorMode === "light" ? "Dark" : "Light"}
              </Button>
            </Box>
            <Box>
              <Checkbox
                id="can-flip-trump"
                type="checkbox"
                onClick={() =>
                  dispatch(setGameCanFlipTrump(!game.canFlipTrump))
                }
              >
                Can Flip Trump
              </Checkbox>
            </Box>
            <Button
              disabled={dealer !== undefined}
              onClick={() => preloadGameStateHandler()}
            >
              Preload game state
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Flex w="100%" justifyContent="center">
        {gameIsInitialized && <GameComponent />}
      </Flex>
    </Flex>
  );
}

export default App;
