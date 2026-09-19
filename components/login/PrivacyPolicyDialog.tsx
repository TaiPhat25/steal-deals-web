"use client";

import { useRef } from "react";
import { useDialogFocusTrap } from "@/components/login/use-dialog-focus-trap";
import { BRAND_NAME } from "@/lib/brand";

type PrivacyPolicyDialogProps = {
  onClose: () => void;
};

export default function PrivacyPolicyDialog({
  onClose,
}: PrivacyPolicyDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogFocusTrap({
    dialogRef,
    initialFocusSelector: "#privacy-policy-title",
    onEscape: onClose,
  });

  return (
    <>
      <div className="modal-backdrop fade show" aria-hidden="true" />
      <div
        ref={dialogRef}
        className="modal fade show privacy-policy-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-policy-title"
        aria-describedby="privacy-policy-summary"
        tabIndex={-1}
        style={{ display: "block" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content privacy-policy-dialog">
            <header className="privacy-policy-dialog__header">
              <h2 id="privacy-policy-title" tabIndex={-1}>
                {BRAND_NAME} Privacy Policy
              </h2>
              <p>Last updated: September 9, 2026</p>
            </header>

            <div className="privacy-policy-dialog__body">
              <p id="privacy-policy-summary">
                This policy explains how {BRAND_NAME} collects, uses, and
                protects information when you create an account and use our
                food rescue marketplace.
              </p>

              <section>
                <h3>1. Information we collect</h3>
                <p>
                  We may collect account and contact details, saved addresses,
                  store application details, order and pickup activity, and
                  technical information needed to operate and secure the
                  service.
                </p>
              </section>

              <section>
                <h3>2. How we use information</h3>
                <p>
                  We use your information to create and manage your account,
                  provide marketplace and pickup features, send account and
                  service notifications, respond to support requests, prevent
                  misuse, and improve {BRAND_NAME}.
                </p>
              </section>

              <section>
                <h3>3. When information is shared</h3>
                <p>
                  We share information only as needed with stores involved in
                  your activity, service providers that support the platform,
                  or authorities when required by law. We do not sell your
                  personal information.
                </p>
              </section>

              <section>
                <h3>4. Retention and security</h3>
                <p>
                  We retain information for as long as needed to provide the
                  service, meet legal obligations, resolve disputes, and
                  protect the platform. We use reasonable technical and
                  organizational safeguards, but no system can guarantee
                  absolute security.
                </p>
              </section>

              <section>
                <h3>5. Your choices</h3>
                <p>
                  You may review or update available account information from
                  your profile. You may contact {BRAND_NAME} to request help
                  correcting or deleting personal information, subject to
                  legal and operational retention requirements.
                </p>
              </section>

              <section>
                <h3>6. Cookies and session data</h3>
                <p>
                  {BRAND_NAME} uses cookies and similar technologies that are
                  necessary for authentication, session security, and core
                  application functionality.
                </p>
              </section>

              <section>
                <h3>7. Policy updates and contact</h3>
                <p>
                  We may update this policy as the service changes. The latest
                  version will be available through {BRAND_NAME}. Questions or
                  privacy requests can be submitted through the Contact Us
                  page.
                </p>
              </section>
            </div>

            <footer className="privacy-policy-dialog__footer">
              <button
                type="button"
                className="btn btn-outline-primary-2 privacy-policy-dialog__confirm"
                onClick={onClose}
              >
                OK
              </button>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
