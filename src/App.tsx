import React, { useEffect } from 'react'
import './App.css';
import GameComponent  from './GameComponent';
import { Provider, useDispatch, useSelector } from 'react-redux'
import { gameInitialized, initializeGame } from "./state/gameSlice"
import {store} from './state/store'

function App() {
    return (
        <Provider store={store}>
            <AppContent />
        </Provider>
    );
}

function AppContent() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initializeGame(5));
    }, [dispatch]);
    const gameIsInitialized = useSelector(gameInitialized)
    return (
        <div className="App">
            <header className="App-header">
                <p>
                    Mousel
                </p>
            </header>
            {gameIsInitialized &&
                <GameComponent />
            }
        </div>
    );
}


export default App;
