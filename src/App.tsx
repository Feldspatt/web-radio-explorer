import './App.css'
import RadioPlayer from "./components/RadioPlayer/RadioPlayer.tsx";

function App() {

  return (
    <>
      <RadioPlayer sourceUrl={'https://icecast.walmradio.com:8443/classic'}/>
    </>
  )
}

export default App
