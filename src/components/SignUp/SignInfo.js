import { useEffect, useState } from "react";
import { checkEmail, checkUserID, fetchSignUp } from "../../utils/FestivalAPI";
import Popup from "../Popup";
import { useNavigate } from "react-router-dom";
import { invalid } from "moment/moment";

const SignInfo = () => {
    const navigate = useNavigate();
    const [email,setEmail] = useState('');
    const [id,setId] = useState('');
    const [pw,setPw] = useState('');
    const [rePass,setRePass] = useState('');
    const [name,setName] = useState('');
    const [phone,setPhone] = useState('');
    const [availEmail, setAvailEmail] = useState(null);
    const [availId, setAvailId] = useState(null);
    const [popUp, setPopUp] = useState(false);
    const [emailCheckBtn,setEmailCheckBtn] = useState(false);
    const [idCheckBtn,setIdCheckBtn] = useState(false);
    const [dupId, setDupId] = useState(false);
    const [dupEmail, setDupEmail] = useState(false);
    const [availPw, setAvailPw] = useState(false);
    const [noName, setNoName] = useState(false);
    const [noPhone, setNoPhone] = useState(false);
    const [noId, setNoId] = useState(false);
    const [noEmail, setNoEmail] = useState(false);
    const [wrongEmail, setWrongEmail] = useState(false);

    // 이메일형식 필터링
    const isValidEmail = (email)=>{
        const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return regex.test(email);
    };
    // 중복확인 ID
    const checkID = async ()=>{
        const { exists, error } = await checkUserID(id);
        if(error){
            console.log('아이디오류');
            return;
        }
        setAvailId(!exists);
    }
    // ID 중복확인 버튼
    const handleCheckID = ()=>{
        if(!id || id.length < 6){
            setNoId(true);
            return;
        }
        checkID();
        setIdCheckBtn(true);
        setDupId(false);
        setNoId(false);
    }
    // 중복확인 Email
    const checkUserEmail = async ()=>{
        const { exists, error } = await checkEmail(email);
        if(error){
            console.log('이메일 오류');
            return;
        }
        setAvailEmail(!exists);
    }
    // Email 중복확인 버튼
    const handleCheckEmail = ()=>{
        if(!email){
            setNoEmail(true);
            setWrongEmail(false);
            return;
        }
        if(!isValidEmail(email)){
            setWrongEmail(true);
            setNoEmail(false);
            return;
        }
        checkUserEmail();
        setEmailCheckBtn(true);
        setDupEmail(false);
        setNoEmail(false);
        setWrongEmail(false);
    }
    // 회원테이블 등록
    const insertSignUp = async()=>{
        const { success, error } = await fetchSignUp({
            userID:id,
            password:pw,
            userName:name,
            email:email,
            phone:phone
        });
        success ? navigate('/signup/complete') : console.log('실패');
    }
    
    // 회원가입 버튼
    const handleSignUp = ()=>{
        //정보 입력누락
        if(!name || !id || !pw || !rePass || !phone || !email){
            setPopUp(true);
            if(!name){
                setNoName(true);
            }
            if(!phone){
                setNoPhone(true);
            }
            return;
        }
        // 이름입력됨(팝업창)
        if(name) {
            setNoName(false);
        }
        // 번호입력됨(팝업창)
        if(phone){
            setNoPhone(false);
        }
        // 중복확인이 되지않은것 체크
        if(!idCheckBtn || !emailCheckBtn){
            if(!idCheckBtn){
                setDupId(true);
            }
            if(!emailCheckBtn){
                setDupEmail(true);
            }
            return;
        }
        // 잘못된 이메일 형식
        if(!isValidEmail(email)){
            setWrongEmail(true);
            return;
        }
        // 비밀번호가 일치하지않을시 리턴
        if(pw !== rePass){
            return;
        }
        insertSignUp();
    }
    // 비밀번호 input 일치하지않는 문구
    useEffect(()=>{
        if(pw && rePass){
            setAvailPw(true);
        } else {
            setAvailPw(false);
        }
    },[pw,rePass])
    // 아이디값이 변경될때마다 다시 중복확인하게
    useEffect(()=>{
        setIdCheckBtn(false);
    },[id])
    // 이메일값이 변경될때마다 다시 중복확인하게
    useEffect(()=>{
        setEmailCheckBtn(false);
    },[email])
    return (
        <div id="sign-info">
            <h3>정보를 입력해주세요.</h3>
            <div className="input-wrap">
                <div className="email">
                    <p>이메일</p>
                    <div>
                        <input 
                            type="text" 
                            placeholder="이메일을 입력해 주세요"
                            value={email}
                            onChange={(e)=>{setEmail(e.target.value)}}
                        />
                        <button 
                            onClick={handleCheckEmail}
                            className={`${email ? "colored" : ""}`}
                        >중복 확인</button>
                    </div>
                    {dupEmail && <p className="not-same">이메일 중복확인이 필요합니다.</p>}
                    {emailCheckBtn && !dupEmail && (
                        availEmail === null ? null : availEmail ? <p className="same">사용 가능한 이메일입니다.</p> : <p className="not-same">이미 존재하는 이메일입니다.</p>
                    )}
                    {noEmail && <p className="not-same">이메일이 입력되지 않았습니다.</p>}
                    {wrongEmail && <p className="not-same">잘못된 형식의 이메일입니다. 영문과 숫자를 사용해주세요.</p>}
                </div>
                <div className="id">
                    <p>아이디</p>
                    <div>
                        <input
                            type="text"
                            placeholder="아이디를 입력해 주세요"
                            value={id}
                            onChange={(e)=>{setId(e.target.value)}}
                        />
                        <button 
                            onClick={handleCheckID}
                            className={`${id ? "colored" : ""}`}
                        >중복 확인</button>
                    </div>
                    {dupId && <p className="not-same">아이디 중복 확인이 필요합니다.</p>}
                    {idCheckBtn && !dupId && (
                        availId === null ? null : availId ? <p className="same">사용 가능한 아이디입니다.</p> : <p className="not-same">이미 존재하는 아이디입니다.</p>
                    )}
                    {noId && <p className="not-same">아이디는 6자 이상 입력해주세요.</p>}
                </div>
                <div className="password">
                    <p>비밀번호</p>
                    <input
                        type="password"
                        placeholder="비밀번호를 입력해 주세요 (8자 이상)"
                        value={pw}
                        onChange={(e)=>{setPw(e.target.value)}}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호를 재입력 해주세요"
                        value={rePass}
                        onChange={(e)=>{setRePass(e.target.value)}}
                    />
                    {availPw && (
                        pw.length >= 8 || rePass.length >= 8 ? pw === rePass ? <p className="same">비밀번호가 일치합니다.</p> : <p className="not-same">비밀번호가 일치하지 않습니다.</p> : <p className="not-same">비밀번호를 8자이상 입력해주세요.</p>
                    )}
                </div>
                <div className="name">
                    <p>이름</p>
                    <input
                        type="text"
                        placeholder="이름을 입력해 주세요"
                        value={name}
                        onChange={(e)=>{setName(e.target.value)}}
                    />
                    {noName && <p className="not-same">이름을 입력해주세요.</p>}
                </div>
                <div className="phone">
                    <p>전화번호</p>
                    <input
                        type="text"
                        placeholder="전화번호를 입력해 주세요"
                        value={phone}
                        onChange={(e)=>{setPhone(e.target.value)}}
                    />
                    {noPhone && <p className="not-same">전화번호를 입력해주세요.</p>}
                </div>
            </div>
            <button className="next-btn" onClick={handleSignUp}>가입하기</button>
            {
                popUp && (
                    <Popup
                        mainText="모든 정보를 입력해 주세요."
                        subText="정보가 입력되어야 가입이 가능합니다."
                        onClose={()=>{setPopUp(false)}}
                    />
                )
            }
        </div>
    );
};

export default SignInfo;