import { useEffect, useRef, type Dispatch, type SetStateAction, type SubmitEvent } from "react";
import { BRAND_NAME } from "@/lib/brand";
import type { UserAddress, UserProfile } from "@/lib/api/store-types";
import AddressMapPicker from "@/components/location/AddressMapPicker";
import OtpInput from "@/components/auth/OtpInput";
import ResendOtpButton from "@/components/auth/ResendOtpButton";
import type { AddressForm, PasswordForm, SellerApplicationForm } from "./profile-types";

type ProfileModalsProps = {
  profile: UserProfile | null;
  showVerificationModal: boolean;
  verificationOtp: string;
  setVerificationOtp: Dispatch<SetStateAction<string>>;
  verificationError: string | null;
  isVerifying: boolean;
  onVerifyEmail: (event: SubmitEvent<HTMLFormElement>) => void;
  onEnterLater: () => void;
  onResentVerification: () => void;
  showPhoneModal: boolean;
  showAddressModal: boolean;
  editingAddressId: string | null;
  fullNameInput: string;
  setFullNameInput: Dispatch<SetStateAction<string>>;
  phoneInput: string;
  setPhoneInput: Dispatch<SetStateAction<string>>;
  addressForm: AddressForm;
  setAddressForm: Dispatch<SetStateAction<AddressForm>>;
  onSaveProfile: (event: SubmitEvent<HTMLFormElement>) => void;
  onSaveAddress: (event: SubmitEvent<HTMLFormElement>) => void;
  editError: string | null;
  isSavingProfile: boolean;
  isSavingAddress: boolean;
  onCloseEditModal: () => void;
  showPasswordModal: boolean;
  passwordForm: PasswordForm;
  setPasswordForm: Dispatch<SetStateAction<PasswordForm>>;
  passwordError: string | null;
  isChangingPassword: boolean;
  onChangePassword: (event: SubmitEvent<HTMLFormElement>) => void;
  addressPendingDelete: UserAddress | null;
  deletingAddressId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  showSellerModal: boolean;
  sellerApplicationSubmitted: boolean;
  onCloseSellerModal: () => void;
  sellerApplication: SellerApplicationForm;
  onSellerApplicationChange: (field: keyof SellerApplicationForm, value: string) => void;
  onSubmitSellerApplication: (event: SubmitEvent<HTMLFormElement>) => void;
  sellerApplicationError: string | null;
  isSubmittingSellerApplication: boolean;
};

export default function ProfileModals({
  profile,
  showVerificationModal,
  verificationOtp,
  setVerificationOtp,
  verificationError,
  isVerifying,
  onVerifyEmail,
  onEnterLater,
  onResentVerification,
  showPhoneModal,
  showAddressModal,
  editingAddressId,
  fullNameInput,
  setFullNameInput,
  phoneInput,
  setPhoneInput,
  addressForm,
  setAddressForm,
  onSaveProfile,
  onSaveAddress,
  editError,
  isSavingProfile,
  isSavingAddress,
  onCloseEditModal,
  showPasswordModal,
  passwordForm,
  setPasswordForm,
  passwordError,
  isChangingPassword,
  onChangePassword,
  addressPendingDelete,
  deletingAddressId,
  onCancelDelete,
  onConfirmDelete,
  showSellerModal,
  sellerApplicationSubmitted,
  onCloseSellerModal,
  sellerApplication,
  onSellerApplicationChange,
  onSubmitSellerApplication,
  sellerApplicationError,
  isSubmittingSellerApplication,
}: ProfileModalsProps) {
  const modalRootRef = useRef<HTMLDivElement>(null);
  const modalOpen =
    showVerificationModal ||
    showPhoneModal ||
    showAddressModal ||
    showPasswordModal ||
    Boolean(addressPendingDelete) ||
    showSellerModal;
  const escapeActionRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    escapeActionRef.current = () => {
      if (showVerificationModal) {
        onEnterLater();
      } else if (addressPendingDelete) {
        onCancelDelete();
      } else if (showSellerModal) {
        onCloseSellerModal();
      } else {
        onCloseEditModal();
      }
    };
  }, [addressPendingDelete, onCancelDelete, onCloseEditModal, onCloseSellerModal, onEnterLater, showSellerModal, showVerificationModal]);

  useEffect(() => {
    if (!modalOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const modalRoot = modalRootRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusableElements = () =>
      Array.from(modalRoot?.querySelectorAll<HTMLElement>(focusableSelector) ?? []).filter(
        (element) => element.getAttribute("aria-hidden") !== "true" && element.offsetParent !== null,
      );

    getFocusableElements()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        escapeActionRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [modalOpen]);

  return (
    <div ref={modalRootRef} className="profile-modal-root">
      {showVerificationModal && profile && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show profile-form-modal" role="dialog" aria-modal="true" aria-labelledby="profile-verify-email-title" aria-describedby="profile-verify-email-description" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content"><div className="modal-body"><div className="form-box"><div className="form-tab">
                <h2 id="profile-verify-email-title" className="mb-2">Verify Your Email</h2>
                <p id="profile-verify-email-description" className="mb-3">Enter the OTP sent to your email address.</p>
                <form onSubmit={onVerifyEmail}>
                  <div className="form-group"><label htmlFor="profile-verification-email">Email address *</label><input type="email" className="form-control" id="profile-verification-email" value={profile.email ?? ""} autoComplete="email" readOnly required /></div>
                  <div className="form-group">
                    <span id="profile-verification-code-label" className="form-label">Verification code *</span>
                    <p id="profile-verification-code-help" className="profile-form-modal__hint mb-2">Enter the 6-digit code. You can paste the full code into any box.</p>
                    <OtpInput value={verificationOtp} onChange={setVerificationOtp} disabled={isVerifying} idPrefix="profile-verification-otp" ariaLabelledBy="profile-verification-code-label" ariaDescribedBy="profile-verification-code-help" invalid={Boolean(verificationError)} />
                  </div>
                  {verificationError && <div className="alert alert-danger" role="alert" aria-live="polite">{verificationError}</div>}
                  <div className="profile-form-modal__footer">
                    <button type="submit" className="btn btn-outline-primary-2 profile-form-modal__submit" disabled={isVerifying}><span>{isVerifying ? "VERIFYING..." : "VERIFY EMAIL"}</span><i className="icon-long-arrow-right" aria-hidden="true" /></button>
                    <div className="profile-form-modal__secondary-actions">
                      <ResendOtpButton email={profile.email ?? ""} disabled={isVerifying} onResent={onResentVerification} />
                      <button type="button" className="btn btn-link" onClick={onEnterLater} disabled={isVerifying}>Enter later</button>
                    </div>
                  </div>
                </form>
              </div></div></div></div>
            </div>
          </div>
        </>
      )}

      {(showPhoneModal || showAddressModal) && profile && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show profile-form-modal profile-edit-modal" role="dialog" aria-modal="true" aria-labelledby={showPhoneModal ? "profile-edit-profile-title" : "profile-edit-address-title"} style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered" role="document"><div className="modal-content"><div className="modal-body"><div className="form-box"><div className="form-tab">
              <h2 id={showPhoneModal ? "profile-edit-profile-title" : "profile-edit-address-title"} className="mb-2">{showPhoneModal ? "Edit Personal Information" : editingAddressId ? "Edit Address" : "Add Address"}</h2>
              <p className="mb-3">{showPhoneModal ? "Keep your account details up to date." : "Save an address for delivery orders and distance calculations."}</p>
              <form onSubmit={showPhoneModal ? onSaveProfile : onSaveAddress}>
                {showPhoneModal ? (
                  <>
                    <div className="form-group"><label htmlFor="profile-edit-full-name">Full name *</label><input type="text" className="form-control" id="profile-edit-full-name" value={fullNameInput} onChange={(event) => setFullNameInput(event.target.value)} autoComplete="name" maxLength={200} required /></div>
                    <div className="form-group"><label htmlFor="profile-edit-phone">Phone number</label><input type="tel" className="form-control" id="profile-edit-phone" value={phoneInput} onChange={(event) => setPhoneInput(event.target.value)} autoComplete="tel" /></div>
                  </>
                ) : (
                  <>
                    <div className="form-group"><label htmlFor="profile-edit-address-label">Label *</label><input type="text" className="form-control" id="profile-edit-address-label" value={addressForm.label} onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))} placeholder="Home, work, or another label" required /></div>
                    <AddressMapPicker label="Find address on map" showAddressFields={false} value={{ address: addressForm.address, commune: addressForm.commune, province: addressForm.province, latitude: addressForm.latitude ? Number(addressForm.latitude) : null, longitude: addressForm.longitude ? Number(addressForm.longitude) : null }} onChange={(location) => setAddressForm((current) => ({ ...current, address: location.address, commune: location.commune ?? "", province: location.province ?? "", latitude: location.latitude?.toString() ?? "", longitude: location.longitude?.toString() ?? "" }))} />
                    <div className="form-group"><label htmlFor="profile-edit-address">Street address / Specific address *</label><input type="text" className="form-control" id="profile-edit-address" value={addressForm.address} onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))} autoComplete="street-address" required /></div>
                    <div className="row"><div className="col-sm-6"><div className="form-group"><label htmlFor="profile-edit-commune">Ward / Commune *</label><input type="text" className="form-control" id="profile-edit-commune" value={addressForm.commune} onChange={(event) => setAddressForm((current) => ({ ...current, commune: event.target.value }))} required /></div></div><div className="col-sm-6"><div className="form-group"><label htmlFor="profile-edit-province">City / Province *</label><input type="text" className="form-control" id="profile-edit-province" value={addressForm.province} onChange={(event) => setAddressForm((current) => ({ ...current, province: event.target.value }))} autoComplete="address-level1" required /></div></div></div>
                    <div className="row"><div className="col-sm-6"><div className="form-group"><label htmlFor="profile-edit-latitude">Latitude</label><input type="number" className="form-control" id="profile-edit-latitude" value={addressForm.latitude} onChange={(event) => setAddressForm((current) => ({ ...current, latitude: event.target.value }))} inputMode="decimal" min="-90" max="90" step="any" placeholder="e.g. 10.7769" /></div></div><div className="col-sm-6"><div className="form-group"><label htmlFor="profile-edit-longitude">Longitude</label><input type="number" className="form-control" id="profile-edit-longitude" value={addressForm.longitude} onChange={(event) => setAddressForm((current) => ({ ...current, longitude: event.target.value }))} inputMode="decimal" min="-180" max="180" step="any" placeholder="e.g. 106.7009" /></div></div></div>
                    <div className="custom-control custom-checkbox mb-3"><input type="checkbox" className="custom-control-input" id="profile-edit-address-default" checked={addressForm.isDefault} onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))} /><label className="custom-control-label" htmlFor="profile-edit-address-default">Make this my default address</label></div>
                  </>
                )}
                {editError && <div className="alert alert-danger" role="alert" aria-live="polite">{editError}</div>}
                <div className="form-footer profile-form-modal__footer"><button type="submit" className="btn btn-outline-primary-2" disabled={showPhoneModal ? isSavingProfile : isSavingAddress}><span>{showPhoneModal ? isSavingProfile ? "SAVING..." : "SAVE CHANGES" : isSavingAddress ? "SAVING..." : editingAddressId ? "UPDATE ADDRESS" : "SAVE ADDRESS"}</span><i className="icon-long-arrow-right" /></button><button type="button" className="btn btn-link" onClick={onCloseEditModal} disabled={showPhoneModal ? isSavingProfile : isSavingAddress}>Cancel</button></div>
              </form>
            </div></div></div></div></div>
          </div>
        </>
      )}

      {showPasswordModal && (
        <>
          <div className="modal-backdrop fade show" /><div className="modal fade show profile-form-modal profile-edit-modal" role="dialog" aria-modal="true" aria-labelledby="profile-change-password-title" style={{ display: "block" }}><div className="modal-dialog modal-dialog-centered" role="document"><div className="modal-content"><div className="modal-body"><div className="form-box"><div className="form-tab">
            <h2 id="profile-change-password-title" className="mb-2">Change password</h2><p className="mb-3">Use a new password with at least 8 characters.</p>
            <form onSubmit={onChangePassword}>
              <div className="form-group"><label htmlFor="profile-current-password">Current password *</label><input type="password" className="form-control" id="profile-current-password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} autoComplete="current-password" required /></div>
              <div className="form-group"><label htmlFor="profile-new-password">New password *</label><input type="password" className="form-control" id="profile-new-password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} autoComplete="new-password" minLength={8} required /></div>
              <div className="form-group"><label htmlFor="profile-confirm-password">Confirm new password *</label><input type="password" className="form-control" id="profile-confirm-password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} autoComplete="new-password" minLength={8} required /></div>
              {passwordError && <div className="alert alert-danger" role="alert" aria-live="polite">{passwordError}</div>}
              <div className="form-footer profile-form-modal__footer"><button type="submit" className="btn btn-outline-primary-2" disabled={isChangingPassword}><span>{isChangingPassword ? "CHANGING..." : "CHANGE PASSWORD"}</span><i className="icon-long-arrow-right" aria-hidden="true" /></button><button type="button" className="btn btn-link" onClick={onCloseEditModal} disabled={isChangingPassword}>Cancel</button></div>
            </form>
          </div></div></div></div></div></div>
        </>
      )}

      {addressPendingDelete && (
        <>
          <div className="modal-backdrop fade show" /><div className="modal fade show profile-form-modal profile-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="profile-delete-address-title" aria-describedby="profile-delete-address-description" style={{ display: "block" }}><div className="modal-dialog modal-dialog-centered" role="document"><div className="modal-content"><div className="modal-body profile-confirm-modal__body">
            <h2 id="profile-delete-address-title" className="mb-2">Delete address?</h2><p id="profile-delete-address-description" className="mb-4">Are you sure you want to delete {addressPendingDelete.label || "this address"}? This action cannot be undone.</p><div className="profile-confirm-modal__actions"><button type="button" className="btn btn-link" onClick={onCancelDelete} disabled={Boolean(deletingAddressId)}>Cancel</button><button type="button" className="btn btn-danger" onClick={onConfirmDelete} disabled={Boolean(deletingAddressId)}>{deletingAddressId ? "Deleting..." : "Delete address"}</button></div>
          </div></div></div></div>
        </>
      )}

      {showSellerModal && profile && (
        <>
          <div className="modal-backdrop fade show" /><div className="modal fade show profile-form-modal profile-edit-modal" role="dialog" aria-modal="true" aria-labelledby="seller-application-title" style={{ display: "block" }}><div className="modal-dialog modal-dialog-centered" role="document"><div className="modal-content"><div className="modal-body"><div className="form-box"><div className="form-tab">
            <h2 id="seller-application-title" className="mb-2">Become a Seller</h2>
            {sellerApplicationSubmitted ? <div className="text-center"><p className="mb-3">Your store application has been submitted and is waiting for admin approval.</p><button type="button" className="btn btn-outline-primary-2" onClick={onCloseSellerModal}><span>BACK TO PROFILE</span><i className="icon-long-arrow-right" /></button></div> : <><p className="mb-3">Tell us about the store you want to register on {BRAND_NAME}.</p><form onSubmit={onSubmitSellerApplication}>
              <div className="form-group"><label htmlFor="seller-store-name">Store name *</label><input type="text" className="form-control" id="seller-store-name" value={sellerApplication.storeName} onChange={(event) => onSellerApplicationChange("storeName", event.target.value)} autoComplete="organization" required /></div>
              <div className="form-group"><label htmlFor="seller-store-description">Store description</label><textarea className="form-control" id="seller-store-description" rows={3} value={sellerApplication.description} onChange={(event) => onSellerApplicationChange("description", event.target.value)} placeholder="What kind of food will your store offer?" /></div>
              <div className="form-group"><label htmlFor="seller-store-address">Store address / Specific address*</label><input type="text" className="form-control" id="seller-store-address" value={sellerApplication.address} onChange={(event) => onSellerApplicationChange("address", event.target.value)} autoComplete="street-address" required /></div>
              <div className="form-group"><label htmlFor="seller-store-commune">Ward / Commune *</label><input type="text" className="form-control" id="seller-store-commune" value={sellerApplication.commune} onChange={(event) => onSellerApplicationChange("commune", event.target.value)} autoComplete="address-level3" required /></div>
              <div className="form-group"><label htmlFor="seller-store-province">City / Province *</label><input type="text" className="form-control" id="seller-store-province" value={sellerApplication.province} onChange={(event) => onSellerApplicationChange("province", event.target.value)} autoComplete="address-level1" required /></div>
              <div className="form-group"><label htmlFor="seller-store-phone">Contact phone *</label><input type="tel" className="form-control" id="seller-store-phone" value={sellerApplication.phone} onChange={(event) => onSellerApplicationChange("phone", event.target.value)} autoComplete="tel" required /></div>
              <div className="form-group"><label htmlFor="seller-store-bank-account">Bank account</label><input type="text" className="form-control" id="seller-store-bank-account" value={sellerApplication.bankAccount} onChange={(event) => onSellerApplicationChange("bankAccount", event.target.value)} autoComplete="off" /></div>
              <div className="form-group"><label htmlFor="seller-store-latitude">Latitude</label><input type="number" className="form-control" id="seller-store-latitude" value={sellerApplication.latitude} onChange={(event) => onSellerApplicationChange("latitude", event.target.value)} inputMode="decimal" min="-90" max="90" step="any" placeholder="e.g. 10.7769" /></div>
              <div className="form-group"><label htmlFor="seller-store-longitude">Longitude</label><input type="number" className="form-control" id="seller-store-longitude" value={sellerApplication.longitude} onChange={(event) => onSellerApplicationChange("longitude", event.target.value)} inputMode="decimal" min="-180" max="180" step="any" placeholder="e.g. 106.7009" /></div>
              <div className="form-group"><label htmlFor="seller-store-license-url">License URL</label><input type="url" className="form-control" id="seller-store-license-url" value={sellerApplication.licenseUrl} onChange={(event) => onSellerApplicationChange("licenseUrl", event.target.value)} autoComplete="url" placeholder="https://example.com/license" /></div>
              {sellerApplicationError && <div className="alert alert-danger" role="alert" aria-live="polite">{sellerApplicationError}</div>}
              <div className="form-footer profile-form-modal__footer"><button type="submit" className="btn btn-outline-primary-2" disabled={isSubmittingSellerApplication}><span>{isSubmittingSellerApplication ? "SUBMITTING..." : "SUBMIT APPLICATION"}</span><i className="icon-long-arrow-right" /></button><button type="button" className="btn btn-link" onClick={onCloseSellerModal}>Cancel</button></div>
            </form></>}
          </div></div></div></div></div></div>
        </>
      )}
    </div>
  );
}
