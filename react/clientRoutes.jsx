import App from './App.jsx';
import LogIn from './Pages/LogIn.jsx';
import SignUp from './Pages/SignUp.jsx'
import Home from './Pages/Home.jsx';
import Verify from './Pages/Verify.jsx';
import NotFound from './Pages/NotFound.jsx';
import services from '../services';
import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

/* 
 * Client routes
 * Author(s): stacyho
 */

// Stubbed out authCheck will automatically redirect to the login route
// if there's no current user.  Example implementation online :
// https://github.com/ReactTraining/react-router/blob/master/examples/auth-flow/auth.js
const authCheck = (nextState, replace, callback) => {
   services.user.getCurrentUser().then((response) => {
       if (!response.content.loggedIn){
           replace('/login');
       }
       callback();
   });
};

export default (
    <Router history={browserHistory} >
        <Route path='/' component={App}  >
            <IndexRoute component={Home} onEnter={authCheck} />
            <Route path="login"
                   component={LogIn} />
            <Route path="signup"
                   component={SignUp} />
            <Route path="user/verify/:token"
                   component={Verify} />
            <Route path="home"
                   component={Home} onEnter={authCheck}/>
            <Route path="*"
                   component={NotFound} />
        </Route>
    </Router>
);