import './App.css'
import WeeklySchedule from './components/WeeklySchedule'
import {ToastContainer} from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return(
    <>
      <WeeklySchedule/>
      <ToastContainer/>
    </>
  )
}

export default App
