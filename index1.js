 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries
  import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBprG5IV8w9cOK6VOSL7Pt-z8cNRMeBwjs",
    authDomain: "login-43bcc.firebaseapp.com",
    projectId: "login-43bcc",
    storageBucket: "login-43bcc.firebasestorage.app",
    messagingSenderId: "494864901620",
    appId: "1:494864901620:web:261be4294abad898be85a1"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);



 //input
 const emailInput = document.getElementById("email").value;
 const passwordInput = document.getElementById("password").value;

 //sumit button
 const submitButton = document.getElementById("submit");
 submit.assignEventListener("click",function(event){
    event.preventDefault()
    createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    alert("Congratulations! You have successfully signed up.");
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(ErrorMessage)
    // ..
  });
 })