document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    const signupLink = document.querySelector('#signupLink');
    const loginLink = document.querySelector('#loginLink');
    const loginTab = document.querySelector('#loginTab');
    const signupTab = document.querySelector('#signupTab');
    const body = document.getElementById('deviceType');
    const requestOtpBtn = document.getElementById('requestOtpBtn');
    const otpSection = document.getElementById('otpSection');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const signUpFormWrapper = document.querySelector('.form-wrapper.sign-up');
    const signInFormWrapper = document.querySelector('.form-wrapper.sign-in');

    function detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /iphone|ipad|ipod|android/.test(userAgent);

        if (isMobile) {
            body.classList.add('mobile');
        } else {
            body.classList.add('desktop');
        }
    }

    detectDevice();

    function showLogin() {
        container.classList.remove('slide-left');
        container.classList.add('slide-right');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        signUpFormWrapper.style.display = 'none';
        signInFormWrapper.style.display = 'block';
    }

    function showSignup() {
        container.classList.remove('slide-right');
        container.classList.add('slide-left');
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signUpFormWrapper.style.display = 'block';
        signInFormWrapper.style.display = 'none';
    }

    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSignup();
    });

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });

    loginTab.addEventListener('click', showLogin);
    signupTab.addEventListener('click', showSignup);

    requestOtpBtn.addEventListener('click', function() {
        const emailInput = document.getElementById('signupEmail');
        const email = emailInput.value;
        if (email) {
            fetch('https://txt2excelbackend.onrender.com/signup/request-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.error || 'Failed to request OTP');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('OTP request successful:', data.message);
                otpSection.style.display = 'block';
                requestOtpBtn.style.display = 'none';
                alert(data.message); // Inform the user that the OTP has been sent
            })
            .catch(error => {
                console.error('Error sending OTP request:', error);
                alert(error.message || 'An error occurred while requesting OTP.');
            });
        } else {
            alert('Please enter your email address.');
        }
    });

    verifyOtpBtn.addEventListener('click', function() {
        const email = document.getElementById('signupEmail').value;
        const otp = document.getElementById('signupOtp').value;
        const password = document.getElementById('signupPassword').value;
    
        if (email && otp && password) {
            let statusCode = null;
    
            fetch('https://txt2excelbackend.onrender.com/signup/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password })
            })
            .then(response => {
                statusCode = response.status;
                return response.json();
            })
            .then(data => {
                if (statusCode === 201) {
                    console.log('Account created successfully:', data.message);
                    alert(data.message);
                    signupForm.reset();
                    otpSection.style.display = 'none';
                    requestOtpBtn.style.display = 'block';
                    showLogin(); // Redirect to login
                } else {
                    console.error('Account creation failed:', data.error);
                    alert(data.error);
                }
            })
            .catch(error => {
                console.error('Error verifying OTP and creating account:', error);
                alert(error.message || 'An error occurred during account creation.');
            });
        } else {
            alert('Please enter your email, OTP, and password.');
        }
    });

    
    

    loginBtn.addEventListener('click', function () {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
    
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                alert('Login successful!');
                console.log('Logged in user:', user.email);
    
                // Store the email in local storage
                localStorage.setItem('userEmail', user.email);
    
                user.getIdToken().then(token => {
                    localStorage.setItem('authToken', token);
                });
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                alert('Login failed: ' + error.message);
            });
    });
});
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

forgotPasswordLink.addEventListener('click', function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;

    if (!email) {
        alert("Please enter your email address in the email field above first.");
        return;
    }

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert('Password reset email sent! Check your inbox or spam folder.');
        })
        .catch((error) => {
            console.error("Error sending password reset email:", error);
            alert(error.message || "An error occurred while sending the reset email.");
        });
});
