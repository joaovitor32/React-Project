import { useState,useCallback,useEffect } from 'react';

let logoutTimer;

export const useAuth=()=>{
    const [token,setToken]=useState(false);
    const [tokenExpirationDate,setExpirationDate]=useState();
    const [userId,setUserId]=useState(false);
  
    const login=useCallback((userId,token,expirationDate)=>{
      const tokenExpirationDate=expirationDate||new Date(new Date().getTime()+1000*60*60);
      setExpirationDate(tokenExpirationDate);
      localStorage.setItem(
        'userData',
        JSON.stringify({userId:userId,token:token,expiration:tokenExpirationDate.toISOString()})
      );
      setUserId(userId);
      setToken(token);
    },[])
  
    const logout=useCallback(()=>{
      setToken(false);
      setUserId(null);
      setExpirationDate(null);
      localStorage.removeItem('userData');
    },[])
  
    useEffect(()=>{
      const storedData=JSON.parse(localStorage.getItem('userData'));
      if(storedData && storedData.token && new Date(storedData.expiration)>new Date()){
        login(storedData.userId,storedData.token,new Date(storedData.expiration));
      }
    },[login])
  
    useEffect(()=>{
      if(token && tokenExpirationDate){
        const remainingTime=tokenExpirationDate.getTime()-new Date().getTime();
        logoutTimer=setTimeout(logout,remainingTime);
      }else{
        clearTimeout(logoutTimer);
      }
    },[token,logout]);
    
    return {token,login,logout,userId}
}