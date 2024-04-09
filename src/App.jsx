import { useEffect } from 'react'
import './App.css';
import './styles/styles.css';
import GameComponent  from './GameComponent';
import { Provider, useDispatch, useSelector } from 'react-redux'
import { gameInitialized, initializeGame, selectGame } from "./state/gameSlice"
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

    const game = useSelector(selectGame);

    useEffect(() => {
        dispatch(initializeGame(5));
    }, [dispatch]);

    const gameIsInitialized = useSelector(gameInitialized)

    return (
        <><div className="App">
            <header className="App-header">
                <p>
                    Mousel
                </p>
            </header>
            {gameIsInitialized &&
                <GameComponent />}
        </div>
        <div>
                {/* All game data for debugging */}
                <pre>
                    {JSON.stringify(game, null, 2)}
                </pre>
            </div>
            </>
    );
}


export default App;
