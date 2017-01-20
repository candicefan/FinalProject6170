<h1><i>babble</i></h1>
- a live, interactive platform where MIT students are encouraged to have candid conversations and can provide instant support to each other

<p>6.170 Final Project<br>
by:<br>
Stacy Ho - stacyho<br>
Xueqi (Candice) Fan - xueqifan<br>
YunFei (Rachel) Lin - rachel18<br>
Zhaozheng (Alice) Jin - alicejin</p>

<p>The app is publicly available at:<br>
<a href='https://maga-finalproject.herokuapp.com'>https://maga-finalproject.herokuapp.com</a></p>

<h3>Using <i>babble</i></h3>
<h5>Registration</h5>
<p>MIT students can register using their kerberos. A verification link that is valid for 24 hours will be sent to their kerberos email. Registration process can be completed by cliking on the link before expiration date, after which the student must register again.</p>
<h5>Login</h5>
<p>After verifying their kerberos email, a user can login using kerberos and password. </p>
<h5>Posting a <i>babble</i></h5>
<p>A user can post a <i>babble</i>, anonymously or not. Once posted, the anonymity option cannot be changed. </p>
<h5>Posting a Comment</h5>
<p>A user can post a comment in response to a <i>babble</i>, anonymousely or not. Once posted, the anonymity option cannot be changed. </p>
<h5>Anonymous Name</h5>
<p>A user who chooses to post anonymously will be associated with a randomly generated Anonymous Name. If the user chooses to post anonymously again in the same <i>babble</i> thread, the user will be associated with the same Anonymous Name previously used. </p>
<h5>Vibes</h5>
<p>Users can determine if a <i>babble</i> or comment contributes to the purpose of the app or not, assigning good or bad vibes, respectively. A <i>babble</i> or comment with bad vibe : good vibe ratio > 0.8 will be redacted. The vibes on a user's posted content contribute to the user's overall reputation. </p>
<h5>Reputation</h5>
<p>Each user has a reputation, determined by the amount of good and bad vibes contributed to the user's posted content. Reputation is used to determine a user's daily <i>babble</i> posting limit. The reputation board is updated on weekly basis to celebrate ten users with highest reputation. </p>
<h5>Posting Limit</h5>
<p>A new user is given daily <i>babble</i> posting limit of 5. Higher reputation increases the posting limit while lower reputation decreases the posting limit.</p>
<h5>Live Update</h5>
<p>Newly posted <i>babbles</i> and comments are instantly available to been seen by all other users.</p>

<h3>Running <i>babble</i> Locally</h3>
<p>Navigate to the root directory of the app <br>
Install all the dependencies by running <code>npm install</code><br>
Start the app running <code>node ./bin/www</code><br>
Navigate to <a href='http://localhost:3000'>http://localhost:3000</a> to the login page</p>

<h3>Testing</h3>
<h5>Unit Testing</h5>
<p>The correctioness of all API except email verification is checked for in unit tests.<br>
Run the unit tests in <code>/test</code> by running <code>mocha &lt;fileName&gt;</code></p>
<h5>User Testing</h5>
<p>Email verification requires human input and, therefore, is not checked for in unit tests.<br>
Testing Strategy:<br> 
- register with a kerberos not already in use, register with a kerberos to which a verification email has been sent, register with a kerberos already in use<br>
- click on the verification link before and after expiration period (24 hours)</p>

<h3>Authorship</h3>
<p>While every team member contributed to every aspect of the project, below is the lead for each section. Authorship is also indicated in every file.</p>
<p>
<b>Client Side</b>: stacyho<br>
<b>Registration, Login</b>: alicejin<br>
<b>Posting <i>babble</i>, Comment</b>: xueqifan<br>
<b>Anonymous Name</b>: alicejin<br>
<b>Vibes</b>: rachel18<br>
<b>Reputation and leaderboard</b>: rachel18<br>
<b>Posting Limit</b>: xueqifan<br>
<b>Live Update</b>: alicejin<br>
<b>Email verification</b>: alicejin<br>
<b>Testing</b>: rachel18<br>
<b>User Interface</b>: stacyho<br>
</p>
