"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiClientError } from "@/lib/api/client";
import { verifyEmail } from "@/lib/api/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import LoginTabHashHandler from './LoginTabHashHandler';

type LoginTab = "signin" | "register";

type LoginMainProps = {
  initialTab?: LoginTab;
};

export default function LoginMain({ initialTab = "signin" }: LoginMainProps) {
  const isSignIn = initialTab === "signin";
  const router = useRouter();
  const { login, register, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"Customer" | "Seller">("Customer");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationOtp, setVerificationOtp] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLoginSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    try {
      await login({ email, password });
      router.push("/");
    } catch (error) {
      setLoginError(
        error instanceof ApiClientError
          ? error.message
          : "Unable to log in. Please check your credentials and try again.",
      );
    }
  };

  const handleRegisterSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError(null);

    try {
      const registrationResponse = await register({
        email: registerEmail,
        password: registerPassword,
        firstName,
        lastName,
        phone: phone || undefined,
        role,
      });

      if (!registrationResponse.requiresEmailVerification) {
        router.replace("/login");
        return;
      }

      setVerificationEmail(registerEmail);
      setVerificationOtp("");
      setVerificationError(null);
      setShowVerificationModal(true);
    } catch (error) {
      setRegisterError(
        error instanceof ApiClientError
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    }
  };

  const handleVerifyEmail = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVerificationError(null);

    const normalizedOtp = verificationOtp.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      setVerificationError("Please enter the 6-digit verification code.");
      return;
    }

    setIsVerifying(true);

    try {
      await verifyEmail({ email: verificationEmail, otp: normalizedOtp });
      setShowVerificationModal(false);
      window.location.assign("/login");
    } catch (error) {
      setVerificationError(
        error instanceof ApiClientError && error.status === 400
          ? "The verification code is incorrect or expired."
          : error instanceof ApiClientError
            ? error.message
            : "Unable to verify your email. Please try again.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEnterLater = () => {
    setShowVerificationModal(false);
    window.location.assign("/login");
  };

  return (
    <main className="main">
      <nav aria-label="breadcrumb" className="breadcrumb-nav border-0 mb-0">
                      <div className="container">
                          <ol className="breadcrumb">
                              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                              <li className="breadcrumb-item"><a href="#">Pages</a></li>
                              <li className="breadcrumb-item active" aria-current="page">
                                {isSignIn ? "Login" : "Register"}
                              </li>
                          </ol>
                      </div>
                  </nav>
      
                  <div className="login-page bg-image pt-8 pb-8 pt-md-12 pb-md-12 pt-lg-17 pb-lg-17" style={{ backgroundImage: 'url(\'/assets/images/backgrounds/login-bg.jpg\')' }}>
                  	<div className="container">
                  		<div className="form-box">
                  			<div className="form-tab">
      	            			<ul className="nav nav-pills nav-fill" role="tablist">
      							    <li className="nav-item">
      							        <a className={`nav-link${isSignIn ? " active" : ""}`} id="signin-tab-2" data-toggle="tab" href="/login" role="tab" aria-controls="signin-2" aria-selected={isSignIn}>Sign In</a>
      							    </li>
      							    <li className="nav-item">
      							        <a className={`nav-link${isSignIn ? "" : " active"}`} id="register-tab-2" data-toggle="tab" href="/register" role="tab" aria-controls="register-2" aria-selected={!isSignIn}>Register</a>
      							    </li>
      							</ul>
      							<div className="tab-content">
      							    <div className={`tab-pane fade${isSignIn ? " show active" : ""}`} id="signin-2" role="tabpanel" aria-labelledby="signin-tab-2">
      							    	<form onSubmit={handleLoginSubmit}>
      							    		<div className="form-group">
      							    			<label htmlFor="singin-email-2">Email address *</label>
      							    			<input type="email" className="form-control" id="singin-email-2" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      							    		</div>
      
      							    		<div className="form-group">
      							    			<label htmlFor="singin-password-2">Password *</label>
      							    			<input type="password" className="form-control" id="singin-password-2" name="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      							    		</div>

      							    		{loginError && (
      							    			<div className="alert alert-danger" role="alert" aria-live="polite">
      							    				{loginError}
      							    			</div>
      							    		)}
      
      							    		<div className="form-footer">
      							    			<button type="submit" className="btn btn-outline-primary-2" disabled={isLoading}>
      			                					<span>{isLoading ? "LOGGING IN..." : "LOG IN"}</span>
      			            						<i className="icon-long-arrow-right"></i>
      			                				</button>
      
      			                				<div className="custom-control custom-checkbox">
      												<input type="checkbox" className="custom-control-input" id="signin-remember-2" />
      												<label className="custom-control-label" htmlFor="signin-remember-2">Remember Me</label>
      											</div>
      
      											<a href="#" className="forgot-link">Forgot Your Password?</a>
      							    		</div>
      							    	</form>
      							    	<div className="form-choice">
      								    	<p className="text-center">or sign in with</p>
      								    	<div className="row">
      								    		<div className="col-sm-6">
      								    			<a href="#" className="btn btn-login btn-g">
      								    				<i className="icon-google"></i>
      								    				Login With Google
      								    			</a>
      								    		</div>
      								    		<div className="col-sm-6">
      								    			<a href="#" className="btn btn-login btn-f">
      								    				<i className="icon-facebook-f"></i>
      								    				Login With Facebook
      								    			</a>
      								    		</div>
      								    	</div>
      							    	</div>
      							    </div>
      							    <div className={`tab-pane fade${isSignIn ? "" : " show active"}`} id="register-2" role="tabpanel" aria-labelledby="register-tab-2">
      							    	<form onSubmit={handleRegisterSubmit}>
      							    		<div className="row">
      							    			<div className="col-sm-6">
      							    				<div className="form-group">
      							    					<label htmlFor="register-first-name-2">First name *</label>
      							    					<input type="text" className="form-control" id="register-first-name-2" name="firstName" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
      							    				</div>
      							    			</div>
      							    			<div className="col-sm-6">
      							    				<div className="form-group">
      							    					<label htmlFor="register-last-name-2">Last name *</label>
      							    					<input type="text" className="form-control" id="register-last-name-2" name="lastName" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
      							    				</div>
      							    			</div>
      							    		</div>
      							    		<div className="form-group">
      							    			<label htmlFor="register-email-2">Your email address *</label>
      							    			<input type="email" className="form-control" id="register-email-2" name="email" autoComplete="email" value={registerEmail} onChange={(event) => setRegisterEmail(event.target.value)} required />
      							    		</div>
      
      							    		<div className="form-group">
      							    			<label htmlFor="register-password-2">Password *</label>
      							    			<input type="password" className="form-control" id="register-password-2" name="password" autoComplete="new-password" value={registerPassword} onChange={(event) => setRegisterPassword(event.target.value)} required />
      							    		</div>

      							    		<div className="form-group">
      							    			<label htmlFor="register-phone-2">Phone number</label>
      							    			<input type="tel" className="form-control" id="register-phone-2" name="phone" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
      							    		</div>

      							    		<div className="form-group">
      							    			<label htmlFor="register-role-2">Account type *</label>
      							    			<select className="form-control" id="register-role-2" name="role" value={role} onChange={(event) => setRole(event.target.value as "Customer" | "Seller")} required>
      							    				<option value="Customer">Customer</option>
      							    				<option value="Seller">Seller</option>
      							    			</select>
      							    		</div>
      
      							    		{registerError && (
      							    			<div className="alert alert-danger" role="alert" aria-live="polite">
      							    				{registerError}
      							    			</div>
      							    		)}

      							    		<div className="form-footer">
      							    			<button type="submit" className="btn btn-outline-primary-2" disabled={isLoading}>
      			                					<span>{isLoading ? "SIGNING UP..." : "SIGN UP"}</span>
      			            						<i className="icon-long-arrow-right"></i>
      			                				</button>
      
      			                				<div className="custom-control custom-checkbox">
      												<input type="checkbox" className="custom-control-input" id="register-policy-2" required />
      												<label className="custom-control-label" htmlFor="register-policy-2">I agree to the <a href="#">privacy policy</a> *</label>
      											</div>
      							    		</div>
      							    	</form>
      							    	<div className="form-choice">
      								    	<p className="text-center">or sign in with</p>
      								    	<div className="row">
      								    		<div className="col-sm-6">
      								    			<a href="#" className="btn btn-login btn-g">
      								    				<i className="icon-google"></i>
      								    				Login With Google
      								    			</a>
      								    		</div>
      								    		<div className="col-sm-6">
      								    			<a href="#" className="btn btn-login  btn-f">
      								    				<i className="icon-facebook-f"></i>
      								    				Login With Facebook
      								    			</a>
      								    		</div>
      								    	</div>
      							    	</div>
      							    </div>
      							</div>
      						</div>
                  		</div>
                  	</div>
      </div>
      <LoginTabHashHandler initialTab={initialTab} />

      {showVerificationModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show"
            role="dialog"
            aria-modal="true"
            aria-labelledby="verify-email-title"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="form-box">
                    <div className="form-tab">
                      <h2 id="verify-email-title" className="text-center mb-2">
                        Verify Your Email
                      </h2>
                      <p className="text-center mb-3">
                        Enter the OTP sent to your email address.
                      </p>

                      <form onSubmit={handleVerifyEmail}>
                        <div className="form-group">
                          <label htmlFor="verification-email">Email address *</label>
                          <input
                            type="email"
                            className="form-control"
                            id="verification-email"
                            value={verificationEmail}
                            autoComplete="email"
                            readOnly
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="verification-otp">Verification code *</label>
                          <input
                            type="text"
                            className="form-control"
                            id="verification-otp"
                            value={verificationOtp}
                            onChange={(event) => setVerificationOtp(event.target.value)}
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            required
                          />
                        </div>

                        {verificationError && (
                          <div className="alert alert-danger" role="alert" aria-live="polite">
                            {verificationError}
                          </div>
                        )}

                        <div className="form-footer d-flex align-items-center justify-content-between">
                          <button
                            type="submit"
                            className="btn btn-outline-primary-2"
                            disabled={isVerifying || isLoading}
                          >
                            <span>{isVerifying ? "VERIFYING..." : "ENTER"}</span>
                            <i className="icon-long-arrow-right"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-link"
                            onClick={handleEnterLater}
                            disabled={isVerifying || isLoading}
                          >
                            Enter later
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
