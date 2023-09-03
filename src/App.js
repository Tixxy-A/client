import React, { useState, useCallback,useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';

import Users from './user/pages/Users';
import NewPlace from './places/pages/NewPlace';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import Auth from './user/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';

let logoutTimer;
const App = () => {
  const [token, settoken] = useState(false);
  const [userId, setUserId] = useState(false);
  const [tokenexpiration,settokenexpiration]=useState();

  const login = useCallback((uid,token,expireDate) => {
    settoken(token);
    setUserId(uid);
    const expire=expireDate || new Date(new Date().getTime()+1000*60*60);
    settokenexpiration(expire);
    localStorage.setItem('userData',JSON.stringify({userId: uid , token: token, expiration: expire.toISOString()}));
  }, []);

  const logout = useCallback(() => {
    settoken(null);
    setUserId(null);
    settokenexpiration(null);
    localStorage.removeItem('userData');
  }, []);

  useEffect(()=>{
    if(token && tokenexpiration){
      const remain=tokenexpiration.getTime()-new Date().getTime();
      logoutTimer=setTimeout(logout,remain);
    }else{
      clearTimeout(logoutTimer);
    }
  },[token,logout,tokenexpiration]);

  useEffect(()=>{
    const storeData=JSON.parse(localStorage.getItem('userData'));
    if(storeData && storeData.token && new Date(storeData.expiration)>new Date()){
      login( storeData.userId, storeData.token, new Date(storeData.expiration));
    }
  },[login]);

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId">
          <UpdatePlace />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout
      }}
    >
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
