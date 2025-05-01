function getFriendlyFirebaseError(error) {
    if (!error || !error.code) return 'An unknown error occurred.';

    switch (error.code) {
        case 'auth/invalid-email':
            return 'Invalid email address format.';
        case 'auth/user-disabled':
            return 'This user account has been disabled.';
        case 'auth/user-not-found':
            return 'No user found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please log in instead.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/missing-email':
            return 'Email address is required.';
        case 'auth/internal-error':
            return 'An internal error occurred. Please try again later.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        default:
            return error.message || 'An unexpected error occurred.';
    }
}

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
                alert(getFriendlyFirebaseError(error));
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
                alert(getFriendlyFirebaseError(error));
            });
        } else {
            alert('Please enter your email, OTP, and password.');
        }
    });

    document.getElementById('loginBtn').addEventListener('click', function () {
        console.log('Login button clicked!'); // Debugging line
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                return user.getIdToken();
            })
            .then((token) => {
                return fetch('https://txt2excelbackend.onrender.com/sessionLogin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ idToken: token })
                });
            })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then(data => {
                        const errorMessage = data.error || 'Session login failed';
                        throw new Error(errorMessage);
                    });
                }
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                console.error("Login error:", error);
                alert(error.message); // Display the actual error message
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
                alert(getFriendlyFirebaseError(error));
            });
    });
});
