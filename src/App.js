import './App.scss';
import { BrowserRouter, Routes, Route, HashRouter } from 'react-router-dom';
import Mainpage from "./components/MainPage/Mainpage";
import BottomMenuBar from './components/Menubar/BottomMenuBar';
import TopMenubar from './components/Menubar/TopMenubar';
import MyPage from './components/MyPage/MyPage';
import PasswordCheck from './components/MyPage/PasswordCheck';
import EditInfo from './components/MyPage/EditInfo';
import DeleteAccount from './components/MyPage/DeleteAccount';
import DeleteComplete from './components/MyPage/DeleteComplete';
import CommentList from './components/MyPage/CommentList';
import MyMarks from './components/MyPage/MyMarks';
import MainMap from './components/FestivalMap/MainMap'
import FestivalDetail from "./components/FestivalDetail/FestivalDetail";
import FestivalCalendar from "./components/CalendarPage/FestivalCalendar";
import FindPage from "./components/FindPage/FindPage";
import FestivalList from "./components/FestivalList/FestivalList";
import Login from "./components/LoginPage/Login";
import { useEffect, useState } from "react";
import Search from './components/SearchPage/Search';
import SignUp from './components/SignUp/SignUp';
import FestivalUpdate from './utils/FestivalUpdate';

const App = () => {
const [searchWord,setSearchWord] = useState('');
const [contentID,setContentID] = useState('');
//현재 위치 설정
const [baseLocate, setBaseLocate] = useState({
  lat: 37.54699,
  lng: 127.09598,
}); //기본 설정 위치
const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setBaseLocate({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => setErrorMsg("위치 정보를 불러올 수 없어 기본 위치로 설정합니다.")
      );
    } else {
      setErrorMsg("브라우저가 위치 정보를 지원하지 않습니다.");
    }
  }, []);

  return (
    <HashRouter>
      <TopMenubar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Mainpage baseLocate={baseLocate}/>} />
          <Route path="/search" element={<Search setSearchWord={setSearchWord} setContentID={setContentID}/>}/>
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/pwcheck" element={<PasswordCheck />} />
          <Route path="/editinfo" element={<EditInfo />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route path="/delete-complete" element={<DeleteComplete />} />
          <Route path="/comment-list" element={<CommentList/>} />
          <Route path="/my-marks" element={<MyMarks />} />
          <Route path="/mainMap" element={<MainMap baseLocate={baseLocate}/>}/>
          <Route path="/festivals/:contentid" element={<FestivalDetail baseLocate={baseLocate}/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/list/:regionId" element={<FestivalList setSearchWord={setSearchWord} searchWord={searchWord}/>}/>
          <Route path="/festivalCalendar" element={<FestivalCalendar /> } />
          <Route path="/find/*" element={<FindPage />} />
          <Route path="/mainMap" element={<MainMap baseLocate={baseLocate}/>}/>
          <Route path="/festivals/:contentid" element={<FestivalDetail baseLocate={baseLocate}/>} />
          <Route path="/signup/*" element={<SignUp/>}/>
          <Route path="/festupdate" element={<FestivalUpdate/>}/>
        </Routes>
      </div>
      <BottomMenuBar />
    </HashRouter>
  );
};

export default App;
