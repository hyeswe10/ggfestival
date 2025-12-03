import axios from "axios";
import { useEffect, useState } from "react";
import { festivalDB } from "./FestivalAPI";
import response from './SigunguCode.json';

const FestivalUpdate = () => {
    const API_KEY = process.env.REACT_APP_FESTIVAL_KEY;
    const URL_BASE = process.env.REACT_APP_FESTIVAL_BASE;
    const getSigunguName = (code) => {
        const matched = response.response.body.items.item.find(
        (item) => item.code === String(code)
        );
        return matched ? matched.name : '';
    };
    //한번에 가져오기
    const fetchAndSave = async ()=>{
        console.log('시작');
        try{
            const searchRes = await axios.get(`${URL_BASE}/searchFestival2`,{
                params:{
                    serviceKey: encodeURIComponent(API_KEY),
                    MobileOS: 'ETC',
                    MobileApp: 'ggfestival',
                    eventStartDate: '20251001',
                    areaCode: 31,
                    numOfRows: 200,
                    _type: 'json'
                }
            })
            const items = searchRes.data.response.body.items.item;

            for (const item of items){
                const contentid = item.contentid;
                const sigungucode = item.sigungucode;
                //공통정보 꺼내오기
                const commonRes = await axios.get(`${URL_BASE}/detailCommon2`,{
                    params:{
                        serviceKey: encodeURIComponent(API_KEY),
                        MobileOS: 'ETC',
                        MobileApp: 'ggfestival',
                        contentId: contentid,
                        _type: 'json'
                    }
                })
                //소개정보 꺼내오기
                const introRes = await axios.get(`${URL_BASE}/detailIntro2`,{
                    params:{
                        serviceKey: encodeURIComponent(API_KEY),
                        MobileOS: 'ETC',
                        MobileApp: 'ggfestival',
                        contentId: contentid,
                        contentTypeId: 15,
                        _type: 'json'
                    }
                })
                const extraFilter = (res)=>{
                    const item = res?.data?.response?.body?.items?.item;
                    if(!item) return {};
                    return Array.isArray(item) ? item[0] : item;
                }
                const common = extraFilter(commonRes);
                const intro = extraFilter(introRes);

                const sigunguName = getSigunguName(sigungucode);

                //배열화시키기
                const festivals = {
                    contentId: contentid,
                    title: item.title,
                    startDate: item.eventstartdate,
                    endDate: item.eventenddate,
                    sigunguCode: sigunguName,
                    addr: item.addr1,
                    sponsorName: common.telname || null,
                    sponsorTel: common.tel || null,
                    price: intro.usetimefestival,
                    overview: common.overview || null,
                    mapx: item.mapx,
                    mapy: item.mapy,
                    ageLimit: intro.agelimit,
                    playTime: intro.playtime,
                    firstImage: item.firstimage,
                    firstImage2: item.firstimage2
                }
                await festivalDB(festivals);
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
            console.log('완료');
        } catch(e){
            console.log(e);
        }
    }

    //경기도 축제중에서 
    return (
        <div id="fest-update">
        <button onClick={fetchAndSave}>저장하기</button>
        </div>
    );
};

export default FestivalUpdate;