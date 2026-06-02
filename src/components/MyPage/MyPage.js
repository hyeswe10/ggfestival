import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { getUserInfo } from '../../utils/LocalStorage';
import { removeUserInfo } from '../../utils/LocalStorage';

import { FaRegComment } from "react-icons/fa6";
import { FaRegBell } from "react-icons/fa";
import { BiPencil } from "react-icons/bi";
import Popup from '../Popup2';
import MarkWrap from './MarkWrap';

const MyPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const info = getUserInfo();
    if (info) {
      setUserInfo(info);
    }
  }, []);

  const isMark = false;

  // 로그아웃 버튼 클릭 → 팝업 띄우기
  const handleLogoutClick = () => {
    setShowPopup(true);
  };

  // 팝업에서 확인 → 로그아웃 처리
  const handleConfirmLogout = () => {
    removeUserInfo();
    navigate('/');
  };

  // 팝업에서 취소 → 팝업 닫기
  const handleCancelLogout = () => {
    setShowPopup(false);
  };


  const handleGoPWCheck = () => {
    navigate('/pwcheck');
  }

  if (!userInfo) {
    return (
      <Popup
        popup
        mainText="로그인 정보가 없습니다"
        subText="먼저 로그인을 해주세요"
        cancelText="취소"
        confirmText="확인"
        onClose={() => {
          setShowPopup(false);
          navigate('/login');
        }}
      />
    );
  }


  return (
    <div className='mypage'>
      {showPopup && (
        <Popup
          mainText="로그아웃 하시겠습니까?"
          cancelText="취소"
          confirmText="로그아웃"
          onConfirm={handleConfirmLogout} // 확인
          onClose={handleCancelLogout}    // 취소
        />
      )}
      <div className='user-info'>
        <div className='profile-pic'>
          <img src={userInfo.profile_image_url} />
        </div>
        <div className='user-details'>
          <p>반갑습니다!</p>
          <h4>{userInfo.name}님</h4>
        </div>
        <BiPencil className="edit-icon" onClick={handleGoPWCheck} />
      </div>

      <div className="wrap">
        <div className="btn-list">
          <button onClick={() => navigate('/comment-list')}>
            <FaRegComment />
            <p>내 댓글 관리</p>
          </button>
          <button>
            <FaRegBell />
            <p>알림함</p>
          </button>
        </div>
        <MarkWrap Id={userInfo.id} />

        <ul className="menu-list">
          <li>고객센터</li>
          <li>알림설정</li>
          <li onClick={handleLogoutClick}>로그아웃</li>
        </ul>
      </div>



    </div>
  );
};

export default MyPage;