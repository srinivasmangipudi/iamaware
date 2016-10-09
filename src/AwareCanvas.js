import React from 'react';
import './AwareCanvas.css';
//import $ from 'jquery';
var firebase = require('firebase/app');
require("firebase/auth");
require("firebase/database");
require("firebase/storage");
var ReactFireMixin = require('reactfire');

var canvas = document.getElementById('awareCanvas');
var userIdSession = null;
var userObj = null;
var firebaseDbRef;
var awareUserListRef;
var totalTouchesRef;
var mostAwareRecordRef;

var AwareCanvas = React.createClass({
  mixins: [ReactFireMixin],
  showSettings: function(event) {
    event.preventDefault();
  },
  getInitialState: function() {
    return {
            userId: userIdSession,
            isSelected: "false",
            awareUsersNow: 0,
            totalTouches: 0,
            mostAwareRecord: 0,
            isLoggedIn: "false"
        };
  },
  componentWillMount: function() {
    //console.log("componentWillMount");
  },
  componentDidMount: function() {
    //console.log("componentDidMount");
    // Initialize Firebase
    // The security rules are in place, only with anonymous auth object will access be granted to be added to the aware list.
    var config = {
      apiKey: "AIzaSyC9hyquwKLSLks3UYBkVxkf6mya2eNAV5w",
      authDomain: "project-2569167554904200855.firebaseapp.com",
      databaseURL: "https://project-2569167554904200855.firebaseio.com",
      storageBucket: "project-2569167554904200855.appspot.com",
    };

    firebase.initializeApp(config);
    firebaseDbRef = firebase.database().ref();

    awareUserListRef = firebaseDbRef.child("awareUsersList");
    this.bindAsArray(awareUserListRef, "awareUsersList");

    totalTouchesRef = firebaseDbRef.child("totalTouches");
    this.bindAsObject(totalTouchesRef, "totalTouches");

    mostAwareRecordRef = firebaseDbRef.child("mostAwareRecord");
    this.bindAsObject(mostAwareRecordRef, "mostAwareRecord");

    this.getAwareCount();
    this.updateCanvas();
  },
  logIn: function() {
    console.log("--log in");
    console.log(firebase.auth().currentUser);
    if(firebase.auth().currentUser)
      console.log(firebase.auth().currentUser.uid);

    //only if the current annon auth is logged out
    if(firebase.auth().currentUser === undefined)
    {
      console.log("---- no existing session. start anonymous login");
      //start loggin in firebase anon
      firebase.auth().signInAnonymously().catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("--auth error");
        console.log(errorCode + " : " + errorMessage);
      });

      var self=this;
      firebase.auth().onAuthStateChanged(function(user) {
        console.log("** auth state changed");
        console.log(user.uid);
        self.loggedIn(user);
      });         
    }
    else
    {
      console.log("---- existing session found. use that");
      this.loggedIn(firebase.auth().currentUser);
    }
     
  },
  loggedIn: function(user) {
    if (user) {
          // User is signed in.
          //console.log("-- logged in");
          userObj = user;
          let uid = user.uid;
          let date = Date.now().toString();

          // if the anon login userid has changed, delete the old one from list.
          // if(this.state.userId !== uid)
          // {
          //   this.firebaseRefs.awareUsersList.child(this.state.userId).remove();
          // }
          // A data entry - can add other params here like location etc.
          let postData = {
            id: uid,
            tag: "localhost",
            // path: window.location.pathname,
             arrivedAt: date,
            // userAgent: navigator.userAgent
          };

          let updates = {};
          updates['/awareUsersList/' + uid] = postData;

          //save the user to the db
          firebase.database().ref().update(updates); 

          //attach the remove self on disconnect clause
          try
          {
            this.firebaseRefs.awareUsersList.child(this.state.userId).onDisconnect().remove();
          }
          catch(e)
          {
            console.log("userid does not exist")
            console.log(e);
          }
          

          //update state of this component
          this.setState({userId: user.uid, isLoggedIn: true});

          //update the total touches 
          this.firebaseRefs.totalTouches.transaction(function (currentData) {
            return currentData + 1;
          });
        } else {
          // User is signed out.
          userObj = null;
          this.setState({isSelected: "false", isLoggedIn: false, userId: null}, () => {
            this.updateCanvas();
          }); 
        }
        // ...
  },
  getAwareCount: function() {
    awareUserListRef.on('value', snap => {
      var size=0;
      if(snap.val()) 
        {size = Object.keys(snap.val()).length;} 
      else {size=0};
      
      // console.log(size); subtract the dummy element
      this.setState({awareUsersNow: size-1});
      this.updateCanvas();

      //if this beats the record -- wow time to celebrate!!
      if((size-1) > this.state.mostAwareRecord[".value"])
      {
        //update the record 
        this.firebaseRefs.mostAwareRecord.transaction(function (currentData) {
          return size-1;
          //return currentData + 1;
        });
      }
    });
  },
  componentWillUnmount: function() {
    //console.log("componentWillUnmount called");
  },
  handleTouch: function(e) {
    e.preventDefault();
    this.setState({isSelected: "true"}, () => {
        this.updateCanvas();
      });

    this.logIn();

      // //on click log anonymously and update states
      // if(this.userObj === undefined)
      // {
      //   this.logIn();
      // }
      // else
      // {
      //   this.loggedIn(this.userObj);
      // }
  },
  handleUntouch: function(e) {
    e.preventDefault();
    this.firebaseRefs.awareUsersList.child(this.state.userId).remove();

    this.setState({isSelected: "false"}, () => {
      this.updateCanvas();
    });     
  },
  updateCanvas: function() {
    const ctx = this.refs.canvas.getContext('2d');
    ctx.textBaseline = 'middle';
    ctx.textAlign="middle";
    let isSelected = this.state.isSelected;
    var fillStyle = '#000000';
    var txtxt;
    var textWidth;

    if(isSelected === "true")
    {
      fillStyle = "#ff0000";
    }
 
    ctx.fillStyle = fillStyle;
    ctx.fillRect(0,0, 300, 300);

    if(isSelected === "true")
    {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px Arial";
      var count = this.state.awareUsersNow;
      txtxt =  (count-1) + " people are touching";

      if(count === 1 || count === 0)
      {
        txtxt = "You are the only one.";
      }else if(count === 2){
        txtxt = "Some else is touching.";
      }
      
      textWidth = ctx.measureText(txtxt ).width;
      ctx.fillText(txtxt , (this.refs.canvas.width/2) - (textWidth / 2), 100);      
    }
    else{
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px Arial";
      txtxt = "Touch to be Aware";
      textWidth = ctx.measureText(txtxt).width;
      ctx.fillText(txtxt , (this.refs.canvas.width/2) - (textWidth / 2), 100);
    }
  },
  render: function() {
    var isSelected = this.state.isSelected;
    var style = {
            'backgroundColor': '#eee'
        };
        if (isSelected) {
            style = {
                'backgroundColor': '#ccc'
            };
        }
      return (
        <div className="awareCanvas">
          <canvas id="awareCanvas" ref="canvas" onMouseDown={this.handleTouch} onMouseUp={this.handleUntouch}
            onTouchStart={this.handleTouch} onTouchEnd={this.handleUntouch}
            style={style} width={300} height={300}/>
          <div className="instructions">
            This has been touched {this.state.totalTouches[".value"]} times till now.
            <br/>
            Most number of people touching together were {this.state.mostAwareRecord[".value"]}.
          </div>          
        </div>
      );
  }
});
//end -- aware canvas react component

export default AwareCanvas;


