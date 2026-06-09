import { createClient } from "@supabase/supabase-js";
import { data } from "react-router-dom";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 혹시 적용이 안되는 부분이 있으시면 꼭 말씀해주세요!
// 수정 후 다시 배포해드리겠습니다!

//** 로그인** //

//1. 로그인 하기에 사용하는 api (확인 완료)
//필요한 정보 : input에 입력된 userid와 password
export const fetchLogin = async (userID, password) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('userid', userID)
    .eq('password', password)
    .single();
  return { data, error };
}

//2. 아이디 찾기에 사용하는 api (확인완료)
//필요한 정보 : input에 입력된 name과 email
export const findUserId = async (userName, email) => {
  const { data, error } = await supabase
    .from('users')
    .select('userid')
    .eq('userName', userName)
    .eq('email', email)
    .maybeSingle();
  return { data, error };
}

//3. 비밀번호 변경에 사용하는 api
//필요한 정보: input에 입력된 name, userID, email에 맞는 비밀번호를 찾아서 새로운 비밀번호로 변경하기
// 비밀번호 업데이트로 수정하기

export const findInfoPw = async (userName, userID, email) => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('userName', userName)
    .eq('userid', userID)
    .eq('email', email)
    .single();
  return { data, error };
}
// 해당정보 비밀번호 변경
export const findPassword = async (id, newPass) => {
  const { data, error } = await supabase
    .from('users')
    .update({ password: newPass })
    .eq('id', id)
  return { data, error };
}

// 새 비밀번호로 변경 (Supabase 기본 기능 활용)
// // 이 함수는 '새 비밀번호 설정' 페이지에서 사용자가 새 비밀번호를 입력하고 '변경하기' 버튼을 누르면 호출
// export const updatePassword = async (newPassword) => {
//     try {
//         const { error } = await supabase.auth.updateUser({
//             password: newPassword,
//         });

//         if (error) {
//             console.error('비밀번호 업데이트 실패:', error.message);
//             return { success: false, message: '비밀번호 변경에 실패했습니다.' };
//         } else {
//             console.log('비밀번호가 성공적으로 업데이트되었습니다.');
//             return { success: true, message: '비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요!' };
//         }
//     } catch (err) {
//         console.error('예상치 못한 오류:', err);
//         return { success: false, message: '알 수 없는 오류가 발생했습니다.' };
//     }
// };

//** 회원가입 **//

//1. 중복된 아이디 확인 절차에 사용하는 api (확인완료)
// 중복된 아이디 확인을 위한 users테이블의 userID 정보 가져오기
export const checkUserID = async (userID) => {
  const { data, error } = await supabase
    .from('users')
    .select('userid')
    .eq('userid', userID)
    .maybeSingle();
  return { exists: !!data, error };
}

//2. 중복된 이메일 확인 절차에 사용하는 api (확인 완료)
//  중복된 이메일 확인을 위한 users테이블의 email 정보 가져오기
export const checkEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .maybeSingle();
  return { exists: !!data, error };
}

// 3. (회원가입)회원가입 시 input에 들어갈 정보들 저장 시켜주는 api와 랜덤 이미지 배정(확인완료)
export const fetchSignUp = async ({ userID, password, userName, email, phone }) => {
  try {
    //1. 랜덤 프로필 이미지 URL 가져오기
    const { data: profileImageUrl, error: imageError } = await
      getRandomProfile();
    if (imageError || !profileImageUrl) {
      console.warn('랜덤 프로필 이미지 가져오기 실패, 기본값으로 설정 또는 오류 처리');

      // 이미지 가져오기 실패 시 기본 이미지 URL 사용 또는 에러 처리
      return { success: false, error: imageError || { message: "프로필 이미지 할당 실패" } };
    }
    //2. 사용자 정보와 함께 랜덤 프로필 이미지 url 삽입
    const { error } = await supabase
      .from('users')
      .insert([{
        userid: userID,
        password: password,
        name: userName,
        email: email,
        phone: phone,
        profile_image_url: profileImageUrl
      }]);

    return { success: !error, error };
  } catch (err) {
    console.log('회원가입 오류:', err);
    return { success: false, error: err };
  }
};

// 4. 랜덤 프로필 이미지 url을 가져오는 api (확인완료)
export const getRandomProfile = async () => {
  try {
    //db에 저장된 이미지 총 개수를 먼저 가져옴
    const { count, error: countError } = await supabase
      .from('profile_images')
      .select('id', { count: 'exact' });

    if (countError) throw countError;
    // 만약 이미지가 하나도 없으면
    if (count === 0) return { data: null, error: 'No profile images available ' };
    // 0부터 (총 개수 - 1) 사이의 랜덤 숫자 생성
    const randomIndex = Math.floor(Math.random() * count);
    //해당 인덱스(offset)의 이미지를 하나만 가져옴
    const { data: randomImage, error: fetchError } = await supabase
      .from('profile_images')
      .select('image_url')
      .range(randomIndex, randomIndex)
      // 지정된 범위의 데이터를 가져옴 (offset, limit - 1)
      .single(); // => 결과가 하나라고 가정

    if (fetchError) throw fetchError;
    return { data: randomImage.image_url, error: null } // 이미지 url만 반환
  } catch (error) {
    console.error("랜덤 이미지 가져오기 실패:", error);
    return { data: null, error: error };
  }
};

// 4. 회원정보 탈퇴시 사용해야하는 api

//회원정보 탈퇴 (확인 완료)
export const fetchDeleteUser = async (id) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    return { success: !error, error };
  } catch (err) {
    return { success: false, error: err };
  }
};

//** 마이페이지 **//

// 1. 마이페이지에서 내 정보 불러오기에 사용하는 api
// 내 정보 가져오기 (확인 완료)
export const fetchUserInfo = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
  return { data, error };
}

// 2. 마이페이지에서 내가 작성한 댓글 불러오기에 사용하는 api
// 내가 작성한 댓글 가져오기 
export const fetchComment = async (userID) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*,users(userName)')
      .eq('userid', userID)
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

//3-1. 회원정보 변경(이름,비밀번호,휴대폰 번호만 변경가능)에 사용하는 api(확인완료)
export const changeInfo = async ({
  userId,
  newPass,
  newName,
  newPhone
}) => {
  const { error } = await supabase
    .from('users')
    .update({
      password: newPass,
      userName: newName,
      phone: newPhone
    })
    .eq('userid', userId);
  return { error };
}

//3-2.  회원정보 변경 시 비밀번호로 회원정보 확인(확인완료)
export const checkPass = async (userID, password) => {
  const { data, error } = await supabase
    .from('users')
    .select("*")
    .eq('userid', userID)
    .eq('password', password)
    .single();
  return { data, error }
}

//4. 마이페이지에서 내가 찜한 축제정보 불러오기에 사용하는 api
// 내가 찜한 축제정보 가져오기(썸네일 이미지firstimage2, 시작일eventstartdate, 종료일eventenddate, 주소1addr1)
export const fetchFavorites = async (id) => {
  const { data, error } = await supabase
    .from('favorites')
    .select(`id,
    festivalid,
    userid,
    festivals:festivalid(
        contentid,
        title,
        firstimage,
        startdate,
        enddate,
        addr1
    )
    `)
    .eq('userid', id);
  return { data, error };
};


//5. 프로필 정보 모두 가져오는 api
export const getAllProfiles = async () => {
  try {
    const { data, error } = await supabase.from('profile_images').select('image_url');
    if (error) return { data: [], error };
    return { data: data.map(item => item.image_url), error: null };
  } catch (err) {
    return { data: [], error: err };
  }
};


// ** 축제 정보 페이지 ** //


// 1. 댓글 추가(댓글 달기)에 사용하는 api
export const addComment = async (userID, contentid, content) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      content: content,
      userid: userID,
      contentid: contentid,
    }])
    .select(); // returning: 'representation' 역할 // ***효진 추가
  return { data, error };
}


//2. 댓글 수정하기에 사용하는 api
export const changeComment = async (id, userID, newContent) => {
  const { data, error } = await supabase
    .from('comments')
    .update({ content: newContent })
    .eq('id', id)
    .eq('userid', userID)
  return { data, error };
};

//3. 댓글 삭제하기에 사용하는 api
export const deleteComment = async (id, userID) => {
  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)
    .eq('userid', userID)
  return { data, error };
};

// 4. 모든 댓글 불러오가 api
export const AllComments = async (contentid) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`*,
        users:userid(
        userName,
        profile_image_url)`
    )
    .eq('contentid', contentid)
    .order('created_at', { ascending: false }); //최신순으로 정렬
  return { data, error };
};


//4. 찜하기 토글 기능 (찜 했으면 취소/안했으면 추가)에 사용하는 api
export const addFavorites = async (userID, contentid) => {
  try {
    const { data: festivalData, error: festivalError } = await supabase
      .from('festivals')
      .select('id')
      .eq('contentid', contentid)
      .maybeSingle();

    //축제 정보가 없으면 에러처리
    if (festivalError || !festivalData) {
      console.log('축제 정보를 찾을 수 없습니다', festivalError);
      return { success: false, message: "축제 정보를 찾을 수 없습니다." };
    }

    let festivalID = festivalData.id;

    // 이미 찜 했는지 확인 후 찜한 상태면 삭제 (찜 취소) 
    const { data: existingFav } = await supabase
      .from('favorites')
      .select()
      .eq('userid', userID)
      .eq('festivalid', festivalID)
      .maybeSingle();

    if (existingFav) {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('userid', userID)
        .eq('festivalid', festivalID);
      if (deleteError) throw deleteError;
      return { success: true, message: "찜하기가 취소되었습니다!", action: "removed" };
    } else {
      //찜하지 않은 상태면 추가(찜하기)
      const { error: favoriteError } = await supabase
        .from('favorites')
        .insert({
          userid: userID,
          festivalid: festivalID
        });

      if (favoriteError) throw favoriteError;
      return { success: true, message: "축제를 찜했습니다!", action: "added" };
    }
  } catch (err) {
    console.error('찜하기 오류:', err);
    return { success: false, message: "찜하기에 실패했습니다." };
  }
};


//5. 축제 정보 전체 다 가져오기
export const Allfestival = async () => {
  const { data, error } = await supabase
    .from('festivals')
    .select('*')
  return { data, error };
}

// ** festivals 데이터 저장하기 ** //
// title, startdate, enddate, sigungucode ,contentid , addr1, telname, tel, usetimefestival, overview, 
// mapx, mapy, agelimit, playtime
export const festivalDB = async (festivals) => {
  const { data, error } = await supabase
    .from('festivals')
    .upsert([
      {
        contentid: festivals.contentId,
        title: festivals.title,
        startdate: festivals.startDate,
        enddate: festivals.endDate,
        sigungucode: festivals.sigunguCode,
        addr1: festivals.addr,
        telname: festivals.sponsorName,
        tel: festivals.sponsorTel,
        usetimefestival: festivals.price,
        overview: festivals.overview,
        mapx: festivals.mapx,
        mapy: festivals.mapy,
        agelimit: festivals.ageLimit,
        playtime: festivals.playTime,
        firstimage: festivals.firstImage,
        firstimage2: festivals.firstImage2
      }
    ], { onConflict: 'contentid' })
  return { data, error };
}  

//5개 랜덤으로 불러오기
export const fetchFiveRandom = async ()=>{
    const { data, error } = await supabase
        .from('festivals')
        .select('title, firstimage2, startdate, enddate, sigungucode, contentid')
    return { data, error };
}

//상세페이지 축제
export const fetchContentID = async (contentID) =>{
    const { data, error } = await supabase
        .from('festivals')
        .select('*')
        .eq('contentid',contentID)
    return { data, error };
}

// 찜하기페이지에서 넘겨줄 위경도 불러오기
export const fetchMapxy = async (contentid)=>{
  const { data, error } = await supabase
    .from('festivals')
    .select('mapx, mapy')
    .eq('contentid',contentid)
  return { data, error };
}

