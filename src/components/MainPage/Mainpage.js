import { useState } from 'react';
import { getUserInfo, saveUserInfo } from '../../utils/LocalStorage';
import { useNavigate } from 'react-router-dom';


import { ReactComponent as Mapicon } from '../../icons/main-map.svg';
import { ReactComponent as Calicon } from '../../icons/main-calendar.svg';
import { IoSearch } from "react-icons/io5";

import FestivalWrap from './FestivalWrap';
import Comming from './Comming';
import GMap from './GMap';
import FestivalUpdate from '../../utils/FestivalUpdate';

const Mainpage = ({baseLocate}) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(getUserInfo());
  return (
    <main className='mainpage'
      style={{
        backgroundImage: `url('${process.env.PUBLIC_URL}/images/bg.png')`,
      }}
    >
      <section className='mainpage-section'>
        {/* 검색 페이지 이동 연결 */}
        <div className='search-wrap' onClick={() => navigate('/search')}>
        <input placeholder='축제를 검색해 보세요' readOnly />
        <IoSearch />
        </div>

      </section>
      <section className='mainpage-section'>
        <GMap />
      </section>

      <section className='mainpage-section'>
        <div className='btn-wrap'>
          <button onClick={() => navigate('/mainMap')}>
            <Mapicon className='icon' />
            <div className='top'>
              <p>Map</p>
            </div>
            <div className='bottom' onClick={() => navigate('/mainMap')}>
              <p>내 주변 축제 한눈에 확인</p>
              <h3 >경기도 축제 지도</h3>
            </div>
          </button>

          <button onClick={() => navigate('/festivalCalendar')}>
            <Calicon className='icon' />
            <div className='top'>
              <p>Calendar</p>
            </div>
            <div className='bottom'>
              <p>날짜별 행사 기간 확인</p>
              <h3>경기도 축제 달력</h3>
            </div>
          </button>
        </div>
      </section>
      {/* 로그인 && 찜 목록에 다가올 축제가 있을 경우 */}
      {userInfo &&
        <section className='mainpage-section'>
          <Comming baseLocate={baseLocate} />
        </section>
      }

      <section className='mainpage-section'>
        <div className='popular'>
          <div className='title'>
            <h3>
              인기 있는 축제
            </h3>
            <p>모일수록 커지는 즐거움</p>
          </div>
          <FestivalWrap />
        </div>
      </section>
    </main>
  );
};

export default Mainpage;