import { useEffect, useMemo, useState } from 'react';
import { Allfestival } from '../../utils/FestivalAPI';
import { PiMapPinArea } from "react-icons/pi";
import { IoSearch } from "react-icons/io5";
import { ReactComponent as ScrapIconon } from '../../icons/ScrapIcon-on.svg';
import { ReactComponent as ScrapIconoff } from '../../icons/ScrapIcon-off.svg';
import { addFavorites } from '../../utils/FestivalAPI';
import { getUserInfo } from '../../utils/LocalStorage';
import { useNavigate, useParams } from 'react-router-dom';
import Popup from '../Popup';
import { fetchFavorites } from '../../utils/FestivalAPI';
import FestivalWrap from '../MainPage/FestivalWrap';

const FestivalList = ({ setSearchWord, searchWord }) => {
  const [search, setSearch] = useState(searchWord || '');
  const { regionId } = useParams();
  // 메인 지역 선택 값을 저장할 상태(전체,동부,서부,남부)
  const [selectedRegion, setSelectedRegion] = useState('all');
  // 현재 활성화된 하위 지역 버튼의 값을 저장할 상태(수원,안양 등)
  const [activeSubRegion, setActiveSubRegion] = useState('전체');
  // 수파베이스의 모든 페스티벌 정보를 저장할 상태
  const [allFestivals, setAllFestivals] = useState([]);
  // 필터링, 검색, 정렬된 축제 데이터를 저장할 상태(화면에 보여줄)
  const [fillteredFestivals, setFillteredFestivals] = useState([]);
  // 진행중 체크박스 상태관리
  const [showOngoing, setShowOngoing] = useState(false);
  // 정렬 순서 상태관리 (개최순,마감순)
  const [sortOrder, setSortOrder] = useState('closest');
  // 로딩 상태 관리
  const [loading, setLoading] = useState(true);
  // 에러 상태 관리
  const [error, setError] = useState(null);
  // 찜하기 버튼 상태관리
  const [isLike, setIsLike] = useState({});
  // 팝업창 관리 
  const [popUp, setPopUp] = useState(false);
  // 팝업창 내용 관리
  const [popUpContent, setPopUpContent] = useState({
    mainText: "",
    subText: "",
    btnText: "확인",
  });
  // 이동 관리
  const navigate = useNavigate('');
  // 모든 지역 데이터
  const regionDataMap = {
    east: ['전체', '가평', '구리', '광주', '남양주', '성남', '양평', '하남'],
    west: ['전체', '군포', '과천', '광명', '부천', '시흥', '안산', '안양', '의왕'],
    south: ['전체', '수원', '안성', '여주', '오산', '용인', '이천', '평택', '화성'],
    north: ['전체', '고양', '김포', '동두천', '양주', '연천', '의정부', '파주', '포천'],
  };


  // 검색어 받아오기
  useEffect(() => {
    setSearch(searchWord || '');
  }, [searchWord]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (setSearchWord) setSearchWord(value);
  };

  //찜 상태 가져오기
  useEffect(() => {
    const userFavorites = async () => {
      const userInfo = getUserInfo();

      if (userInfo && userInfo.id) {
        try {
          const { data, error } = await fetchFavorites(userInfo.id);

          if (data && !error) {
            const likeState = {};
            data.forEach(item => {
              if (item.festivals && item.festivals.contentid) {
                likeState[item.festivals.contentid] = true;
              }
            });
            setIsLike(likeState);
          }
        } catch (err) {
          console.error('찜 목록 불러오기 중 오류 발생', err);
        }
      }
    };
    userFavorites();
  }, []);

  // 데이터 불러오기 (처음 렌더링때 한 번만 실행)
  useEffect(() => {
    const fetcheAllData = async () => {
      setLoading(true); // 로딩 시작
      try {
        const { data, error: fetchError } = await Allfestival();
        if (fetchError) {
          setError(fetchError);
          console.log('축제 데이터 불러오기 실패', fetchError);
        } else {
          setAllFestivals(data); //모든 축제 원본 데이터 저장
          setFillteredFestivals(data); //화면에 보여줄 최종 데이터 저장
        }
      } catch (err) {
        setError(err);
        console.log('데이터를 불러오는 중 예상치 못 한 에러 발생', err)
      } finally {
        setLoading(false);//로딩 종료
      }
    };
    fetcheAllData();
  }, []);

    //필터링 및 정렬
    // useMemo는 연산 결과를 메모이제이션 불필요한 재계산을 피하는 hook
    const filteredFestivals = useMemo(() => {
    // 복사본 만들기
    let currentFiltered = [...allFestivals]; //원본 데이터로 시작
    //1.메인 지역 필터링(동,서,남,북)
    if (selectedRegion !== 'all' && regionDataMap[selectedRegion]) {
      //선택된 권역 도시들(수원,안양 등)
      const selectedRegionCities = regionDataMap[selectedRegion];
      // 전체 버튼을 제외한 도시 버튼믈 모음
      const citiesToFilterBy = selectedRegionCities.filter(ctiy => ctiy !== '전체');
      // 만약에 필터링할 도시가 있다면
      if (citiesToFilterBy.length > 0) {
        // `currentFiltered`에 있는 각 축제(festival)를 하나씩 확인하면서 필터링
        // 축제의 `addr1` (주소)에 `citiesToFilterBy` 배열 안의 어떤 도시 이름이라도 포함되면 통과
        // 예를 들어, '경기 남부권'을 선택하면 '수원', '안성', '여주' 등 중 하나라도 주소에 있는 축제만 남음
        currentFiltered = currentFiltered.filter(festival =>
          citiesToFilterBy.some(city => festival.addr1 && festival.addr1.includes(city))
        );
      }
    }
    // 만약에 도시(수원,안양)을 선택했을때 전체가 아니고  selectedRegion값과 같지 않을 때만 필터링
    // activeSubRegion 특정 도시 이름이 있다면 그 도시의 축제만 남기기
    if (activeSubRegion !== '전체' && activeSubRegion !== selectedRegion) {
      currentFiltered = currentFiltered.filter(festival =>
        festival.addr1 && festival.addr1.includes(activeSubRegion)
      );
    }

    // 검색어 필터링
    //만약에 검색어가 입력이 되었다면 
    if (search && search.length >= 2) {
      const trimmedSearch = search.trim(); // 검색어 공백 제거 
      // 축제의 제목, 주소, 내용 하나라도 검색어가 입력되면 필터링 통과
      currentFiltered = currentFiltered.filter(festival =>
        (festival.title && festival.title.includes(trimmedSearch)) ||
        (festival.addr1 && festival.addr1.includes(trimmedSearch)) ||
        (festival.overview && festival.overview.includes(trimmedSearch))
      );
    }

    // 진행중인 축제(체크박스) 필터링 
    // 만약 체크박스가 체크가 되었다면
    if (showOngoing) {
      const today = new Date(); // 오늘 날짜 기준으로 정렬
      currentFiltered = currentFiltered.filter(festival => {
        const startdate = new Date(festival.startdate);
        const enddate = new Date(festival.enddate);
        return startdate <= today && enddate >= today
      });
    }

    // 정렬(select)옵션 정렬 시키기
    currentFiltered.sort((a, b) => {
      if (sortOrder === 'closest') {
        const today = new Date();
        const dateA = new Date(a.startdate || a.startdate)
        const dateB = new Date(b.startdate || b.startdate)

        //유효하지 않은 날짜 처리
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;

        const diffA = dateA.getTime() - today.getTime();
        const diffB = dateB.getTime() - today.getTime();

        const isAFuture = diffA >= 0;
        const isBFuture = diffB >= 0;

        if (isAFuture && !isBFuture) return -1;
        if (!isAFuture && isBFuture) return 1;

        if (isAFuture && isBFuture) {
          return diffA - diffB;
        } else {
          return diffB - diffA;
        }
      } else {

        const dateA = new Date(sortOrder === 'start' ? a.startdate : a.enddate);
        const dateB = new Date(sortOrder === 'start' ? b.startdate : b.enddate);

        // 유효하지 않은 날짜 처리 
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;

        return dateA.getTime() - dateB.getTime();
        // 오름차순 (개최순/마감순)
      }
    });
    // currentFiltered로 정리해둔 내용을 화면에 뿌려줄 setFillteredFestivals에 저장
    setFillteredFestivals(currentFiltered);
  }, [selectedRegion, activeSubRegion, search, showOngoing, sortOrder, allFestivals]);

  useEffect(() => {
  if (regionId) {
    if (regionDataMap[regionId]) {
      setSelectedRegion(regionId);
      setActiveSubRegion(regionDataMap[regionId][0]); // 기본값 '전체'
    } else {
      setSelectedRegion('all');
      setActiveSubRegion('전체');
    }
  }
}, [regionId]);

  // 메인 셀렉트 박스 변경 핸들러
  const handleRegionChange = (e) => {
    const newSelectedRegion = e.target.value;
    setSelectedRegion(newSelectedRegion);
    // 새로운 권역 선택 시, 해당 권역의 첫 번째 항목('전체')을 기본 활성화로 설정
    // 'all'(경기도 전체)을 선택하면 '전체'로 초기화
    if (newSelectedRegion !== 'all' && regionDataMap[newSelectedRegion]) {
      setActiveSubRegion(regionDataMap[newSelectedRegion][0]); // 예를 들어 '전체'가 첫번째라고 가정
    } else {
      setActiveSubRegion('전체'); // 'all' 선택 시 기본값
    }
  };

  // 하위 지역 버튼 클릭 핸들러
  const handleSubRegionClick = (regionName) => {
    setActiveSubRegion(regionName);

    // 여기에서 ${selectedRegion}과 ${regionName}을 사용하여 API 호출 
  };

  // 하위 지역 버튼들을 렌더링하는 헬퍼 함수
  const renderRegionButtons = (regionList) => {
    if (!regionList) return null; // 데이터가 없을 경우 처리

    return regionList.map((regionName) => (
      <li key={regionName}>
        <button
          type='button'
          className={`region-button ${regionName === '전체' ? 'all-region' : 'sub-region'} ${activeSubRegion === regionName ? 'active' : ''}`}
          //region-button 기본 공통 스타일 
          //all-region '전체'버튼 적용 스타일
          //sub-region '전체'를 제외한 버튼 적용 스타일
          onClick={() => handleSubRegionClick(regionName)}
        >
          {regionName}
          {regionName === '전체' && <PiMapPinArea />}
        </button>
      </li>
    ));
  };

  // 현재 선택된 지역에 해당하는 데이터 가져오기
  const currentRegionButtonsData = regionDataMap[selectedRegion];
  // 체크박스 이벤트 함수
  const handleCheckbox = (e) => {
    setShowOngoing(e.target.checked);
  };

  // 현재 축제 상황 뱃지 만들기 (진행중/D-3)
  const getFestivalStatus = (festival) => {
    const today = new Date();
    // 날짜 비교를 위해 시간은 자정으로 설정하기 
    today.setHours(0, 0, 0, 0);
    // 시작 날짜 시간 설정
    const startDate = new Date(festival.startdate);
    startDate.setHours(0, 0, 0, 0);
    // 종료 날짜 시간 설정
    const endDate = new Date(festival.enddate)
    endDate.setHours(0, 0, 0, 0);
    // 유효하지 않은 날짜들 처리
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { text: "" };// 유효하지 않은 날짜들은 빈칸으로 처리 
    }
    // 진행중인 축제 뱃지 처리 (오늘 >=시작일 & 오늘 <=종료일)
    if (startDate <= today && endDate >= today) {
      return { text: '진행중', className: 'status-ongoing' };
    }
    // 앞으로 열릴 축제 뱃지 처리(시작일 > 오늘)
    else if (startDate > today) {
      const diffTime = startDate.getTime() - today.getTime();
      // 밀리초 단위를 일 단위로 변환(올림 처리)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        return { text: '진행중', className: 'status-today' };
      } else { // 디데이 처리
        return { text: `D-${diffDays}`, className: 'status-dday' };
      }
    }
    return { text: '행사 종료', className: 'status-endded' };
  };

  const toggleLike = async (contentid) => {
    // 로그인 정보 먼저 확인하기
    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.id) {
      // 로그인 필요 팝업창 넣기
      setPopUpContent({
        mainText: "로그인이 필요합니다",
        subText: "찜하기 기능을 이용하려면 로그인해주세요!"
      });
      setPopUp(true);
      return;
    }

    // 현재 찜 상태 확인 (추가할지 취소할지 미리 알아두기)
    const isCurrentlyLiked = isLike[contentid] || false;

    // UI 상태 업데이트
    setIsLike(prev => ({
      ...prev, [contentid]: !isCurrentlyLiked
    }));

    // 찜하기 api호출 적용
    try {
      // API 호출
      await addFavorites(userInfo.id, contentid);

      // API 호출은 성공했고, 이제 찜 상태에 따라 팝업 메시지 결정
      if (!isCurrentlyLiked) { // 찜 추가한 경우
        setPopUpContent({
          mainText: "스크랩 성공",
          subText: "축제가 스크랩 목록에 추가되었습니다."
        });
      } else { // 찜 취소한 경우
        setPopUpContent({
          mainText: "스크랩 취소",
          subText: "축제가 스크랩 목록에서 삭제되었습니다."
        });
      }
      setPopUp(true);

    } catch (err) {
      console.error('api 호출 중 오류 발생', err);
      // 에러 발생 시 UI 상태 롤백
      setIsLike(prev => ({
        ...prev, [contentid]: isCurrentlyLiked
      }));
      setPopUpContent({
        mainText: "오류 발생",
        subText: "스크랩 중 알 수 없는 오류가 발생했습니다."
      });
      setPopUp(true);
    }
  };

  return (
    <div id='festivalList'>
      <nav className="region-filter">
        <div className='filter'>

          <select
            id="regionSelect"
            className="region-dropdown"
            value={selectedRegion}
            onChange={handleRegionChange}
          >
            <option value="all">경기도 전체</option>
            <option value="east">경기 동부권</option>
            <option value="west">경기 서부권</option>
            <option value="south">경기 남부권</option>
            <option value="north">경기 북부권</option>
          </select>
          
          <form className="search-container"
          onSubmit={(e)=>{e.preventDefault()}}>
            <input
              type='text'
              placeholder='검색'
              value={search}
              onChange={handleSearchChange}
            />
            <button type="submit"><IoSearch /></button>
          </form>
        </div>

        {/* selectedRegion이 'all'이 아닐 때만 해당 지역 버튼 목록을 렌더링 */}
        {selectedRegion !== 'all' && currentRegionButtonsData && (
          <ul id={`${selectedRegion}Regions`} className="region-list">
            {renderRegionButtons(currentRegionButtonsData)}
          </ul>
        )}

        {/* '경기도 전체'가 선택되었을 때 메시지 표시 */}
        {selectedRegion === 'all' && (
          <p style={{ marginTop: '20px', marginBottom: '10px', textAlign: 'center', color: '#999999' }}>
            지역을 선택하시면 세부 지역 목록이 표시됩니다.
          </p>
        )}

      </nav>
      {fillteredFestivals.length > 0 && (
        <div className='festival-info-container'>
          <p>
            {search.trim() !== '' && ('검색 결과 ')}
          <span>{fillteredFestivals.length}개</span>의 축제가 있어요!</p>
          <div className='controls-wrapper'>
            <label htmlFor="check">
              <input
                checked={showOngoing}
                onChange={handleCheckbox}
                type='checkbox'
                id='check'
                name='check' />
              진행중 <span> | </span></label>
            <select
              className="sort-select"
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value) }}
            >
              <option value="closest">추천순</option>
              <option value="start">개최순</option>
              <option value="end">마감순</option>
            </select>
          </div>
        </div>)}
      <div className='fillter-list-display'>
        {loading && <p className='loading-message' style={{ marginTop: '20px', marginBottom: '10px', textAlign: 'center', color: '#999999' }}>
          축제 정보를 불러오는 중입니다...</p>}
        {error && <p className='error-message' style={{ marginTop: '20px', marginBottom: '10px', textAlign: 'center', color: '#999999' }}>
          축제 정보를 불러오는데 실패했어요: {error.message}</p>}
        {!loading && !error && fillteredFestivals.length === 0 && (
          <div className='no-results'>
            <p className='no-search'> "{search}"
              <br />검색 결과가 없어요</p>
              
            <div className='festivalWrap'>
              <h1 className='festivalWrap-name'>이런 축제는 어때요?</h1>
              <FestivalWrap /></div>
          </div>
        )}
        {!loading && !error && fillteredFestivals.length > 0 && (
          <div className='festival-grid'>
            {fillteredFestivals.map((festival) => {
              const { text: statusText, className: statusClass } =
                getFestivalStatus(festival);
              return <div key={festival.contenid || festival.title}
                className='festival-card'
                onClick={() => {
                  navigate(`/festivals/${festival.contentid}`)
                }}
              >
                <div className={`status-badge${statusClass}`}>
                  {statusText}
                </div>
                <button
                  className='favorite-btn'
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(festival.contentid)
                  }}>
                  {isLike[festival.contentid] ? <ScrapIconon /> : <ScrapIconoff />}</button>
                <img
                  src={festival.firstimage}
                  alt={festival.title}
                  className='festival-firstimage' />
                <div className='festival-info'>
                  <h3 className='festival-title'>{festival.title}</h3>
                  <p className='festival-date'>{festival.startdate} ~ {festival.enddate}</p>
                  <p className='festival-address'>{festival.addr1.split(" ").slice(0, 3).join(" ")}</p>
                </div>
              </div>
            })}
          </div>
        )}
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

export default FestivalList;