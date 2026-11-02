import Image from "next/image";
import Link from "next/link";
import type { ChangeEvent, RefObject } from "react";
import { shouldUseUnoptimizedImage } from "@/lib/image-assets";
import type { UserAddress, UserProfile } from "@/lib/api/store-types";

type ProfileAccountSectionsProps = {
  profile: UserProfile;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  isUploadingAvatar: boolean;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isSeller: boolean;
  onOpenSellerModal: () => void;
  selectedAddress: UserAddress | null;
  onSelectAddress: (addressId: string) => void;
  onOpenAddressModal: (address?: UserAddress) => void;
  onDeleteAddress: (address: UserAddress) => void;
  deletingAddressId: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function getInitials(fullName: string | null, email: string | null) {
  const source = fullName?.trim() || email?.trim() || "U";
  const words = source.split(/\s+/).filter(Boolean);

  return words.length > 1
    ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
    : source.slice(0, 2).toUpperCase();
}

export default function ProfileAccountSections({
  profile,
  avatarInputRef,
  isUploadingAvatar,
  onAvatarChange,
  isSeller,
  onOpenSellerModal,
  selectedAddress,
  onSelectAddress,
  onOpenAddressModal,
  onDeleteAddress,
  deletingAddressId,
}: ProfileAccountSectionsProps) {
  return (
    <section aria-labelledby="profile-heading">
      <div className="mb-4">
        <h2 id="profile-heading" className="mb-1">Account details</h2>
        <p className="mb-2">Manage and review your account information.</p>
      </div>

      <div className="profile-account-summary border p-4 mb-2">
        <div className="profile-account-summary__identity">
          <div className="profile-account-summary__avatar" role="img" aria-label="Profile photo">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={`${profile.fullName || "Account"}'s profile photo`}
                width={96}
                height={96}
                unoptimized={shouldUseUnoptimizedImage(profile.avatarUrl)}
              />
            ) : (
              <span aria-hidden="true">{getInitials(profile.fullName, profile.email)}</span>
            )}
          </div>
          <div>
            <span className={`badge ${profile.isActive ? "badge-success" : "badge-secondary"} mb-1`}>
              {profile.isActive ? "Active" : "Inactive"}
            </span>
            <h3 className="profile-account-summary__name mb-1">
              {profile.fullName || "Complete your profile"}
            </h3>
            <p className="mb-0">{profile.roles.length ? profile.roles.join(", ") : "Customer"}</p>
          </div>
        </div>
        <div className="profile-account-summary__actions">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={onAvatarChange}
            aria-label="Choose a profile photo"
          />
          <button
            type="button"
            className="btn btn-outline-primary-2"
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploadingAvatar}
          >
            {isUploadingAvatar ? "UPLOADING..." : "CHANGE PHOTO"}
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="border p-4 mb-4">
            <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
              <h3 className="mb-0">Personal information</h3>
              <Link href="/profile?edit=profile" scroll={false} className="profile-action-link text-primary">
                Edit
              </Link>
            </div>
            <dl className="row mb-0">
              <dt className="col-sm-4">Full name</dt>
              <dd className="col-sm-8">{profile.fullName || "Not provided"}</dd>
              <dt className="col-sm-4">Email address</dt>
              <dd className="col-sm-8">{profile.email || "Not provided"}</dd>
              <dt className="col-sm-4">Phone number</dt>
              <dd className="col-sm-8">{profile.phone || "Not provided"}</dd>
              <dt className="col-sm-4">Email verification</dt>
              <dd className="col-sm-8">
                <span
                  className={`badge ${profile.isEmailVerified ? "badge-success" : "badge-danger"}`}
                  style={{ fontSize: "inherit", fontWeight: 400 }}
                >
                  {profile.isEmailVerified ? "Verified" : "Not verified"}
                </span>
                {!profile.isEmailVerified && (
                  <Link href="/profile?verify=email" scroll={false} className="profile-action-link ml-2 text-primary">
                    Verify
                  </Link>
                )}
              </dd>
              <dt className="col-sm-4">Member since</dt>
              <dd className="col-sm-8">{formatDate(profile.createdAt)}</dd>
            </dl>
          </div>

          <div className="profile-seller-card border p-4 mb-4">
            {isSeller ? (
              <>
                <h3 className="mb-2">Seller dashboard</h3>
                <p className="mb-3">Manage your store, surprise bags, orders, and customer reviews.</p>
                <Link href="/seller" className="btn btn-primary">Open Seller Dashboard</Link>
              </>
            ) : (
              <>
                <h3 className="mb-2">Become a Seller</h3>
                <p className="mb-3">
                  Reach local buyers and help reduce food waste by offering your surplus food on StealDeals.
                </p>
                <button type="button" className="btn btn-primary" onClick={onOpenSellerModal}>
                  Become a Seller
                </button>
              </>
            )}
          </div>

          <div className="profile-security-card border p-4 mb-4">
            <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
              <h3 className="mb-0">Security</h3>
              <Link href="/profile?edit=password" scroll={false} className="profile-action-link text-primary">
                Change password
              </Link>
            </div>
            <p className="mb-0">Keep your account secure with a strong password that you do not reuse elsewhere.</p>
          </div>

          <div className="profile-account-shortcuts border p-4 mb-4">
            <h3 className="mb-2">Account shortcuts</h3>
            <p className="mb-3">Quick access to your orders and product reviews.</p>
            <div className="profile-account-shortcuts__links d-flex flex-wrap">
              <Link href="/orders" className="profile-action-link text-primary">Orders</Link>
              <Link href="/orders#order-reviews" className="profile-action-link text-primary">Reviews</Link>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="profile-addresses border p-4 mb-4">
            <h3 className="profile-addresses__title mb-3">Addresses</h3>
            {profile.userAddresses.length === 0 ? (
              <p className="profile-addresses__empty mb-3">No addresses saved.</p>
            ) : (
              <>
                <div className="profile-addresses__selector">
                  <label htmlFor="profile-saved-address" className="sr-only">Select a saved address</label>
                  <select
                    id="profile-saved-address"
                    className="form-control"
                    value={selectedAddress?.id ?? ""}
                    onChange={(event) => onSelectAddress(event.target.value)}
                  >
                    {profile.userAddresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.label || "Address"}{address.isDefault ? " (Default)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedAddress && (
                  <div className="profile-addresses__details">
                    <p className="profile-addresses__address mb-2">
                      <span className="d-block">{selectedAddress.address}</span>
                      <span className="d-block">{selectedAddress.commune}</span>
                      <span className="d-block">{selectedAddress.province}</span>
                    </p>
                    <div className="profile-addresses__actions d-flex flex-wrap">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary"
                        onClick={() => onOpenAddressModal(selectedAddress)}
                        aria-label={`Edit ${selectedAddress.label || "address"}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-danger"
                        onClick={() => onDeleteAddress(selectedAddress)}
                        disabled={deletingAddressId === selectedAddress.id}
                        aria-label={`Delete ${selectedAddress.label || "address"}`}
                      >
                        {deletingAddressId === selectedAddress.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            <button
              type="button"
              className="profile-addresses__add profile-action-link btn btn-link"
              onClick={() => onOpenAddressModal()}
            >
              Add Address
            </button>
          </div>

          {profile.userTrustScore && (
            <div className="border p-4">
              <h3 className="mb-3">Trust score</h3>
              <p className="h3 mb-2">{profile.userTrustScore.score}</p>
              <p className="mb-0">Based on {profile.userTrustScore.totalOrders} orders</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
