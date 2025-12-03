import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLogin } from '../../utils/FestivalAPI';
import { saveUserInfo } from '../../utils/LocalStorage';
import Popup from '../Popup';


const Login = () => {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [popUp, setPopUp] = useState(false);
  const [popUpContent, setPopUpContent] = useState({
    mainText: "",
    subText: "",
    btnText: "확인",
  });
  const navigate = useNavigate('');


  const LoginSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await fetchLogin(userID, password)
    if(error) {
      setPopUpContent({
        mainText:"등록된 회원 정보가 없습니다",
        subText:"아이디 또는 비밀번호를 다시 확인해 주세요"
      })
      setPopUp(true)
    } else if (data){
      saveUserInfo(data);
      navigate('/')
    }
  }
  return (
    <div id='Login'>
      <div className='header'></div>
      <img className="LoginLogo"
      src={`${process.env.PUBLIC_URL}/images/LoginPage/Login01.png`} 
      alt="한눈에 보는 경기도의 모든 축제! 경축 로고 이미지" />
      <form onSubmit={LoginSubmit}>
        <input
        className='custom-input'
          type='text'
          placeholder='아이디를 입력해 주세요'
          value={userID}
          onChange={(e) => { setUserID(e.target.value) }}
        />
        <input
          className='custom-input'
          type='password'
          placeholder='비밀번호를 입력해 주세요'
          value={password}
          onChange={(e) => { setPassword(e.target.value) }}
        />
        <button type='submit'>로그인</button>
      </form>
      <div className='Login-btn1'>
      <button onClick={()=>{navigate('/signup')}}>회원가입 ＞</button>
      <ul>
      <li><button
      onClick={()=>{navigate('/find')}}>아이디찾기</button></li>
      <li>|</li>
      <li><button
      onClick={()=>{navigate('/find')}}>비밀번호 재설정</button></li>
      </ul>
      </div>
      <p className='sns-info'>SNS계정으로 간편 로그인하세요</p>
      <div className='snsLogin'>
      <button className='kakao'>
      <img
      
      src={`${process.env.PUBLIC_URL}/images/LoginPage/Login02.png`} 
      alt="카카오톡 간편 로그인 이미지" />
      </button>
      <button className='google'>
        <img 
      src={`${process.env.PUBLIC_URL}/images/LoginPage/Login03.png`} 
      alt="구글 간편 로그인 이미지" />
      </button>
      <button className='naver'>
        <img 
      src={`${process.env.PUBLIC_URL}/images/LoginPage/Login04.png`} 
      alt="네이버 간편 로그인 이미지" />
      </button>
      </div>
        {popUp && (
        <Popup
          mainText={popUpContent.mainText}
          subText={popUpContent.subText}
          onClose={() => setPopUp(false)}
        />
      )}
    </div>
  );
};

export default Login;