document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let authMode = 'login'; // 'login' | 'signup' | 'reset'
    let registrationStep = 'details'; // 'details' | 'verification' | 'complete'
    let fieldTouched = {};

    // If a session already exists, send the user straight to the home page
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        window.location.replace('home.html');
        return;
    }

    // --- DOM Elements ---
    const loginForm = document.getElementById('login-form');
    
    // Headers
    const greetingTitle = document.getElementById('greeting-title');
    const greetingSubtitle = document.getElementById('greeting-subtitle');
    
    // Tabs & Footers
    const authTabs = document.getElementById('auth-tabs');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const toggleModeFooter = document.getElementById('toggle-mode-footer');
    const toggleModeLink = document.getElementById('toggle-mode-link');
    
    // Step Containers
    const detailsStep = document.getElementById('details-step');
    const resetStep = document.getElementById('reset-step');
    const verificationStep = document.getElementById('verification-step');
    const completeStep = document.getElementById('complete-step');
    
    // Detail Inputs
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const phoneInput = document.getElementById('phone');
    const rememberMeInput = document.getElementById('remember-me');
    const agreeTermsInput = document.getElementById('agree-terms');
    
    // Detail Input Wrappers
    const nameWrapper = document.getElementById('name-wrapper');
    const emailWrapper = document.getElementById('email-wrapper');
    const passwordWrapper = document.getElementById('password-wrapper');
    const confirmPasswordWrapper = document.getElementById('confirm-password-wrapper');
    const phoneWrapper = document.getElementById('phone-wrapper');
    
    // Detail Input Errors
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const phoneError = document.getElementById('phone-error');
    const termsError = document.getElementById('terms-error');
    
    // Submit Buttons
    const submitBtn = document.getElementById('submit-btn');
    const submitBtnText = document.getElementById('submit-btn-text');
    const resetSubmitBtn = document.getElementById('reset-submit-btn');
    const verifySubmitBtn = document.getElementById('verify-submit-btn');
    const getStartedBtn = document.getElementById('get-started-btn');
    
    // Other Buttons
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const backToLoginBtn1 = document.getElementById('back-to-login-btn-1');
    const backToDetailsBtn = document.getElementById('back-to-details-btn');
    const passwordToggle = document.getElementById('password-toggle');
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
    
    // Alerts & Modals
    const successAlert = document.getElementById('general-success-alert');
    const successAlertText = document.getElementById('general-success-text');
    const errorAlert = document.getElementById('general-error-alert');
    const errorAlertText = document.getElementById('general-error-text');
    const successModal = document.getElementById('success-modal');
    const successMessage = document.getElementById('success-message');
    
    // Password Strength elements
    const strengthBarFill = document.getElementById('strength-bar-fill');
    const strengthText = document.getElementById('strength-text');
    const strengthFeedback = document.getElementById('strength-feedback');
    const strengthContainer = document.getElementById('password-strength');

    // Verification step elements
    const verificationCodeInput = document.getElementById('verification-code');
    const verificationWrapper = document.getElementById('verification-wrapper');
    const verificationError = document.getElementById('verification-error');
    const verificationTargetEmail = document.getElementById('verification-target-email');

    // Reset step elements
    const resetEmailInput = document.getElementById('reset-email');
    const resetEmailWrapper = document.getElementById('reset-email-wrapper');
    const resetEmailError = document.getElementById('reset-email-error');

    // --- Time-based Greetings ---
    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return {
                title: "Good Morning",
                subtitle: "Start your day with a perfect brew. Order ahead now."
            };
        } else if (hour >= 12 && hour < 17) {
            return {
                title: "Good Afternoon",
                subtitle: "Time for a mid-day coffee break? Let's get you fueled up."
            };
        } else {
            return {
                title: "Good Evening",
                subtitle: "Unwind with a warm, comforting roast. Grab your evening cup."
            };
        }
    };

    // --- Local Storage Initialization ---
    const initLocalStorage = () => {
        const savedEmail = localStorage.getItem('userEmail');
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        if (savedEmail) {
            emailInput.value = savedEmail;
            rememberMeInput.checked = rememberMe;
            validateField('email', savedEmail, false);
        }
    };

    // --- Password Strength Utility ---
    const calculatePasswordStrength = (password) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
        };

        const score = Object.values(requirements).filter(Boolean).length;
        const feedback = [];

        if (!requirements.length) feedback.push('At least 8 characters');
        if (!requirements.uppercase) feedback.push('One uppercase letter');
        if (!requirements.lowercase) feedback.push('One lowercase letter');
        if (!requirements.number) feedback.push('One number');
        if (!requirements.special) feedback.push('One special character');

        return { score, feedback, requirements };
    };

    const updatePasswordStrengthUI = (password) => {
        if (!password || authMode !== 'signup') {
            strengthContainer.classList.add('hidden');
            return;
        }

        strengthContainer.classList.remove('hidden');
        const strength = calculatePasswordStrength(password);
        
        // Width
        const percent = (strength.score / 5) * 100;
        strengthBarFill.style.width = `${percent}%`;
        
        // Label & Colors
        let color = '';
        let label = '';
        if (strength.score <= 1) {
            color = '#e26f6f'; // Red
            label = 'Very Weak';
        } else if (strength.score === 2) {
            color = '#ff9f43'; // Orange
            label = 'Weak';
        } else if (strength.score === 3) {
            color = '#feca57'; // Yellow
            label = 'Fair';
        } else if (strength.score === 4) {
            color = '#54a0ff'; // Blue
            label = 'Good';
        } else {
            color = '#c99d66'; // Gold
            label = 'Strong';
        }
        
        strengthBarFill.style.backgroundColor = color;
        strengthText.textContent = label;
        strengthText.style.color = color;
        
        // Feedback items
        strengthFeedback.innerHTML = '';
        if (strength.feedback.length > 0) {
            strength.feedback.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'strength-feedback-item';
                itemEl.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <span>${item}</span>
                `;
                strengthFeedback.appendChild(itemEl);
            });
        }
    };

    // --- Validation Rules ---
    const validateField = (field, value, showError = false) => {
        let error = '';
        
        switch (field) {
            case 'name':
                if (authMode === 'signup' && (!value || String(value).trim() === '')) {
                    error = 'Name is required';
                }
                break;
                
            case 'email':
                if (!value || String(value).trim() === '') {
                    error = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
                
            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else {
                    if (value.length < 8) {
                        error = 'Password must be at least 8 characters';
                    } else if (authMode === 'signup') {
                        const strength = calculatePasswordStrength(value);
                        if (strength.score < 3) {
                            error = 'Password is too weak';
                        }
                    }
                }
                break;
                
            case 'confirmPassword':
                if (authMode === 'signup') {
                    const originalPwd = passwordInput.value;
                    if (!value) {
                        error = 'Confirm password is required';
                    } else if (value !== originalPwd) {
                        error = 'Passwords do not match';
                    }
                }
                break;
                
            case 'phone':
                if (authMode === 'signup' && value) {
                    if (!/^\+?[\d\s\-()]+$/.test(value)) {
                        error = 'Please enter a valid phone number';
                    }
                }
                break;
                
            case 'verificationCode':
                if (authMode === 'signup' && registrationStep === 'verification') {
                    if (!value) {
                        error = 'Verification code is required';
                    } else if (!/^\d{6}$/.test(value)) {
                        error = 'Verification code must be 6 digits';
                    }
                }
                break;
                
            case 'agreeToTerms':
                if (authMode === 'signup' && !value) {
                    error = 'You must agree to the terms and conditions';
                }
                break;

            case 'resetEmail':
                if (authMode === 'reset') {
                    if (!value || String(value).trim() === '') {
                        error = 'Email is required';
                    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        error = 'Please enter a valid email address';
                    }
                }
                break;
        }
        
        // Element Maps
        const wrappers = {
            name: nameWrapper,
            email: emailWrapper,
            password: passwordWrapper,
            confirmPassword: confirmPasswordWrapper,
            phone: phoneWrapper,
            verificationCode: verificationWrapper,
            resetEmail: resetEmailWrapper
        };
        
        const errorsEls = {
            name: nameError,
            email: emailError,
            password: passwordError,
            confirmPassword: confirmPasswordError,
            phone: phoneError,
            agreeToTerms: termsError,
            verificationCode: verificationError,
            resetEmail: resetEmailError
        };
        
        const wrapper = wrappers[field];
        const errorEl = errorsEls[field];
        
        // Update styling classes
        if (wrapper) {
            if (error === '') {
                if (showError || fieldTouched[field]) {
                    if (field !== 'phone' || value) {
                        wrapper.classList.remove('invalid');
                        wrapper.classList.add('valid');
                    } else {
                        wrapper.classList.remove('valid', 'invalid');
                    }
                }
            } else {
                if (showError) {
                    wrapper.classList.remove('valid');
                    wrapper.classList.add('invalid');
                }
            }
        }
        
        // Toggle error display
        if (errorEl) {
            if (error && showError) {
                errorEl.textContent = error;
                errorEl.style.display = 'block';
            } else {
                errorEl.style.display = 'none';
            }
        }
        
        return error === '';
    };

    // --- Validation Trigger Functions ---
    const validateForm = () => {
        let isValid = true;
        
        if (authMode === 'reset') {
            isValid = validateField('resetEmail', resetEmailInput.value, true);
        } else if (authMode === 'signup' && registrationStep === 'verification') {
            isValid = validateField('verificationCode', verificationCodeInput.value, true);
        } else {
            const emailOk = validateField('email', emailInput.value, true);
            const passwordOk = validateField('password', passwordInput.value, true);
            let nameOk = true;
            let confirmOk = true;
            let phoneOk = true;
            let termsOk = true;
            
            if (authMode === 'signup') {
                nameOk = validateField('name', nameInput.value, true);
                confirmOk = validateField('confirmPassword', confirmPasswordInput.value, true);
                phoneOk = validateField('phone', phoneInput.value, true);
                termsOk = validateField('agreeToTerms', agreeTermsInput.checked, true);
            }
            
            isValid = emailOk && passwordOk && nameOk && confirmOk && phoneOk && termsOk;
        }
        
        return isValid;
    };

    // --- Alert Controls ---
    const showSuccessAlert = (msg) => {
        successAlertText.textContent = msg;
        successAlert.classList.remove('hidden');
        errorAlert.classList.add('hidden');
    };

    const showErrorAlert = (msg) => {
        errorAlertText.textContent = msg;
        errorAlert.classList.remove('hidden');
        successAlert.classList.add('hidden');
    };

    const clearAlerts = () => {
        successAlert.classList.add('hidden');
        errorAlert.classList.add('hidden');
    };

    // --- State Toggles (setModeAndStep) ---
    const setModeAndStep = (mode, step) => {
        authMode = mode;
        registrationStep = step;
        fieldTouched = {};
        clearAlerts();

        // Reset all validation UI classes
        const allWrappers = [nameWrapper, emailWrapper, passwordWrapper, confirmPasswordWrapper, phoneWrapper, verificationWrapper, resetEmailWrapper];
        const allErrors = [nameError, emailError, passwordError, confirmPasswordError, phoneError, termsError, verificationError, resetEmailError];
        
        allWrappers.forEach(w => w?.classList.remove('valid', 'invalid'));
        allErrors.forEach(e => { if (e) e.style.display = 'none'; });

        // Update Greetings and Display Sections based on states
        if (authMode === 'login') {
            const greeting = getTimeBasedGreeting();
            greetingTitle.textContent = greeting.title;
            greetingSubtitle.textContent = greeting.subtitle;
            
            tabLogin.classList.add('active');
            tabSignup.classList.remove('active');
            
            // Show/Hide Sections
            detailsStep.classList.remove('hidden');
            resetStep.classList.add('hidden');
            verificationStep.classList.add('hidden');
            completeStep.classList.add('hidden');
            authTabs.classList.remove('hidden');
            toggleModeFooter.classList.remove('hidden');
            
            // Detail Step Specific Sections
            document.getElementById('group-name').classList.add('hidden');
            document.getElementById('group-confirm-password').classList.add('hidden');
            document.getElementById('group-phone').classList.add('hidden');
            document.getElementById('group-terms').classList.add('hidden');
            document.getElementById('group-remember').classList.remove('hidden');
            document.getElementById('social-section').classList.remove('hidden');
            
            // Update Submit button & Footer text
            submitBtnText.textContent = "Sign In";
            toggleModeLink.previousSibling.textContent = "New to Velvet Roast? ";
            toggleModeLink.textContent = "Create an account";
            
        } else if (authMode === 'signup' && registrationStep === 'details') {
            greetingTitle.textContent = "Create Account";
            greetingSubtitle.textContent = "Join Velvet Roast and earn immediate rewards.";
            
            tabLogin.classList.remove('active');
            tabSignup.classList.add('active');
            
            detailsStep.classList.remove('hidden');
            resetStep.classList.add('hidden');
            verificationStep.classList.add('hidden');
            completeStep.classList.add('hidden');
            authTabs.classList.remove('hidden');
            toggleModeFooter.classList.remove('hidden');
            
            // Detail Step Specific Sections
            document.getElementById('group-name').classList.remove('hidden');
            document.getElementById('group-confirm-password').classList.remove('hidden');
            document.getElementById('group-phone').classList.remove('hidden');
            document.getElementById('group-terms').classList.remove('hidden');
            document.getElementById('group-remember').classList.add('hidden');
            document.getElementById('social-section').classList.add('hidden');
            
            // Evaluate strength on restore
            updatePasswordStrengthUI(passwordInput.value);
            
            // Update Submit button & Footer text
            submitBtnText.textContent = "Create Account";
            toggleModeLink.previousSibling.textContent = "Already have an account? ";
            toggleModeLink.textContent = "Sign in";
            
        } else if (authMode === 'signup' && registrationStep === 'verification') {
            greetingTitle.textContent = "Verify Your Email";
            greetingSubtitle.textContent = "Check your inbox for a 6-digit verification code.";
            
            detailsStep.classList.add('hidden');
            resetStep.classList.add('hidden');
            verificationStep.classList.remove('hidden');
            completeStep.classList.add('hidden');
            authTabs.classList.add('hidden');
            toggleModeFooter.classList.add('hidden');
            
            verificationTargetEmail.textContent = emailInput.value || "your email";
            verificationCodeInput.value = "";
            verifySubmitBtn.disabled = true;
            
        } else if (authMode === 'signup' && registrationStep === 'complete') {
            greetingTitle.textContent = "Welcome Aboard!";
            greetingSubtitle.textContent = "Your artisan coffee experience starts here.";
            
            detailsStep.classList.add('hidden');
            resetStep.classList.add('hidden');
            verificationStep.classList.add('hidden');
            completeStep.classList.remove('hidden');
            authTabs.classList.add('hidden');
            toggleModeFooter.classList.add('hidden');
            
        } else if (authMode === 'reset') {
            greetingTitle.textContent = "Reset Password";
            greetingSubtitle.textContent = "Recover your account access and get back to brewing.";
            
            detailsStep.classList.add('hidden');
            resetStep.classList.remove('hidden');
            verificationStep.classList.add('hidden');
            completeStep.classList.add('hidden');
            authTabs.classList.add('hidden');
            toggleModeFooter.classList.add('hidden');
            
            resetEmailInput.value = emailInput.value;
            validateField('resetEmail', resetEmailInput.value, false);
        }
    };

    // --- Loading Button Helper ---
    const startLoadingState = (btn, text = "Brewing...") => {
        btn.disabled = true;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
            <span class="flex items-center justify-center gap-2">
                <svg class="loader-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                ${text}
            </span>
        `;
        return () => {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
        };
    };

    // --- Real-time Input Listeners (with blur flags) ---
    const setupInputListeners = (input, field, hasPreValidation = false) => {
        input.addEventListener('input', (e) => {
            let val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            validateField(field, val, hasPreValidation || fieldTouched[field]);
        });
        
        input.addEventListener('blur', (e) => {
            fieldTouched[field] = true;
            let val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            validateField(field, val, true);
        });
    };

    setupInputListeners(nameInput, 'name');
    setupInputListeners(emailInput, 'email');
    setupInputListeners(confirmPasswordInput, 'confirmPassword');
    setupInputListeners(phoneInput, 'phone');
    
    // Password input listener supports strength updater
    passwordInput.addEventListener('input', (e) => {
        validateField('password', e.target.value, fieldTouched['password']);
        updatePasswordStrengthUI(e.target.value);
    });
    passwordInput.addEventListener('blur', (e) => {
        fieldTouched['password'] = true;
        validateField('password', e.target.value, true);
        updatePasswordStrengthUI(e.target.value);
    });

    agreeTermsInput.addEventListener('change', (e) => {
        fieldTouched['agreeToTerms'] = true;
        validateField('agreeToTerms', e.target.checked, true);
    });

    // Verification code mask & validation
    verificationCodeInput.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        e.target.value = val;
        
        const isValid = val.length === 6;
        verifySubmitBtn.disabled = !isValid;
        validateField('verificationCode', val, false);
    });
    verificationCodeInput.addEventListener('blur', (e) => {
        fieldTouched['verificationCode'] = true;
        validateField('verificationCode', e.target.value, true);
    });

    // Reset email listener
    setupInputListeners(resetEmailInput, 'resetEmail');

    // --- Toggles & Buttons Listeners ---
    
    // Tabs toggle
    tabLogin.addEventListener('click', () => setModeAndStep('login', 'details'));
    tabSignup.addEventListener('click', () => setModeAndStep('signup', 'details'));
    
    // Footer label toggle link
    toggleModeLink.addEventListener('click', () => {
        if (authMode === 'login') {
            setModeAndStep('signup', 'details');
        } else {
            setModeAndStep('login', 'details');
        }
    });

    // Forgot password flow
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        setModeAndStep('reset', 'details');
    });

    // Back Buttons
    backToLoginBtn1.addEventListener('click', () => setModeAndStep('login', 'details'));
    backToDetailsBtn.addEventListener('click', () => setModeAndStep('signup', 'details'));
    
    // Reset success modal triggered on complete
    getStartedBtn.addEventListener('click', () => {
        // Persist login session for the newly signed-up user
        const signupEmail = emailInput.value;
        const emailPrefix = signupEmail.split('@')[0];
        const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', signupEmail);
        sessionStorage.setItem('userName', displayName);

        // Redirect to the customer home page
        window.location.href = 'home.html';
    });

    // Password Eye Toggles
    const bindEyeToggle = (toggleBtn, inputEl) => {
        if (!toggleBtn || !inputEl) return;
        const eyeOn = toggleBtn.querySelector('.eye-on');
        const eyeOff = toggleBtn.querySelector('.eye-off');
        
        toggleBtn.addEventListener('click', () => {
            const isPassword = inputEl.type === 'password';
            inputEl.type = isPassword ? 'text' : 'password';
            if (isPassword) {
                eyeOn.classList.remove('hidden');
                eyeOff.classList.add('hidden');
            } else {
                eyeOn.classList.add('hidden');
                eyeOff.classList.remove('hidden');
            }
        });
    };
    bindEyeToggle(passwordToggle, passwordInput);
    bindEyeToggle(confirmPasswordToggle, confirmPasswordInput);

    // --- Form Submission Handler ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Touch all fields for current mode
        if (authMode === 'reset') {
            fieldTouched['resetEmail'] = true;
        } else if (authMode === 'signup' && registrationStep === 'verification') {
            fieldTouched['verificationCode'] = true;
        } else {
            fieldTouched['email'] = true;
            fieldTouched['password'] = true;
            if (authMode === 'signup') {
                fieldTouched['name'] = true;
                fieldTouched['confirmPassword'] = true;
                fieldTouched['phone'] = true;
                fieldTouched['agreeToTerms'] = true;
            }
        }

        const isFormValid = validateForm();
        
        if (!isFormValid) {
            // Apply card shaking effect to signal failure
            loginForm.classList.add('shake-form');
            setTimeout(() => {
                loginForm.classList.remove('shake-form');
            }, 500);
            
            // Focus first error field
            if (authMode === 'reset') {
                resetEmailInput.focus();
            } else if (authMode === 'signup' && registrationStep === 'verification') {
                verificationCodeInput.focus();
            } else {
                if (authMode === 'signup' && !validateField('name', nameInput.value, false)) {
                    nameInput.focus();
                } else if (!validateField('email', emailInput.value, false)) {
                    emailInput.focus();
                } else if (!validateField('password', passwordInput.value, false)) {
                    passwordInput.focus();
                } else if (authMode === 'signup' && !validateField('confirmPassword', confirmPasswordInput.value, false)) {
                    confirmPasswordInput.focus();
                } else if (authMode === 'signup' && !validateField('phone', phoneInput.value, false)) {
                    phoneInput.focus();
                }
            }
            return;
        }

        clearAlerts();

        // --- SUBMIT ACTION PER MODE ---
        if (authMode === 'login') {
            const stopLoading = startLoadingState(submitBtn, "Brewing...");
            
            try {
                // Simulate network latency (1.0s)
                await new Promise(res => setTimeout(res, 1000));
                
                // Save credentials to local storage if checked
                if (rememberMeInput.checked) {
                    localStorage.setItem('userEmail', emailInput.value);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('rememberMe');
                }

                // Persist login session so protected pages can pick it up
                const emailPrefix = emailInput.value.split('@')[0];
                const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userEmail', emailInput.value);
                sessionStorage.setItem('userName', displayName);

                // Show authentication successful modal
                successModal.classList.remove('hidden');
                successMessage.textContent = `Welcome back, ${displayName}! Brewing your customized menu...`;

                // Simulating loading bar completion (2.2s), then redirect to home
                setTimeout(() => {
                    successMessage.textContent = "Dashboard ready! Enjoy your Velvet Roast experience.";
                    setTimeout(() => {
                        // Honor a pre-login return destination if the user was bounced
                        // from a protected page; otherwise default to home.html
                        const returnTo = sessionStorage.getItem('returnTo');
                        if (returnTo && returnTo !== 'index.html') {
                            sessionStorage.removeItem('returnTo');
                            window.location.href = returnTo;
                        } else {
                            window.location.href = 'home.html';
                        }
                    }, 800);
                }, 2200);
                
            } catch (err) {
                showErrorAlert("Authentication failed. Please check your credentials.");
            } finally {
                stopLoading();
            }
            
        } else if (authMode === 'signup' && registrationStep === 'details') {
            const stopLoading = startLoadingState(submitBtn, "Creating Account...");
            
            try {
                await new Promise(res => setTimeout(res, 1000));
                // Move to verification step
                setModeAndStep('signup', 'verification');
                showSuccessAlert("Account created! Please verify your email.");
            } catch (err) {
                showErrorAlert("Account creation failed. Email might already be registered.");
            } finally {
                stopLoading();
            }
            
        } else if (authMode === 'signup' && registrationStep === 'verification') {
            const stopLoading = startLoadingState(verifySubmitBtn, "Verifying...");
            
            try {
                await new Promise(res => setTimeout(res, 1000));
                // Move to complete step
                setModeAndStep('signup', 'complete');
                showSuccessAlert("Email verified successfully!");
            } catch (err) {
                showErrorAlert("Incorrect verification code. Please check again.");
            } finally {
                stopLoading();
            }
            
        } else if (authMode === 'reset') {
            const stopLoading = startLoadingState(resetSubmitBtn, "Sending...");
            
            try {
                await new Promise(res => setTimeout(res, 1000));
                showSuccessAlert("Password reset email sent! Redirecting back to Login...");
                
                // Automatically redirect to login after 2 seconds
                setTimeout(() => {
                    setModeAndStep('login', 'details');
                }, 2000);
            } catch (err) {
                showErrorAlert("Reset failed. Please check email and try again.");
            } finally {
                stopLoading();
            }
        }
    });

    // --- Dynamic Click Particle Effect (Coffee Aroma Bubbles) ---
    document.addEventListener('click', (e) => {
        // Spawn 2 light golden floating bubble elements near user clicks
        for (let i = 0; i < 2; i++) {
            createAromaBubble(e.clientX, e.clientY);
        }
    });

    const createAromaBubble = (x, y) => {
        const bubble = document.createElement('div');
        bubble.className = 'click-particle';
        document.body.appendChild(bubble);
        
        const size = Math.random() * 8 + 4; // 4px to 12px
        const offsetX = (Math.random() - 0.5) * 15;
        const offsetY = (Math.random() - 0.5) * 15;
        
        bubble.style.left = `${x + offsetX}px`;
        bubble.style.top = `${y + offsetY}px`;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        const driftX = (Math.random() - 0.5) * 60;
        bubble.style.setProperty('--drift-x', `${driftX}px`);
        
        const duration = Math.random() * 0.4 + 0.6; // 0.6s to 1s
        bubble.style.animationDuration = `${duration}s`;
        
        setTimeout(() => {
            bubble.remove();
        }, duration * 1000);
    };

    // Initialize application settings
    setModeAndStep('login', 'details');
    initLocalStorage();
});
