import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './theme.css';
import logo from './logo.svg';
import './App.css';
import withFirebaseAuth, { WrappedComponentProps } from 'react-with-firebase-auth'
import * as firebase from "firebase/app";
import 'firebase/auth';
import 'firebase/database';
import {Cache} from './services/common';
import { MainPage } from './components/main-page';
import config from './config.json';

const firebaseApp=firebase.initializeApp(config);

const firebaseAppAuth = firebaseApp.auth();

const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};
const App = ({
  user,
  signOut,
  signInWithGoogle,
}: WrappedComponentProps) =>{
  let [_, setCurrentUser]=useState();
  let [loading, setLoading]=useState(true);
  useEffect(() => {
    firebaseAppAuth.onAuthStateChanged(user => {
      setLoading(false);
      if (user) {
        console.log('uid',user.uid);
        Cache.addUser(user.uid,user.displayName,user.photoURL).then((data)=>{
          //console.log('val',data);
        }).catch((e)=>{
          console.log("Error",e);
        })
        setCurrentUser(user);
        Cache.user=user.uid;
      } else {
        setCurrentUser(null);
        Cache.user='';
      }
    });
  },[]);
  return (
    <React.Fragment>
      <div className="App container">
        {
          loading?<div className="loading">Loading..</div>
          :<>
            {
              user 
                ? <MainPage user={user} signOut={signOut} ></MainPage>
                : <div className="OuterPage">
                  <header className="App-header">
                    <h2 className="title">Super Tic Tac Toe</h2>
                    <img src={logo} className="App-logo" alt="logo" />
                    <p>Multiplayer</p>
                    <button className="btn btn-outline-light" onClick={signInWithGoogle}>Sign in with Google</button>
                  </header>
                </div>
            }
          </>
        }
        
      </div>
    </React.Fragment>
  )
};

export default withFirebaseAuth({
  providers,
  firebaseAppAuth,
})(App);
