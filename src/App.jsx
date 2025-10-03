import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import Meeting from "./pages/Meeting"; 
import Earnings from "./pages/Earnings";import Payment from "./pages/Payment";
import ChatAssistant from "./components/ChatAssistant"; 
import ChatAssistantWrapper from "./components/ChatAssistantWrapper";

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/signin" element={<SignIn />} />
  <Route path="/signup" element={<SignUp />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/chat" element={<Chat />} />
  <Route path="/post" element={<Post />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/meetings" element={<Meeting />} />
  <Route path="/earnings" element={<Earnings />} />
  <Route path="/payment" element={<Payment />} />
  <Route path="/chat-assistant" element={<ChatAssistantWrapper />} />
</Routes>

    </Router>
  );
}

export default App;
